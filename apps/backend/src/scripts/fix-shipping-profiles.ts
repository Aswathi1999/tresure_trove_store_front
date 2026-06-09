// @ts-nocheck
/**
 * One-shot repair for the Medusa v2 error:
 *   "The cart items require shipping profiles that are not satisfied by the
 *    current shipping methods"
 *
 * Cause: a product is linked to a different shipping profile than the one the
 * store's shipping option (e.g. "Standard Delivery") belongs to. Medusa then
 * can't match a shipping method to the product's profile at checkout.
 *
 * This script force-aligns EVERY product onto the shipping profile used by the
 * existing shipping option(s): it dismisses links to any other profile and
 * creates the link to the target profile.
 *
 * Run with:
 *   pnpm --filter backend db:fix-shipping-profiles
 *
 * Idempotent — safe to re-run.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export default async function fixShippingProfiles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const productService = container.resolve(Modules.PRODUCT)
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)

  // ── 1. Inventory of profiles + which profile the shipping options use ──────
  const allProfiles = await fulfillmentService.listShippingProfiles({})
  logger.info(
    `[fix-profiles] Shipping profiles (${allProfiles.length}): ` +
      allProfiles.map((p) => `${p.name} [${p.id}]`).join(', '),
  )

  const options = await fulfillmentService.listShippingOptions({})
  if (options.length === 0) {
    logger.error(
      '[fix-profiles] No shipping options found. Run db:setup-shipping-india first, then re-run this.',
    )
    return
  }

  const optionProfileIds = [...new Set(options.map((o) => o.shipping_profile_id).filter(Boolean))]
  logger.info(
    `[fix-profiles] Shipping options: ` +
      options.map((o) => `${o.name} → profile ${o.shipping_profile_id}`).join(', '),
  )

  if (optionProfileIds.length === 0) {
    logger.error('[fix-profiles] Shipping options have no shipping_profile_id — cannot align.')
    return
  }
  if (optionProfileIds.length > 1) {
    logger.warn(
      `[fix-profiles] Options span multiple profiles (${optionProfileIds.join(', ')}). ` +
        `Aligning all products to the first one: ${optionProfileIds[0]}`,
    )
  }
  const targetProfileId = optionProfileIds[0]

  // ── 2. Force every product onto the target profile ────────────────────────
  const products = await productService.listProducts({}, { select: ['id', 'title'] })
  logger.info(`[fix-profiles] Aligning ${products.length} product(s) → profile ${targetProfileId}`)

  let fixed = 0
  for (const p of products) {
    // Remove links to every OTHER profile so the product resolves to exactly one.
    for (const prof of allProfiles) {
      if (prof.id === targetProfileId) continue
      await remoteLink
        .dismiss({
          [Modules.PRODUCT]: { product_id: p.id },
          [Modules.FULFILLMENT]: { shipping_profile_id: prof.id },
        })
        .catch(() => {})
    }
    // Ensure the link to the target profile exists.
    await remoteLink
      .create({
        [Modules.PRODUCT]: { product_id: p.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: targetProfileId },
      })
      .catch(() => {})
    fixed += 1
    logger.info(`[fix-profiles]   ✓ ${p.title}`)
  }

  logger.info(
    `[fix-profiles] Done. Aligned ${fixed} product(s) to profile ${targetProfileId}. ` +
      `Retry a COD checkout — the shipping-profile error should be gone.`,
  )
}
