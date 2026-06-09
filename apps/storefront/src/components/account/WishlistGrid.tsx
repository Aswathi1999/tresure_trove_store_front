'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlist'

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function WishlistGrid() {
  const items = useWishlistStore((s) => s.items)
  const remove = useWishlistStore((s) => s.remove)
  const [mounted, setMounted] = useState(false)

  // Avoid SSR/CSR mismatch: localStorage isn't readable on the server, so the
  // initial Zustand state is empty. Defer rendering of items until hydration.
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        data-testid="wishlist-loading"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] rounded-sm bg-[var(--color-tt-surface-container-high)] mb-3" />
            <div className="h-3 bg-[var(--color-tt-surface-container-high)] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[var(--color-tt-surface-container)] rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div
        data-testid="wishlist-empty"
        className="flex flex-col items-center justify-center py-24 bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm text-center"
      >
        <ShoppingBag size={32} className="text-[var(--color-tt-outline)] mb-4" />
        <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)] mb-4">
          Your wishlist is empty
        </p>
        <Link
          href="/products"
          className="text-xs font-bold tracking-widest uppercase text-[var(--color-tt-orange)] hover:underline"
        >
          Discover Products
        </Link>
      </div>
    )
  }

  return (
    <div
      data-testid="wishlist-grid"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"
    >
      {items.map((item) => (
        <div key={item.id} data-testid={`wishlist-item-${item.id}`} className="group relative">
          <button
            onClick={() => remove(item.id)}
            data-testid={`remove-wishlist-${item.id}`}
            aria-label={`Remove ${item.title} from wishlist`}
            className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-[var(--color-tt-outline)] hover:text-[var(--color-tt-danger)] transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <X size={12} />
          </button>

          <Link href={`/products/${item.handle}`} className="block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[var(--color-tt-surface-container)] mb-3">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-tt-outline)] text-[9px] tracking-widest uppercase">
                  No Image
                </div>
              )}
            </div>

            <h4 className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-1 leading-snug">
              {item.title}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium text-[var(--color-tt-orange)]">
                {formatINR(item.price)}
              </p>
              {item.originalPrice && (
                <p className="text-[10px] text-[var(--color-tt-outline)] line-through">
                  {formatINR(item.originalPrice)}
                </p>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
