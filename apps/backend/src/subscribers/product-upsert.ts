import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IProductModuleService } from '@medusajs/types'
import { syncProductsToMeilisearchWorkflow } from '../workflows/sync-products-to-meilisearch'

export default async function productUpsertSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // ── 1. Sync to MeiliSearch ────────────────────────────────────────────────
  try {
    await syncProductsToMeilisearchWorkflow(container).run({
      input: { filters: { id: data.id } },
    })
    logger.info(`[meilisearch] Indexed product: ${data.id}`)
  } catch (error) {
    const err = error as Error
    logger.error(`[meilisearch] Failed to index product ${data.id}: ${err.message}`)
  }

  // ── 2. Revalidate storefront ISR cache ───────────────────────────────────
  // Purges /products and /products/[handle] so the product appears immediately
  // without waiting for the 5-minute safety-net TTL to expire.
  const storefrontUrl = process.env['STOREFRONT_URL']
  const revalidateSecret = process.env['REVALIDATE_SECRET']

  if (!storefrontUrl || !revalidateSecret) {
    logger.warn('[revalidate] STOREFRONT_URL or REVALIDATE_SECRET not set — skipping cache purge')
    return
  }

  try {
    // Resolve the product handle — the event only gives us the ID
    const productService = container.resolve<IProductModuleService>(Modules.PRODUCT)
    const [product] = await productService.listProducts({ id: [data.id] })
    const slug = product?.handle ?? data.id

    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': revalidateSecret,
      },
      body: JSON.stringify({ type: 'product', slug }),
    })

    if (res.ok) {
      logger.info(`[revalidate] Revalidated storefront product: ${slug}`)
    } else {
      logger.warn(`[revalidate] Revalidate endpoint returned ${res.status} for product: ${slug}`)
    }
  } catch (error) {
    const err = error as Error
    logger.error(
      `[revalidate] Failed to revalidate storefront for product ${data.id}: ${err.message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: ['product.created', 'product.updated'],
}
