import type { HttpTypes } from '@medusajs/types'

export interface CartLineItem {
  id: string
  productId: string
  variantId: string
  title: string
  category: string
  variant: string
  imageUrl: string
  imageAlt: string
  unitPrice: number // price in INR as stored in Medusa
  quantity: number
  isOutOfStock?: boolean
  originalUnitPrice?: number // set when price changed since item was added
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN')}`
}

// GST is charged on top of the subtotal (prices are GST-exclusive), matching
// how the Medusa backend computes order tax. 12% GST on goods.
export const GST_RATE = 0.12

export function calcGst(subtotal: number): number {
  return Math.round(subtotal * GST_RATE)
}

export function mapMedusaCart(cart: HttpTypes.StoreCart): CartLineItem[] {
  return (cart.items ?? []).map(mapMedusaLineItem)
}

function mapMedusaLineItem(item: HttpTypes.StoreCartLineItem): CartLineItem {
  const variant = item.variant
  const product = variant?.product

  return {
    id: item.id,
    productId: product?.id ?? '',
    variantId: item.variant_id ?? '',
    title: item.title ?? product?.title ?? '',
    category: product?.collection?.title ?? '',
    variant: variant?.title ?? '',
    imageUrl: item.thumbnail ?? product?.thumbnail ?? '',
    imageAlt: item.title ?? product?.title ?? '',
    unitPrice: item.unit_price ?? 0,
    quantity: item.quantity,
  }
}
