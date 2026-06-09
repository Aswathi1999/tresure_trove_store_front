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

export type MarkShippedInput = {
  fulfillment_id: string
  tracking_number: string
  carrier: string
  metadata?: Record<string, unknown>
}

export type MarkShippedResult = {
  fulfillment_id: string
  tracking_number: string
  carrier: string
}

// ─── Step 1: validate fulfillment exists and is in a shippable state ────────

const validateFulfillmentForShipmentStep = createStep(
  'validate-fulfillment-for-shipment',
  async ({ fulfillment_id }: { fulfillment_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const fulfillment = await fulfillmentService.retrieveFulfillment(fulfillment_id)

    if (!fulfillment) {
      throw new Error(`Fulfillment ${fulfillment_id} not found`)
    }

    if (fulfillment.shipped_at) {
      throw new Error(`Fulfillment ${fulfillment_id} has already been marked as shipped`)
    }

    logger.info(`[mark-shipped] Fulfillment ${fulfillment_id} validated for shipment`)

    return new StepResponse({ fulfillment_id: fulfillment.id })
  },
)

// ─── Step 2: create shipment with tracking info ────────────────────────────

const createShipmentStep = createStep(
  'create-shipment-with-tracking',
  async (
    input: {
      fulfillment_id: string
      tracking_number: string
      carrier: string
      metadata?: Record<string, unknown>
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const updated = await fulfillmentService.updateFulfillment(input.fulfillment_id, {
      shipped_at: new Date(),
      labels: [
        {
          tracking_number: input.tracking_number,
          tracking_url: '',
          label_url: '',
        },
      ],
      metadata: {
        ...input.metadata,
        carrier: input.carrier,
        tracking_number: input.tracking_number,
      },
    })

    logger.info(
      `[mark-shipped] Fulfillment ${input.fulfillment_id} marked shipped — ` +
        `carrier: ${input.carrier}, tracking: ${input.tracking_number}`,
    )

    return new StepResponse(
      {
        fulfillment_id: updated.id,
        tracking_number: input.tracking_number,
        carrier: input.carrier,
      },
      {
        fulfillment_id: input.fulfillment_id,
        previous_shipped_at: null as Date | null,
      },
    )
  },
  async (
    { fulfillment_id }: { fulfillment_id: string; previous_shipped_at: Date | null },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    await fulfillmentService.updateFulfillment(fulfillment_id, {
      shipped_at: undefined,
      labels: [],
      metadata: {},
    })

    logger.warn(
      `[mark-shipped] Compensated: cleared shipment data for fulfillment ${fulfillment_id}`,
    )
  },
)

// ─── Step 3: emit order.shipment_created event ────────────────────────────

const emitShipmentCreatedStep = createStep(
  'emit-shipment-created-event',
  async (
    input: { fulfillment_id: string; tracking_number: string; carrier: string },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const eventBus = container.resolve(ContainerRegistrationKeys.EVENT_BUS)

    await eventBus.emit([
      {
        name: 'order.shipment_created',
        data: {
          fulfillment_id: input.fulfillment_id,
          tracking_number: input.tracking_number,
          carrier: input.carrier,
        },
      },
    ])

    logger.info(
      `[mark-shipped] Emitted order.shipment_created for fulfillment ${input.fulfillment_id}`,
    )

    return new StepResponse({ emitted: true })
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const markShippedWorkflow = createWorkflow(
  'mark-shipped',
  function (input: MarkShippedInput) {
    validateFulfillmentForShipmentStep({ fulfillment_id: input.fulfillment_id })

    // @ts-ignore
    const shipmentData = createShipmentStep({
      fulfillment_id: input.fulfillment_id,
      tracking_number: input.tracking_number,
      carrier: input.carrier,
      metadata: input.metadata,
    })

    emitShipmentCreatedStep({
      fulfillment_id: input.fulfillment_id,
      tracking_number: input.tracking_number,
      carrier: input.carrier,
    })

    const result = transform(
      { shipmentData },
      ({ shipmentData: s }): MarkShippedResult => ({
        fulfillment_id: s.fulfillment_id,
        tracking_number: s.tracking_number,
        carrier: s.carrier,
      }),
    )

    return new WorkflowResponse(result)
  },
)
