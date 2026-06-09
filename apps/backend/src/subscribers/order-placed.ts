import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { INotificationModuleService, IOrderModuleService } from '@medusajs/types'

// Sends a detailed order confirmation email with line items, totals, and
// delivery address. Registered automatically via the subscriber directory.
export default async function orderPlacedSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data.id

  logger.info(`[order-placed] order.placed fired for order: ${orderId}`)

  try {
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const order = await orderService.retrieveOrder(orderId, {
      relations: ['items', 'items.variant', 'shipping_address', 'billing_address', 'summary'],
    })

    if (!order) {
      logger.error(`[order-placed] Order ${orderId} not found — skipping email`)
      return
    }

    const shippingAddress = order.shipping_address
      ? [
          order.shipping_address.first_name,
          order.shipping_address.last_name,
          order.shipping_address.address_1,
          order.shipping_address.address_2,
          order.shipping_address.city,
          order.shipping_address.postal_code,
          order.shipping_address.country_code?.toUpperCase(),
        ]
          .filter(Boolean)
          .join(', ')
      : null

    const lineItems = (order.items ?? []).map(
      (item: {
        id: string
        title: string
        quantity: number
        unit_price: number
        thumbnail?: string | null
        variant?: { title?: string | null } | null
      }) => ({
        id: item.id,
        title: item.title,
        variant_title: item.variant?.title ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
        thumbnail: item.thumbnail ?? null,
      }),
    )

    const summary = order.summary as
      | { total?: number; subtotal?: number; tax_total?: number; shipping_total?: number }
      | undefined

    const notificationService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)

    await notificationService.createNotifications({
      to: order.email ?? '',
      channel: 'email',
      template: 'order-confirmation',
      data: {
        order_id: order.id,
        display_id: order.display_id,
        email: order.email,
        currency_code: order.currency_code,
        line_items: lineItems,
        item_count: lineItems.length,
        total: summary?.total ?? 0,
        subtotal: summary?.subtotal ?? 0,
        tax_total: summary?.tax_total ?? 0,
        shipping_total: summary?.shipping_total ?? 0,
        shipping_address: shippingAddress,
        created_at: order.created_at,
      },
    })

    logger.info(
      `[order-placed] Confirmation email dispatched to ${order.email} for order ${orderId}`,
    )
  } catch (error) {
    const err = error as Error
    logger.error(
      `[order-placed] Failed to send confirmation email for order ${orderId}: ${err.message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
}
