// @ts-nocheck
import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { useQueryGraphStep } from '@medusajs/medusa/core-flows'
import type { IFulfillmentModuleService, IOrderModuleService } from '@medusajs/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export type CreateFulfillmentInput = {
  order_id: string
  items: Array<{ line_item_id: string; quantity: number; title: string; sku?: string }>
  location_id: string
  provider_id?: string
  metadata?: Record<string, unknown>
}

export type CreateFulfillmentResult = {
  fulfillment_id: string
  order_id: string
}

// ─── Step 1: validate order is fulfillable ─────────────────────────────────

const validateOrderForFulfillmentStep = createStep(
  'validate-order-for-fulfillment',
  async ({ order_id }: { order_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const order = await orderService.retrieveOrder(order_id, {
      relations: ['items', 'shipping_address'],
    })

    if (!order) {
      throw new Error(`Order ${order_id} not found`)
    }

    const allowedStatuses = ['pending', 'processing']
    if (!allowedStatuses.includes(order.status)) {
      throw new Error(`Order ${order_id} cannot be fulfilled — current status: ${order.status}`)
    }

    logger.info(`[create-fulfillment] Order ${order_id} validated for fulfillment`)

    return new StepResponse(
      {
        order_id: order.id,
        currency_code: order.currency_code,
        email: order.email,
        shipping_address: order.shipping_address,
      },
      order_id,
    )
  },
)

// ─── Step 2: create fulfillment record ────────────────────────────────────

const createFulfillmentRecordStep = createStep(
  'create-fulfillment-record',
  async (
    input: {
      order_id: string
      order_currency_code: string
      order_email: string | null
      location_id: string
      provider_id: string
      items: Array<{ line_item_id: string; quantity: number; title: string; sku?: string }>
      metadata?: Record<string, unknown>
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const fulfillment = await fulfillmentService.createFulfillment({
      location_id: input.location_id,
      provider_id: input.provider_id,
      items: input.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        sku: item.sku,
        line_item_id: item.line_item_id,
      })),
      labels: [],
      order: {
        id: input.order_id,
        currency_code: input.order_currency_code,
        email: input.order_email ?? undefined,
      },
      metadata: {
        ...input.metadata,
        order_id: input.order_id,
      },
      delivery_address: {},
    })

    logger.info(
      `[create-fulfillment] Created fulfillment ${fulfillment.id} for order ${input.order_id}`,
    )

    return new StepResponse(fulfillment.id, fulfillment.id)
  },
  async (fulfillment_id: string, { container }) => {
    if (!fulfillment_id) return

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    await fulfillmentService.cancelFulfillment(fulfillment_id)
    logger.warn(`[create-fulfillment] Compensated: cancelled fulfillment ${fulfillment_id}`)
  },
)

// ─── Step 3: emit fulfillment-created event ────────────────────────────────

const emitFulfillmentCreatedStep = createStep(
  'emit-fulfillment-created-event',
  async (
    { fulfillment_id, order_id }: { fulfillment_id: string; order_id: string },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const eventBus = container.resolve(ContainerRegistrationKeys.EVENT_BUS)

    await eventBus.emit([
      {
        name: 'fulfillment.created',
        data: { fulfillment_id, order_id },
      },
    ])

    logger.info(
      `[create-fulfillment] Emitted fulfillment.created for fulfillment ${fulfillment_id}`,
    )

    return new StepResponse({ emitted: true })
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const createFulfillmentWorkflow = createWorkflow(
  'create-fulfillment',
  function (input: CreateFulfillmentInput) {
    const { data: orders } = useQueryGraphStep({
      entity: 'order',
      fields: ['id', 'status', 'currency_code', 'email', 'shipping_address.*'],
      filters: { id: input.order_id },
    })

    const orderMeta = transform({ orders }, ({ orders: o }) => {
      const order = (o as Record<string, unknown>[])[0]
      if (!order) throw new Error(`Order not found: ${String(input.order_id)}`)
      return {
        currency_code: order['currency_code'] as string,
        email: (order['email'] as string | null) ?? null,
      }
    })

    validateOrderForFulfillmentStep({ order_id: input.order_id })

    // @ts-ignore
    const fulfillment_id = createFulfillmentRecordStep({
      order_id: input.order_id,
      order_currency_code: orderMeta.currency_code,
      order_email: orderMeta.email,
      location_id: input.location_id,
      provider_id: input.provider_id ?? 'manual',
      items: input.items,
      metadata: input.metadata,
    })

    emitFulfillmentCreatedStep({
      fulfillment_id,
      order_id: input.order_id,
    })

    const result = transform(
      { fulfillment_id, order_id: input.order_id },
      ({ fulfillment_id: fid, order_id: oid }): CreateFulfillmentResult => ({
        fulfillment_id: fid,
        order_id: oid,
      }),
    )

    return new WorkflowResponse(result)
  },
)
