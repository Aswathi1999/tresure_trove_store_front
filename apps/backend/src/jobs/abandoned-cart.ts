import type { MedusaContainer } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { ICartModuleService } from '@medusajs/types'
import { NeoDoveClient } from '../modules/neodove/client'

const ABANDONED_CART_WINDOW_MS = 60 * 60 * 1000 // 1 hour in milliseconds

type CartAddress = {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
}

type CartItem = {
  unit_price?: number | null
  quantity?: number | null
}

export default async function abandonedCartJob(container: MedusaContainer): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info('[abandoned-cart] job started')

  try {
    const cartService: ICartModuleService = container.resolve(Modules.CART)
    const client = new NeoDoveClient()

    const oneHourAgo = new Date(Date.now() - ABANDONED_CART_WINDOW_MS)

    const allCarts = await cartService.listCarts(
      { completed_at: null } as unknown as Parameters<ICartModuleService['listCarts']>[0],
      {
        select: ['id', 'email', 'metadata', 'updated_at', 'currency_code'],
        relations: ['billing_address', 'items'],
      },
    )

    const abandonedCarts = allCarts.filter((cart) => {
      if (!cart.updated_at) return false
      return new Date(cart.updated_at) < oneHourAgo
    })

    logger.info(`[abandoned-cart] Found ${abandonedCarts.length} abandoned cart(s) to process`)

    for (const cart of abandonedCarts) {
      const metadata = (cart.metadata ?? {}) as Record<string, unknown>

      if (metadata['neodove_lead_pushed_at']) {
        continue
      }

      const billingAddress = cart.billing_address as CartAddress | null
      const name =
        [billingAddress?.first_name, billingAddress?.last_name].filter(Boolean).join(' ') ||
        'Unknown'
      const phone = billingAddress?.phone ?? ''

      if (!phone && !cart.email) {
        logger.warn(`[abandoned-cart] Cart ${cart.id} has no phone or email — skipping`)
        continue
      }

      const items = (cart.items ?? []) as CartItem[]
      const cartTotal = items.reduce(
        (sum, item) => sum + (item.unit_price ?? 0) * (item.quantity ?? 0),
        0,
      )

      const result = await client.createLead({
        name,
        phone,
        email: cart.email ?? undefined,
        tags: ['abandoned-cart'],
        customFields: {
          cart_id: cart.id,
          cart_total_inr: cartTotal / 100,
          currency_code: cart.currency_code ?? '',
          item_count: items.length,
        },
      })

      if (result.success) {
        type UpdateCartsById = (
          data: Array<{ id: string; metadata: Record<string, unknown> }>,
        ) => Promise<unknown>
        await (cartService.updateCarts as unknown as UpdateCartsById)([
          {
            id: cart.id,
            metadata: { ...metadata, neodove_lead_pushed_at: new Date().toISOString() },
          },
        ])
        logger.info(
          `[abandoned-cart] Lead created for cart ${cart.id}, lead ID: ${result.leadId ?? 'unknown'}`,
        )
      } else {
        logger.warn(
          `[abandoned-cart] Failed to create lead for cart ${cart.id}: ${result.message ?? 'unknown error'}`,
        )
      }
    }

    logger.info('[abandoned-cart] job completed')
  } catch (error) {
    const err = error as Error
    logger.error(`[abandoned-cart] job failed: ${err.message}`)
  }
}

export const config = {
  name: 'abandoned-cart',
  schedule: '0 * * * *', // hourly
}
