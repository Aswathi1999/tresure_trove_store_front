'use client'

import { useEffect, useState } from 'react'
import { useWishlistStore } from '@/stores/wishlist'

// The wishlist lives in a client-side Zustand store (localStorage), so the
// Server-Component dashboard can't read it directly — that's why the count was
// previously hardcoded to 0. This renders the real count. It shows 0 until
// mounted to avoid an SSR/CSR hydration mismatch (the server has no
// localStorage). The active user's list is already selected by SessionSync.
export function WishlistCount() {
  const [mounted, setMounted] = useState(false)
  const count = useWishlistStore((s) => (mounted ? s.items.length : 0))

  useEffect(() => {
    setMounted(true)
  }, [])

  return <span data-testid="dashboard-wishlist-count">{count}</span>
}
