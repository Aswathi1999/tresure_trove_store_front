import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IProductModuleService } from '@medusajs/types'
import { buildVariantSku, slug } from '../lib/variant-sku'

/**
 * Auto-SKU subscriber — BACKSTOP only.
 *
 * The primary fix lives in `src/api/middlewares.ts`, which fills a blank SKU
 * into the request body BEFORE the variant is created, so Medusa allocates a
 * dedicated inventory item keyed on that SKU.
 *
 * This subscriber runs on `product-variant.created` for any path that bypasses
 * the admin API middleware (e.g. scripts). IMPORTANT: by the time this fires,
 * the inventory item has already been created with a null SKU — updating the
 * variant SKU here does NOT re-point or rename that inventory item, so it does
 * NOT prevent the null-SKU inventory-sharing quirk. It only labels the variant.
 * Treat it as a cosmetic safety net; rely on the middleware for the real fix.
 *
 * Format: `<product-handle>-<opt1>-<opt2>-<id-suffix>` upper-cased.
 *   e.g.  SUNAPPI-WHITE-WOOD-QKN1X
 */
type VariantCreatedData = { id: string }

export default async function autoVariantSkuSubscriber({
  event: { data },
  container,
}: SubscriberArgs<VariantCreatedData>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT)

  let variant
  try {
    variant = await productService.retrieveProductVariant(data.id, {
      relations: ['options', 'product'],
    })
  } catch (error) {
    const err = error as Error
    logger.warn(`[auto-variant-sku] Could not retrieve variant ${data.id}: ${err.message}`)
    return
  }

  if (variant.sku && variant.sku.trim().length > 0) {
    // SKU already set by admin or import — respect it
    return
  }

  const productHandle = variant.product?.handle ?? variant.product_id ?? 'product'
  const optionValues = (variant.options ?? []).map((o) => o.value).filter(Boolean)
  const idSuffix = slug(variant.id.slice(-6))

  const generatedSku = buildVariantSku(productHandle, optionValues, idSuffix)

  try {
    await productService.updateProductVariants(variant.id, { sku: generatedSku })
    logger.info(
      `[auto-variant-sku] Filled blank SKU for variant ${variant.id} (${variant.title}) → ${generatedSku}`,
    )
  } catch (error) {
    const err = error as Error
    logger.warn(`[auto-variant-sku] Failed to update SKU on ${variant.id}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: 'product-variant.created',
}
