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
import type { IOrderModuleService, IInventoryService } from '@medusajs/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export type ReturnItem = {
  line_item_id: string
  quantity: number
  reason?: string
}

export type ReturnInput = {
  order_id: string
  items: ReturnItem[]
  location_id?: string
  metadata?: Record<string, unknown>
}

export type ReturnResult = {
  return_id: string
  order_id: string
  status: string
}

// ─── Step 1: validate return items against the order ─────────────────────

const validateReturnItemsStep = createStep(
  'validate-return-items',
  async (input: { order_id: string; items: ReturnItem[] }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const order = await orderService.retrieveOrder(input.order_id, {
      relations: ['items'],
    })

    if (!order) {
      throw new Error(`Order ${input.order_id} not found`)
    }

    const orderItemMap = new Map(
      (order.items ?? []).map((i: { id: string; quantity: number; fulfilled_quantity: number }) => [
        i.id,
        i,
      ]),
    )

    for (const returnItem of input.items) {
      const orderItem = orderItemMap.get(returnItem.line_item_id)
      if (!orderItem) {
        throw new Error(`Line item ${returnItem.line_item_id} not found on order ${input.order_id}`)
      }
      const returnable = orderItem.fulfilled_quantity ?? orderItem.quantity
      if (returnItem.quantity > returnable) {
        throw new Error(
          `Cannot return ${returnItem.quantity} of item ${returnItem.line_item_id} — ` +
            `only ${returnable} fulfilled`,
        )
      }
    }

    logger.info(
      `[return] Validated ${input.items.length} return item(s) for order ${input.order_id}`,
    )

    return new StepResponse({ order_id: input.order_id, valid: true })
  },
)

// ─── Step 2: create return record ─────────────────────────────────────────

const createReturnRecordStep = createStep(
  'create-return-record',
  async (
    input: {
      order_id: string
      items: ReturnItem[]
      location_id?: string
      metadata?: Record<string, unknown>
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const orderService: IOrderModuleService = container.resolve(Modules.ORDER)

    const returnRecord = await orderService.createReturn({
      order_id: input.order_id,
      items: input.items.map((item) => ({
        id: item.line_item_id,
        quantity: item.quantity,
        reason_id: undefined,
        metadata: item.reason ? { reason: item.reason } : undefined,
      })),
      location_id: input.location_id,
      metadata: input.metadata,
    })

    logger.info(`[return] Created return ${returnRecord.id} for order ${input.order_id}`)

    return new StepResponse(
      {
        return_id: returnRecord.id,
        order_id: input.order_id,
        status: returnRecord.status ?? 'requested',
      },
      { return_id: returnRecord.id },
    )
  },
  async ({ return_id }: { return_id: string }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.warn(
      `[return] Compensated: return ${return_id} creation rolled back (manual cleanup may be needed)`,
    )
  },
)

// ─── Step 3: restore inventory for returned variants ──────────────────────

const restoreInventoryStep = createStep(
  'restore-inventory-for-return',
  async (
    input: {
      order_id: string
      items: Array<{ line_item_id: string; quantity: number }>
      location_id?: string
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY)

    const { data: lineItems } = await query.graph({
      entity: 'order_line_item',
      fields: ['id', 'variant_id', 'variant.inventory_items.inventory_item_id'],
      filters: { id: input.items.map((i) => i.line_item_id) },
    })

    const restored: string[] = []

    for (const item of input.items) {
      const lineItem = (lineItems as Record<string, unknown>[]).find(
        (li) => li['id'] === item.line_item_id,
      )
      if (!lineItem) continue

      const variant = lineItem['variant'] as
        | { inventory_items?: { inventory_item_id: string }[] }
        | undefined
      const inventoryItemId = variant?.inventory_items?.[0]?.inventory_item_id

      if (!inventoryItemId || !input.location_id) {
        logger.warn(
          `[return] Cannot restore inventory for line item ${item.line_item_id} — ` +
            `missing inventory item or location`,
        )
        continue
      }

      await inventoryService.adjustInventory(inventoryItemId, input.location_id, item.quantity)

      logger.info(
        `[return] Restored ${item.quantity} unit(s) of inventory item ${inventoryItemId} ` +
          `at location ${input.location_id}`,
      )
      restored.push(inventoryItemId)
    }

    return new StepResponse(
      { restored },
      {
        items: input.items,
        location_id: input.location_id,
        inventory_item_ids: restored,
      },
    )
  },
  async (
    rollback: {
      items: Array<{ line_item_id: string; quantity: number }>
      location_id?: string
      inventory_item_ids: string[]
    },
    { container },
  ) => {
    if (!rollback.location_id || rollback.inventory_item_ids.length === 0) return

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY)

    for (let i = 0; i < rollback.inventory_item_ids.length; i++) {
      const inventoryItemId = rollback.inventory_item_ids[i]
      const quantity = rollback.items[i]?.quantity ?? 0

      await inventoryService.adjustInventory(inventoryItemId, rollback.location_id, -quantity)
    }

    logger.warn(`[return] Compensated: reversed inventory restoration for return items`)
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const returnWorkflow = createWorkflow('process-return', function (input: ReturnInput) {
  const { data: orders } = useQueryGraphStep({
    entity: 'order',
    fields: ['id', 'status'],
    filters: { id: input.order_id },
  })

  transform({ orders }, ({ orders: o }) => {
    const order = (o as Record<string, unknown>[])[0]
    if (!order) throw new Error(`Order not found: ${String(input.order_id)}`)
    return order
  })

  validateReturnItemsStep({ order_id: input.order_id, items: input.items })

  // @ts-ignore
  const returnData = createReturnRecordStep({
    order_id: input.order_id,
    items: input.items,
    location_id: input.location_id,
    metadata: input.metadata,
  })

  // @ts-ignore — createStep with compensate loses input type inference
  restoreInventoryStep({
    order_id: input.order_id,
    items: input.items,
    location_id: input.location_id,
  })

  const result = transform({ returnData }, ({ returnData: r }): ReturnResult => {
    const ret = r as ReturnResult
    return { return_id: ret.return_id, order_id: ret.order_id, status: ret.status }
  })

  return new WorkflowResponse(result)
})
