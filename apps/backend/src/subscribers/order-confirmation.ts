import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { INotificationModuleService } from '@medusajs/types'

export default async function orderConfirmationSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data.id

  logger.info(`[order-confirmation] order.placed fired for order: ${orderId}`)

  try {
    const notificationService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)

    await notificationService.createNotifications({
      to: '',
      channel: 'email',
      template: 'order-confirmation',
      data: { order_id: orderId },
    })

    logger.info(`[order-confirmation] Confirmation email dispatched for order: ${orderId}`)
  } catch (error) {
    const err = error as Error
    logger.error(
      `[order-confirmation] Failed to send confirmation email for order ${orderId}: ${err.message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
}
