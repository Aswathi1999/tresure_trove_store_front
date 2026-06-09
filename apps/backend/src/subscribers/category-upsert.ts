import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function categoryUpsertSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
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
      body: JSON.stringify({ type: 'homepage', slug: '' }),
    })

    if (res.ok) {
      logger.info(`[revalidate] Revalidated storefront homepage for category: ${data.id}`)
    } else {
      logger.warn(
        `[revalidate] Revalidate endpoint returned ${res.status} for category: ${data.id}`,
      )
    }
  } catch (error) {
    const err = error as Error
    logger.error(
      `[revalidate] Failed to revalidate storefront for category ${data.id}: ${err.message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: ['product-category.created', 'product-category.updated', 'product-category.deleted'],
}
