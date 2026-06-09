import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { NeoDoveClient } from '../modules/neodove/client'

type OrderDeliveredData = {
  fulfillment_id: string
  delivered_at: string
}

type OrderQueryResult = {
  id: string
  email?: string | null
  display_id?: number | null
  currency_code?: string | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
  } | null
  summary?: { total?: number } | null
}

export default async function neodoveDeliverySubscriber({
  event: { data },
  container,
}: SubscriberArgs<OrderDeliveredData>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { fulfillment_id } = data

  logger.info(`[neodove-delivery] order.delivered fired for fulfillment: ${fulfillment_id}`)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'email',
        'display_id',
        'currency_code',
        'shipping_address.first_name',
        'shipping_address.last_name',
        'shipping_address.phone',
        'summary.total',
      ],
      filters: { fulfillments: { id: fulfillment_id } },
    })

    const order = (orders as OrderQueryResult[])[0]

    if (!order) {
      logger.warn(`[neodove-delivery] No order found for fulfillment ${fulfillment_id} — skipping`)
      return
    }

    const shippingAddress = order.shipping_address

    const name =
      [shippingAddress?.first_name, shippingAddress?.last_name].filter(Boolean).join(' ') ||
      'Unknown'
    const phone = shippingAddress?.phone ?? ''

    if (!phone && !order.email) {
      logger.warn(`[neodove-delivery] Order ${order.id} has no phone or email — skipping lead`)
      return
    }

    const total = order.summary?.total ?? 0

    const client = new NeoDoveClient()

    await client.createLead({
      name,
      phone,
      email: order.email ?? undefined,
      tags: ['post-delivery'],
      customFields: {
        order_id: order.id,
        order_display_id: order.display_id ?? 0,
        order_total_inr: total / 100,
        fulfillment_id,
        delivered_at: data.delivered_at,
      },
    })

    logger.info(
      `[neodove-delivery] Post-delivery lead created for fulfillment ${fulfillment_id} (order ${order.id})`,
    )
  } catch (error) {
    const err = error as Error
    logger.error(`[neodove-delivery] Failed for fulfillment ${fulfillment_id}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: 'order.delivered',
}
