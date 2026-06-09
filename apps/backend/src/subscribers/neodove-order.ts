import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IOrderModuleService } from '@medusajs/types'
import { NeoDoveClient } from '../modules/neodove/client'

const DEFAULT_HIGH_VALUE_THRESHOLD = 5_000_000 // paise = ₹50,000

export default async function neodoveOrderSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data.id

  logger.info(`[neodove-order] order.placed fired for order: ${orderId}`)

  const threshold = parseInt(
    process.env['NEODOVE_HIGH_VALUE_THRESHOLD'] ?? String(DEFAULT_HIGH_VALUE_THRESHOLD),
    10,
  )

  try {
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const order = await orderService.retrieveOrder(orderId, {
      relations: ['items', 'shipping_address', 'summary'],
    })

    if (!order) {
      logger.warn(`[neodove-order] Order ${orderId} not found — skipping`)
      return
    }

    const summary = order.summary as { total?: number } | undefined
    const total = summary?.total ?? 0

    if (total < threshold) {
      logger.info(
        `[neodove-order] Order ${orderId} total ${total} paise below threshold ${threshold} — skipping`,
      )
      return
    }

    const shippingAddress = order.shipping_address as {
      first_name?: string | null
      last_name?: string | null
      phone?: string | null
    } | null

    const name =
      [shippingAddress?.first_name, shippingAddress?.last_name].filter(Boolean).join(' ') ||
      'Unknown'
    const phone = shippingAddress?.phone ?? ''

    if (!phone && !order.email) {
      logger.warn(`[neodove-order] Order ${orderId} has no phone or email — skipping lead`)
      return
    }

    const client = new NeoDoveClient()

    await client.createLead({
      name,
      phone,
      email: order.email ?? undefined,
      tags: ['high-value-order'],
      customFields: {
        order_id: order.id,
        order_display_id: order.display_id ?? 0,
        order_total_inr: total / 100,
        currency_code: order.currency_code ?? '',
      },
    })

    logger.info(`[neodove-order] Lead created for order ${orderId} (₹${total / 100})`)
  } catch (error) {
    const err = error as Error
    logger.error(`[neodove-order] Failed for order ${orderId}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
}
