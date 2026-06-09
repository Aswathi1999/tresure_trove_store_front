/**
 * One-shot fixer for the common Medusa v2 setup gap: products and stock
 * locations created in the admin without being linked to a sales channel.
 *
 * When the storefront's publishable API key is scoped to "Default Sales
 * Channel" but the inventory's stock location isn't on that channel (or the
 * product isn't either), /store/products returns inventory_quantity = 0 and
 * the PDP shows "Out of Stock" even though admin shows units available.
 *
 * Run with:
 *   pnpm db:link-everything
 *
 * Idempotent — uses Medusa's link workflows which dedupe existing links.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  linkSalesChannelsToStockLocationWorkflow,
  linkProductsToSalesChannelWorkflow,
} from '@medusajs/medusa/core-flows'

const TARGET_CHANNEL = 'Default Sales Channel'

export default async function linkEverything({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const productService = container.resolve(Modules.PRODUCT)

  const [channel] = await salesChannelService.listSalesChannels({ name: TARGET_CHANNEL })
  if (!channel) {
    logger.error(`[link] No sales channel named "${TARGET_CHANNEL}" — aborting.`)
    return
  }
  logger.info(`[link] Target channel: ${channel.name} (${channel.id})`)

  const locations = await stockLocationService.listStockLocations({})
  logger.info(`[link] Found ${locations.length} stock location(s)`)
  for (const loc of locations) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: loc.id, add: [channel.id] },
    })
    logger.info(`[link]   stock_location ${loc.name} → ${channel.name}`)
  }

  const products = await productService.listProducts({}, { select: ['id', 'title'] })
  logger.info(`[link] Found ${products.length} product(s)`)
  for (const p of products) {
    await linkProductsToSalesChannelWorkflow(container).run({
      input: { id: channel.id, add: [p.id] },
    })
    logger.info(`[link]   product ${p.title} → ${channel.name}`)
  }

  logger.info('[link] Done. Reload the storefront — stock should now appear.')
}
