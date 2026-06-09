/**
 * Seed script — creates India (INR), UAE (AED), and SEA (USD) regions with
 * correct tax rates for Treasure Trove's three-region global setup.
 *
 * Tax rates:
 *   India   → 18% GST
 *   UAE     → 5% VAT
 *   SEA     → 0% (tax-free: SG, MY, TH, PH, ID, VN)
 *
 * Run with:
 *   pnpm db:seed-regions
 *
 * Idempotent — existing regions and tax regions are skipped, not duplicated.
 * After seeding, link payment providers via Medusa Admin:
 *   India  → Razorpay (pp_razorpay_razorpay)
 *   UAE    → Stripe   (pp_stripe_stripe)
 *   SEA    → Stripe   (pp_stripe_stripe)
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IRegionModuleService, ITaxModuleService } from '@medusajs/types'

const REGIONS = [
  {
    name: 'India',
    currency_code: 'inr',
    countries: ['in'],
    taxRegions: [{ country_code: 'IN', name: 'GST', rate: 18, code: 'GST' }],
  },
  {
    name: 'UAE',
    currency_code: 'aed',
    countries: ['ae'],
    taxRegions: [{ country_code: 'AE', name: 'VAT', rate: 5, code: 'VAT' }],
  },
  {
    name: 'Southeast Asia',
    currency_code: 'usd',
    countries: ['sg', 'my', 'th', 'ph', 'id', 'vn'],
    taxRegions: [
      { country_code: 'SG', name: 'Tax Free', rate: 0, code: 'TAX_FREE' },
      { country_code: 'MY', name: 'Tax Free', rate: 0, code: 'TAX_FREE' },
      { country_code: 'TH', name: 'Tax Free', rate: 0, code: 'TAX_FREE' },
      { country_code: 'PH', name: 'Tax Free', rate: 0, code: 'TAX_FREE' },
      { country_code: 'ID', name: 'Tax Free', rate: 0, code: 'TAX_FREE' },
      { country_code: 'VN', name: 'Tax Free', rate: 0, code: 'TAX_FREE' },
    ],
  },
] as const

export default async function seedRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService: IRegionModuleService = container.resolve(Modules.REGION)
  const taxService: ITaxModuleService = container.resolve(Modules.TAX)

  logger.info('[seed-regions] Starting region seed...')

  // ── 1. Fetch existing data to enforce idempotency ─────────────────────
  const existingRegions = await regionService.listRegions({})
  const existingRegionNames = new Set(existingRegions.map((r) => r.name))

  const existingTaxRegions = await taxService.listTaxRegions({})
  const existingTaxCountries = new Set(
    existingTaxRegions.map((tr) => tr.country_code.toUpperCase()),
  )

  // ── 2. Create regions ─────────────────────────────────────────────────
  for (const region of REGIONS) {
    if (existingRegionNames.has(region.name)) {
      logger.warn(`[seed-regions] Region "${region.name}" already exists — skipping`)
      continue
    }

    const created = await regionService.createRegions({
      name: region.name,
      currency_code: region.currency_code,
      countries: [...region.countries],
    })

    logger.info(
      `[seed-regions] Created region "${created.name}" id=${created.id} currency=${created.currency_code}`,
    )
  }

  // ── 3. Create tax regions with default rates ──────────────────────────
  for (const region of REGIONS) {
    for (const taxCfg of region.taxRegions) {
      if (existingTaxCountries.has(taxCfg.country_code)) {
        logger.warn(
          `[seed-regions] Tax region for "${taxCfg.country_code}" already exists — skipping`,
        )
        continue
      }

      const created = await taxService.createTaxRegions({
        country_code: taxCfg.country_code,
        default_tax_rate: {
          name: taxCfg.name,
          rate: taxCfg.rate,
          code: taxCfg.code,
        },
      })

      logger.info(
        `[seed-regions] Created tax region country=${taxCfg.country_code} rate=${taxCfg.rate}% id=${created.id}`,
      )
    }
  }

  logger.info('[seed-regions] Done.')
  logger.info('[seed-regions] Next step: link payment providers to regions via Medusa Admin:')
  logger.info('[seed-regions]   India (INR)  → Razorpay: pp_razorpay_razorpay')
  logger.info('[seed-regions]   UAE (AED)    → Stripe:   pp_stripe_stripe')
  logger.info('[seed-regions]   SEA (USD)    → Stripe:   pp_stripe_stripe')
}
