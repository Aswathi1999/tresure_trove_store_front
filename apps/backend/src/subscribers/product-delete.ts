import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { deleteProductsFromMeilisearchWorkflow } from '../workflows/delete-products-from-meilisearch'

export default async function productDeleteSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    await deleteProductsFromMeilisearchWorkflow(container).run({
      input: { ids: [data.id] },
    })
    logger.info(`[meilisearch] Removed product from index: ${data.id}`)
  } catch (error) {
    const err = error as Error
    logger.error(`[meilisearch] Failed to remove product ${data.id}: ${err.message}`)
  }

  // ── Revalidate storefront ISR cache ──────────────────────────────────────
  // Without this, a deleted product lingered on the homepage / listings until
  // the page TTL expired. Purges the homepage, listing, and product-tagged data.
  const storefrontUrl = process.env['STOREFRONT_URL']
  const revalidateSecret = process.env['REVALIDATE_SECRET']

  if (!storefrontUrl || !revalidateSecret) {
    logger.warn('[revalidate] STOREFRONT_URL or REVALIDATE_SECRET not set — skipping cache purge')
    return
  }

  try {
    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': revalidateSecret,
      },
      // The product is gone, so we don't have a handle — the id is enough to
      // purge the homepage, listing, and the 'products' data tag.
      body: JSON.stringify({ type: 'product', slug: data.id }),
    })

    if (res.ok) {
      logger.info(`[revalidate] Revalidated storefront after deleting product: ${data.id}`)
    } else {
      logger.warn(`[revalidate] Revalidate endpoint returned ${res.status} for delete: ${data.id}`)
    }
  } catch (error) {
    const err = error as Error
    logger.error(
      `[revalidate] Failed to revalidate storefront after delete ${data.id}: ${err.message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: 'product.deleted',
}
