import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { ICustomerModuleService } from '@medusajs/types'
import { NeoDoveClient } from '../modules/neodove/client'

export default async function neodoveCustomerSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerId = data.id

  logger.info(`[neodove-customer] customer.created fired for customer: ${customerId}`)

  try {
    const customerService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)

    const customer = await customerService.retrieveCustomer(customerId)

    if (!customer) {
      logger.warn(`[neodove-customer] Customer ${customerId} not found — skipping`)
      return
    }

    const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Unknown'
    const phone = customer.phone ?? ''

    if (!phone && !customer.email) {
      logger.warn(
        `[neodove-customer] Customer ${customerId} has no phone or email — skipping contact`,
      )
      return
    }

    const client = new NeoDoveClient()

    await client.createContact({
      name,
      phone,
      email: customer.email ?? undefined,
      customFields: {
        customer_id: customer.id,
        has_account: true,
      },
    })

    logger.info(`[neodove-customer] Contact created for customer ${customerId}`)
  } catch (error) {
    const err = error as Error
    logger.error(`[neodove-customer] Failed for customer ${customerId}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: 'customer.created',
}
