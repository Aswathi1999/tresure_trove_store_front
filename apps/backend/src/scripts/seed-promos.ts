// @ts-nocheck
/**
 * Seed script — test promotion codes and gift cards for all three Treasure Trove
 * regions (India/INR, UAE/AED, SEA/USD).
 *
 * Run with:
 *   npx medusa exec src/scripts/seed-promos.ts
 *
 * All monetary values are in the smallest currency unit:
 *   INR → paise  |  USD → cents  |  AED → fils
 *
 * Idempotent — existing promotion codes are skipped, not duplicated.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IPromotionModuleService, IRegionModuleService } from '@medusajs/types'

// ── Gift card denominations (smallest currency unit) ─────────────────────────
// Update these constants to change denomination options without code changes.
const GIFT_CARD_DENOMINATIONS = {
  INR: [50000, 100000, 200000, 500000], // ₹500 · ₹1000 · ₹2000 · ₹5000
  USD: [2500, 5000, 10000], // $25 · $50 · $100
  AED: [10000, 25000, 50000], // AED 100 · AED 250 · AED 500
} as const

// ── Test promotion codes per region ──────────────────────────────────────────
const REGION_PROMOS = [
  {
    code: 'TT-INDIA-500',
    description: 'India region — ₹500 off (test code)',
    currencyCode: 'inr',
    amount: 50000, // ₹500 in paise
    campaignIdentifier: 'tt-india-test-2026',
    campaignName: 'Treasure Trove India Test Campaign',
  },
  {
    code: 'TT-UAE-100',
    description: 'UAE region — AED 100 off (test code)',
    currencyCode: 'aed',
    amount: 10000, // AED 100 in fils
    campaignIdentifier: 'tt-uae-test-2026',
    campaignName: 'Treasure Trove UAE Test Campaign',
  },
  {
    code: 'TT-SEA-25',
    description: 'SEA region — $25 off (test code)',
    currencyCode: 'usd',
    amount: 2500, // $25 in cents
    campaignIdentifier: 'tt-sea-test-2026',
    campaignName: 'Treasure Trove SEA Test Campaign',
  },
] as const

export default async function seedPromos({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('[seed-promos] Starting promotion and gift card seed...')

  const promotionService: IPromotionModuleService = container.resolve(Modules.PROMOTION)
  const regionService: IRegionModuleService = container.resolve(Modules.REGION)

  // ── 1. Fetch all regions and index by currency code ───────────────────────
  const allRegions = await regionService.listRegions({})
  const regionByCurrency = new Map(allRegions.map((r) => [r.currency_code, r]))

  logger.info(
    `[seed-promos] Found ${allRegions.length} region(s): ${allRegions.map((r) => r.currency_code.toUpperCase()).join(', ')}`,
  )

  // ── 2. Fetch existing promotion codes to avoid duplicates ────────────────
  const existingPromos = await promotionService.listPromotions({})
  const existingCodes = new Set(existingPromos.map((p) => p.code))

  // ── 3. Create one test promotion per region found ─────────────────────────
  for (const promo of REGION_PROMOS) {
    const region = regionByCurrency.get(promo.currencyCode)

    if (!region) {
      logger.warn(
        `[seed-promos] No region found with currency "${promo.currencyCode.toUpperCase()}" — skipping ${promo.code}`,
      )
      continue
    }

    if (existingCodes.has(promo.code)) {
      logger.warn(`[seed-promos] Promotion "${promo.code}" already exists — skipping`)
      continue
    }

    const [created] = await promotionService.createPromotions([
      {
        code: promo.code,
        type: 'standard',
        is_automatic: false,
        application_method: {
          type: 'fixed',
          target_type: 'order',
          value: promo.amount,
          currency_code: promo.currencyCode,
          allocation: 'across',
        },
        rules: [
          {
            attribute: 'region_id',
            operator: 'in',
            description: `Restrict to ${promo.currencyCode.toUpperCase()} region`,
            values: [region.id],
          },
        ],
        campaign: {
          name: promo.campaignName,
          description: promo.description,
          campaign_identifier: promo.campaignIdentifier,
          budget: {
            type: 'usage',
            limit: 100,
          },
        },
      },
    ])

    logger.info(
      `[seed-promos] Created promotion "${created.code}" ` +
        `(${promo.currencyCode.toUpperCase()} ${promo.amount}) ` +
        `region=${region.id} id=${created.id}`,
    )
  }

  // ── 4. Log gift card denomination reference ───────────────────────────────
  // Gift cards are created individually via POST /admin/gift-cards.
  // The constants above (GIFT_CARD_DENOMINATIONS) define the approved
  // denomination options per currency — update them to change available values.
  logger.info('[seed-promos] Gift card denomination reference:')
  for (const [currency, amounts] of Object.entries(GIFT_CARD_DENOMINATIONS)) {
    const formatted = (amounts as readonly number[]).join(', ')
    logger.info(`[seed-promos]   ${currency}: [${formatted}] (smallest unit)`)
  }
  logger.info(
    '[seed-promos] Use POST /admin/gift-cards with { value, region_id } to create gift cards.',
  )

  logger.info('[seed-promos] Done.')
}
