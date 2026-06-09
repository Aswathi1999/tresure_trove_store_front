'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'

export function CartTrigger() {
  const { toggleCart, items } = useCartStore()
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <button
      data-testid="cart-trigger"
      onClick={toggleCart}
      aria-label="Open shopping cart"
      className="relative text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] transition-colors"
    >
      <ShoppingBag size={22} />
      {itemCount > 0 && (
        <span
          data-testid="cart-trigger-count"
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[9px] font-bold flex items-center justify-center"
        >
          {itemCount}
        </span>
      )}
    </button>
  )
}
