'use client'

import Link from 'next/link'
import { User, Heart, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'

export function DesktopNavIcons() {
  const { toggleCart, items } = useCartStore()
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/account"
        aria-label="My account"
        className="text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors"
      >
        <User size={22} />
      </Link>
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors"
      >
        <Heart size={22} />
      </Link>
      <button
        data-testid="desktop-cart-trigger"
        onClick={toggleCart}
        aria-label="Open shopping cart"
        className="relative text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors"
      >
        <ShoppingBag size={22} />
        {itemCount > 0 && (
          <span
            data-testid="desktop-cart-count"
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[9px] font-bold flex items-center justify-center"
          >
            {itemCount}
          </span>
        )}
      </button>
    </div>
  )
}
