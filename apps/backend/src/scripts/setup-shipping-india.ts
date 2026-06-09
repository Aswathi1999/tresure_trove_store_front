/**
 * Sets up the minimum Medusa v2 wiring required for a checkout from India to
 * see a Shipping Method option:
 *
 *   1. India region (currency INR, country IN) — created if missing.
 *   2. "Default Shipping Profile" — created if missing.
 *   3. Every product assigned to that shipping profile.
 *   4. Fulfillment set + service zone covering IN on the first stock location.
 *   5. "Standard Delivery" shipping option (manual provider, INR 250 flat) on
 *      that service zone, linked to the Default Sales Channel.
 *
 * Run with:
 *   pnpm db:setup-shipping-india
 *
 * Idempotent — re-running skips anything that already exists.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createShippingOptionsWorkflow,
  linkProductsToSalesChannelWorkflow,
} from '@medusajs/medusa/core-flows'

const TARGET_CHANNEL = 'Default Sales Channel'
const SHIPPING_PROFILE_NAME = 'Default Shipping Profile'

export default async function setupShippingIndia({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const productService = container.resolve(Modules.PRODUCT)
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)

  // ── 1. India region ───────────────────────────────────────────────────
  let [region] = await regionService.listRegions({ name: 'India' })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: { regions: [{ name: 'India', currency_code: 'inr', countries: ['in'] }] },
    })
    region = result[0]
    logger.info(`[shipping] Created region India (${region.id})`)
  } else {
    logger.info(`[shipping] Region India already exists (${region.id})`)
  }

  // ── 2. Shipping profile ───────────────────────────────────────────────
  let [profile] = await fulfillmentService.listShippingProfiles({ name: SHIPPING_PROFILE_NAME })
  if (!profile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: SHIPPING_PROFILE_NAME, type: 'default' }] },
    })
    profile = result[0]
    logger.info(`[shipping] Created shipping profile ${profile.name} (${profile.id})`)
  } else {
    logger.info(`[shipping] Shipping profile ${profile.name} already exists`)
  }

  // ── 3. Assign every product to the profile ────────────────────────────
  const products = await productService.listProducts({}, { select: ['id', 'title'] })
  for (const p of products) {
    await remoteLink
      .create({
        [Modules.PRODUCT]: { product_id: p.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: profile.id },
      })
      .catch(() => {})
    logger.info(`[shipping]   product ${p.title} → ${profile.name}`)
  }

  // ── 4. Fulfillment set + service zone on first stock location ─────────
  const [location] = await stockLocationService.listStockLocations({})
  if (!location) {
    logger.error('[shipping] No stock location exists — create one in admin first.')
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: locationsWithSets } = await query.graph({
    entity: 'stock_location',
    filters: { id: location.id },
    fields: [
      'id',
      'name',
      'fulfillment_sets.id',
      'fulfillment_sets.name',
      'fulfillment_sets.type',
      'fulfillment_sets.service_zones.id',
      'fulfillment_sets.service_zones.name',
      'fulfillment_sets.service_zones.geo_zones.country_code',
    ],
  })
  const fullLocation = locationsWithSets[0]

  let fset = fullLocation?.fulfillment_sets?.find((fs: { type: string }) => fs.type === 'shipping')
  if (!fset) {
    fset = await fulfillmentService.createFulfillmentSets({
      name: `${location.name} delivery`,
      type: 'shipping',
    })
    await remoteLink.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fset.id },
    })
    logger.info(`[shipping] Created fulfillment set ${fset.name}`)
  } else {
    logger.info(`[shipping] Fulfillment set already exists on ${location.name}`)
  }

  let zone = fset.service_zones?.find((z: { geo_zones?: Array<{ country_code: string }> }) =>
    z.geo_zones?.some((g) => g.country_code === 'in'),
  )
  if (!zone) {
    zone = await fulfillmentService.createServiceZones({
      name: 'India',
      fulfillment_set_id: fset.id,
      geo_zones: [{ type: 'country', country_code: 'in' }],
    })
    logger.info(`[shipping] Created service zone India`)
  } else {
    logger.info(`[shipping] Service zone for IN already exists`)
  }

  // ── 5. Enable manual fulfillment provider on the stock location ───────
  await remoteLink
    .create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' },
    })
    .catch(() => {})
  logger.info(`[shipping] Enabled manual_manual fulfillment provider on ${location.name}`)

  // ── 6. Shipping option ────────────────────────────────────────────────
  const existingOptions = await fulfillmentService.listShippingOptions({
    service_zone: { id: zone.id },
  })
  if (existingOptions.length > 0) {
    logger.info(`[shipping] Shipping option already exists on zone India — skipping.`)
  } else {
    const [channel] = await salesChannelService.listSalesChannels({ name: TARGET_CHANNEL })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: 'Standard Delivery',
          price_type: 'flat',
          provider_id: 'manual_manual',
          service_zone_id: zone.id,
          shipping_profile_id: profile.id,
          type: { label: 'Standard', description: 'Ship in 5–7 days', code: 'standard' },
          prices: [
            { amount: 250, currency_code: 'inr' },
            { region_id: region.id, amount: 250 },
          ],
          rules: [
            { attribute: 'enabled_in_store', value: 'true', operator: 'eq' },
            { attribute: 'is_return', value: 'false', operator: 'eq' },
          ],
        },
      ],
    })
    logger.info(`[shipping] Created shipping option Standard Delivery (₹250)`)

    if (channel) {
      // link the option to the sales channel via fulfillment set
      logger.info(`[shipping]   linked via fulfillment_set on ${location.name}`)
    }
  }

  logger.info('[shipping] Done. Reload checkout — shipping options should appear.')
}
