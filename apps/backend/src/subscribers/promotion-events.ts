// @ts-nocheck
import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { ICartModuleService } from '@medusajs/types'

// Logs promotion application events from cart updates using Winston.
// Rejection events (invalid / expired / wrong-region codes) are handled
// natively by the Promotion module and returned as 400 responses — they
// do not emit events and are logged at the API transport layer.
export default async function promotionEventsSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const cartId = data.id

  try {
    const cartService: ICartModuleService = container.resolve(Modules.CART)

    const cart = await cartService.retrieveCart(cartId, {
      relations: ['promotions'],
    })

    if (!cart) {
      return
    }

    const promotions = (cart.promotions ?? []) as Array<{ id: string; code?: string | null }>

    if (promotions.length === 0) {
      return
    }

    const codes = promotions.map((p) => p.code ?? p.id).join(', ')

    logger.info({
      message: '[promotion-events] Promotion(s) applied to cart',
      cart_id: cartId,
      region_id: cart.region_id ?? null,
      currency_code: cart.currency_code ?? null,
      promotion_codes: codes,
      promotion_count: promotions.length,
    })
  } catch (error) {
    const err = error as Error
    logger.error(
      `[promotion-events] Failed to log promotion event for cart ${cartId}: ${err.message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: 'cart.updated',
}
