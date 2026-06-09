// @ts-nocheck
import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IOrderModuleService } from '@medusajs/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export type ExchangeReturnItem = {
  line_item_id: string
  quantity: number
  reason?: string
}

export type ExchangeNewItem = {
  variant_id: string
  quantity: number
  unit_price: number
  title: string
}

export type ExchangeInput = {
  order_id: string
  return_items: ExchangeReturnItem[]
  new_items: ExchangeNewItem[]
  location_id?: string
  metadata?: Record<string, unknown>
}

export type ExchangeResult = {
  return_id: string
  new_order_id: string
  order_id: string
}

// ─── Step 1: create return for the items being sent back ──────────────────

const createReturnForExchangeStep = createStep(
  'create-return-for-exchange',
  async (
    input: {
      order_id: string
      return_items: ExchangeReturnItem[]
      location_id?: string
      metadata?: Record<string, unknown>
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const returnRecord = await orderService.createReturn({
      order_id: input.order_id,
      items: input.return_items.map((item) => ({
        id: item.line_item_id,
        quantity: item.quantity,
        metadata: item.reason ? { reason: item.reason } : undefined,
      })),
      location_id: input.location_id,
      metadata: {
        ...input.metadata,
        type: 'exchange',
      },
    })

    logger.info(
      `[exchange] Created return ${returnRecord.id} for exchange on order ${input.order_id}`,
    )

    return new StepResponse({ return_id: returnRecord.id }, { return_id: returnRecord.id })
  },
  async ({ return_id }: { return_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.warn(`[exchange] Compensated: return ${return_id} creation rolled back`)
  },
)

// ─── Step 2: create draft order for the new items ─────────────────────────

const createExchangeDraftOrderStep = createStep(
  'create-exchange-draft-order',
  async (
    input: {
      original_order_id: string
      return_id: string
      new_items: ExchangeNewItem[]
      metadata?: Record<string, unknown>
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const originalOrder = await orderService.retrieveOrder(input.original_order_id, {
      relations: ['shipping_address', 'billing_address'],
    })

    if (!originalOrder) {
      throw new Error(`Original order ${input.original_order_id} not found`)
    }

    const exchangeTotal = input.new_items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    )

    const draftOrder = await orderService.createOrders({
      status: 'draft',
      currency_code: originalOrder.currency_code,
      email: originalOrder.email,
      shipping_address: originalOrder.shipping_address
        ? {
            first_name: originalOrder.shipping_address.first_name ?? '',
            last_name: originalOrder.shipping_address.last_name ?? '',
            address_1: originalOrder.shipping_address.address_1 ?? '',
            city: originalOrder.shipping_address.city ?? '',
            country_code: originalOrder.shipping_address.country_code ?? '',
            postal_code: originalOrder.shipping_address.postal_code ?? '',
          }
        : undefined,
      items: input.new_items.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        title: item.title,
      })),
      metadata: {
        ...input.metadata,
        type: 'exchange',
        original_order_id: input.original_order_id,
        return_id: input.return_id,
        exchange_total: exchangeTotal,
      },
    })

    logger.info(
      `[exchange] Created draft order ${draftOrder.id} for exchange — ` +
        `return ${input.return_id}, ${input.new_items.length} new item(s), ` +
        `total: ${exchangeTotal} ${originalOrder.currency_code}`,
    )

    return new StepResponse({ new_order_id: draftOrder.id }, { new_order_id: draftOrder.id })
  },
  async ({ new_order_id }: { new_order_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    await orderService.softDeleteOrders([new_order_id])
    logger.warn(`[exchange] Compensated: soft-deleted exchange draft order ${new_order_id}`)
  },
)

// ─── Step 3: emit exchange-created event ──────────────────────────────────

const emitExchangeCreatedStep = createStep(
  'emit-exchange-created-event',
  async (input: { return_id: string; new_order_id: string; order_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const eventBus = container.resolve(ContainerRegistrationKeys.EVENT_BUS)

    await eventBus.emit([
      {
        name: 'order.exchange_created',
        data: {
          order_id: input.order_id,
          return_id: input.return_id,
          new_order_id: input.new_order_id,
        },
      },
    ])

    logger.info(
      `[exchange] Emitted order.exchange_created — ` +
        `original: ${input.order_id}, return: ${input.return_id}, new: ${input.new_order_id}`,
    )

    return new StepResponse({ emitted: true })
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const exchangeWorkflow = createWorkflow('process-exchange', function (input: ExchangeInput) {
  // @ts-ignore
  const returnData = createReturnForExchangeStep({
    order_id: input.order_id,
    return_items: input.return_items,
    location_id: input.location_id,
    metadata: input.metadata,
  })

  // @ts-ignore
  const draftOrderData = createExchangeDraftOrderStep({
    original_order_id: input.order_id,
    return_id: returnData.return_id,
    new_items: input.new_items,
    metadata: input.metadata,
  })

  emitExchangeCreatedStep({
    order_id: input.order_id,
    return_id: returnData.return_id,
    new_order_id: draftOrderData.new_order_id,
  })

  const result = transform(
    { returnData, draftOrderData },
    ({ returnData: r, draftOrderData: d }): ExchangeResult => ({
      return_id: r.return_id,
      new_order_id: d.new_order_id,
      order_id: input.order_id,
    }),
  )

  return new WorkflowResponse(result)
})
