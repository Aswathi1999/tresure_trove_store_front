// @ts-nocheck
import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IFulfillmentModuleService } from '@medusajs/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export type MarkDeliveredInput = {
  fulfillment_id: string
  metadata?: Record<string, unknown>
}

export type MarkDeliveredResult = {
  fulfillment_id: string
  delivered_at: string
}

// ─── Step 1: validate fulfillment is in a deliverable state ─────────────────

const validateFulfillmentForDeliveryStep = createStep(
  'validate-fulfillment-for-delivery',
  async ({ fulfillment_id }: { fulfillment_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const fulfillment = await fulfillmentService.retrieveFulfillment(fulfillment_id)

    if (!fulfillment) {
      throw new Error(`Fulfillment ${fulfillment_id} not found`)
    }

    if (!fulfillment.shipped_at) {
      throw new Error(
        `Fulfillment ${fulfillment_id} has not been shipped yet — cannot mark as delivered`,
      )
    }

    if (fulfillment.delivered_at) {
      throw new Error(`Fulfillment ${fulfillment_id} has already been marked as delivered`)
    }

    logger.info(`[mark-delivered] Fulfillment ${fulfillment_id} validated for delivery`)

    return new StepResponse({ fulfillment_id: fulfillment.id })
  },
)

// ─── Step 2: mark fulfillment as delivered ─────────────────────────────────

const markFulfillmentDeliveredStep = createStep(
  'mark-fulfillment-delivered',
  async (input: { fulfillment_id: string; metadata?: Record<string, unknown> }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const deliveredAt = new Date()

    const updated = await fulfillmentService.updateFulfillment(input.fulfillment_id, {
      delivered_at: deliveredAt,
      metadata: {
        ...input.metadata,
        delivered_at: deliveredAt.toISOString(),
      },
    })

    logger.info(
      `[mark-delivered] Fulfillment ${input.fulfillment_id} delivered at ${deliveredAt.toISOString()}`,
    )

    return new StepResponse(
      {
        fulfillment_id: updated.id,
        delivered_at: deliveredAt.toISOString(),
      },
      { fulfillment_id: input.fulfillment_id },
    )
  },
  async ({ fulfillment_id }: { fulfillment_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    await fulfillmentService.updateFulfillment(fulfillment_id, {
      delivered_at: undefined,
    })

    logger.warn(
      `[mark-delivered] Compensated: cleared delivered_at for fulfillment ${fulfillment_id}`,
    )
  },
)

// ─── Step 3: emit post-delivery event ─────────────────────────────────────

const emitOrderDeliveredStep = createStep(
  'emit-order-delivered-event',
  async (
    { fulfillment_id, delivered_at }: { fulfillment_id: string; delivered_at: string },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const eventBus = container.resolve(ContainerRegistrationKeys.EVENT_BUS)

    await eventBus.emit([
      {
        name: 'order.delivered',
        data: { fulfillment_id, delivered_at },
      },
    ])

    logger.info(`[mark-delivered] Emitted order.delivered for fulfillment ${fulfillment_id}`)

    return new StepResponse({ emitted: true })
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const markDeliveredWorkflow = createWorkflow(
  'mark-delivered',
  function (input: MarkDeliveredInput) {
    validateFulfillmentForDeliveryStep({ fulfillment_id: input.fulfillment_id })

    // @ts-ignore
    const deliveryData = markFulfillmentDeliveredStep({
      fulfillment_id: input.fulfillment_id,
      metadata: input.metadata,
    })

    emitOrderDeliveredStep({
      fulfillment_id: input.fulfillment_id,
      delivered_at: deliveryData.delivered_at,
    })

    const result = transform(
      { deliveryData },
      ({ deliveryData: d }): MarkDeliveredResult => ({
        fulfillment_id: d.fulfillment_id,
        delivered_at: d.delivered_at,
      }),
    )

    return new WorkflowResponse(result)
  },
)
