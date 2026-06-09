'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getCurrentUserIdAction } from '@/actions/session'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { takePendingCartAdd } from '@/lib/pending-cart'

/**
 * Mounted once in the root layout. Resolves the current customer id from the
 * server session cookie and switches the wishlist namespace + refreshes the
 * cart's in-memory state so each browser-shared user sees only their own data.
 *
 * Re-runs whenever the pathname changes — that's how we catch login/register
 * redirects and logout-redirects without exposing a global event bus.
 */
export function SessionSync() {
  const pathname = usePathname()
  const setUser = useWishlistStore((s) => s.setUser)
  const initCart = useCartStore((s) => s.initCart)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const userId = await getCurrentUserIdAction()
      if (cancelled) return
      setUser(userId)
      await initCart()
      if (cancelled || !userId) return
      // Finish an add-to-cart a guest deferred while signing in (set by
      // QuickAddToCart before redirecting to /login).
      const pendingVariantId = takePendingCartAdd()
      if (pendingVariantId) {
        await addItem(pendingVariantId, 1)
        if (!cancelled) openCart()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pathname, setUser, initCart, addItem, openCart])

  return null
}
