'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

interface EmptyCartProps {
  onClose: () => void
}

export function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <div
      data-testid="empty-cart"
      className="flex flex-col items-center justify-center flex-grow px-8 py-16 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--color-tt-surface-container)] flex items-center justify-center mb-6">
        <ShoppingBag size={28} className="text-[var(--color-tt-outline)]" />
      </div>

      <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[var(--color-tt-ink)] mb-2">
        Your Cart is Empty
      </h3>
      <p className="text-[11px] text-[var(--color-tt-outline)] tracking-wider uppercase mb-8 leading-relaxed max-w-[200px]">
        Discover our curated collection of heirlooms
      </p>

      <Link
        href="/products"
        data-testid="continue-shopping-link"
        onClick={onClose}
        className="inline-block bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] px-8 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors duration-300 rounded-[2px]"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
