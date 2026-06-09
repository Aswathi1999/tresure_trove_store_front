'use client'

import { useEffect, useState } from 'react'
import { useWishlistStore } from '@/stores/wishlist'

export function WishlistHeader() {
  const items = useWishlistStore((s) => s.items)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const count = mounted ? items.length : 0

  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
        My Account
      </p>
      <h1 className="text-2xl font-bold text-[var(--color-tt-ink)]">Wishlist</h1>
      <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1" suppressHydrationWarning>
        {count} saved {count === 1 ? 'item' : 'items'}
      </p>
    </div>
  )
}
