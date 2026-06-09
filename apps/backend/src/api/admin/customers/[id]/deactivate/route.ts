import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules, ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import type { ICustomerModuleService } from '@medusajs/types'

export const POST = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const customerService: ICustomerModuleService = req.scope.resolve(Modules.CUSTOMER)

  const { id } = req.params

  let customer: Awaited<ReturnType<typeof customerService.retrieveCustomer>>

  try {
    customer = await customerService.retrieveCustomer(id)
  } catch (err) {
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: `No customer found with id: ${id}`,
          details: {},
        },
      })
      return
    }
    throw err
  }

  const existingMetadata: Record<string, unknown> =
    customer.metadata !== null && customer.metadata !== undefined
      ? (customer.metadata as Record<string, unknown>)
      : {}

  const updatedCustomer = await customerService.updateCustomers(customer.id, {
    metadata: { ...existingMetadata, deactivated: true },
  })

  logger.info(`[customers/deactivate] Customer id=${id} deactivated`)

  res.status(200).json({ customer: updatedCustomer })
}
