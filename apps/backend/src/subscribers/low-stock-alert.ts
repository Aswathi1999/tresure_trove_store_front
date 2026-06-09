import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IInventoryService } from '@medusajs/types'

export const LOW_STOCK_THRESHOLD = 5

type InventoryLevelUpdatedData = {
  id: string
  inventory_item_id?: string | null
  location_id?: string | null
  stocked_quantity?: number | null
  reserved_quantity?: number | null
}

export default async function lowStockAlertSubscriber({
  event: { data },
  container,
}: SubscriberArgs<InventoryLevelUpdatedData>): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const stocked = data.stocked_quantity
  const reserved = data.reserved_quantity ?? 0

  if (stocked == null) {
    logger.warn('[low-stock-alert] Skipping — stocked_quantity is null or undefined')
    return
  }

  const available = Math.max(0, stocked - reserved)

  if (available > LOW_STOCK_THRESHOLD) {
    return
  }

  let sku: string | null = null

  if (data.inventory_item_id) {
    try {
      const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY)
      const items = await inventoryService.listInventoryItems({ id: [data.inventory_item_id] })
      sku = items[0]?.sku ?? null
    } catch (error) {
      const err = error as Error
      logger.warn(
        `[low-stock-alert] Could not resolve inventory item ${data.inventory_item_id}: ${err.message}`,
      )
    }
  }

  logger.warn(
    `[low-stock-alert] Low stock detected — SKU: ${sku ?? 'unknown'}, location: ${data.location_id ?? 'unknown'}, available: ${available}, threshold: ${LOW_STOCK_THRESHOLD}`,
  )
}

export const config: SubscriberConfig = {
  event: 'inventory-level.updated',
}
