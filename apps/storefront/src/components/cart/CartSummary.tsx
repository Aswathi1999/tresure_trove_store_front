'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
import { formatPrice, calcGst } from '@/lib/cart-types'
import type { CartLineItem } from '@/lib/cart-types'

interface CartSummaryProps {
  items: CartLineItem[]
  selectedIds?: string[]
}

export function CartSummary({ items, selectedIds }: CartSummaryProps) {
  const { closeCart } = useCartStore()

  // When selectedIds is omitted, treat all items as selected (back-compat).
  const isSelected = (id: string) => (selectedIds ? selectedIds.includes(id) : true)
  const selectedItems = items.filter((i) => isSelected(i.id))
  const subtotal = selectedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const hasSelection = selectedItems.length > 0
  // GST is added on top of the subtotal (GST-exclusive); cart shipping is free.
  const gst = calcGst(subtotal)
  const total = subtotal + gst

  return (
    <div className="border-t border-[var(--color-tt-outline-variant)]/30 bg-[var(--color-tt-surface-container)] px-6 py-6">
      {/* Subtotal */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-tt-outline)] font-semibold">
            Subtotal ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
          </span>
          <span
            data-testid="cart-subtotal"
            className="text-[13px] font-semibold text-[var(--color-tt-ink)]"
          >
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-tt-outline)] font-semibold">
            GST (12%)
          </span>
          <span className="text-[10px] font-semibold text-[var(--color-tt-outline)] uppercase tracking-wider">
            {formatPrice(gst)}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-tt-outline)] font-semibold">
            Shipping
          </span>
          <span className="text-[10px] font-semibold text-[var(--color-tt-gold)] uppercase tracking-wider">
            Complimentary
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline mb-5 pt-4 border-t border-[var(--color-tt-outline-variant)]/20">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-tt-ink)]">
          Estimated Total
        </span>
        <span data-testid="cart-total" className="text-xl font-bold text-[var(--color-tt-gold)]">
          {formatPrice(total)}
        </span>
      </div>

      {/* Taxes note */}
      <p className="text-[9px] text-[var(--color-tt-outline)] tracking-wider uppercase mb-5 text-center">
        GST included in total · Free delivery on orders above Rs. 15,000
      </p>

      {/* CTA */}
      {hasSelection ? (
        <Link
          href="/checkout"
          onClick={closeCart}
          data-testid="checkout-cta"
          className="block w-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-center py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors duration-300 rounded-[2px]"
        >
          Proceed to Checkout
        </Link>
      ) : (
        <button
          type="button"
          disabled
          data-testid="checkout-cta-disabled"
          className="block w-full bg-[var(--color-tt-surface-container-high)] text-[var(--color-tt-outline)] text-center py-4 text-[11px] font-bold tracking-[0.2em] uppercase rounded-[2px] cursor-not-allowed"
        >
          Select items to checkout
        </button>
      )}
    </div>
  )
}
