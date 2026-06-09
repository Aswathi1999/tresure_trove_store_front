'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { isUserAuthenticated } from '@/lib/auth/actions'
import { setPendingCartAdd } from '@/lib/pending-cart'

interface QuickAddToCartProps {
  productId: string
  /** PDP link — where we fall back when the product can't be added blind. */
  productHref: string
  /** First variant id. Only used when `quickAdd` is true (single, priced variant). */
  variantId?: string
  /**
   * True when the product is safe to add straight from the card: it has a price
   * and exactly one variant. Multi-variant / price-on-request products instead
   * route to the PDP so the shopper can choose options first.
   */
  quickAdd: boolean
  /** When false, the product is sold out: the button is disabled and shows "Out of Stock". */
  inStock?: boolean
}

export function QuickAddToCart({
  productId,
  productHref,
  variantId,
  quickAdd,
  inStock = true,
}: QuickAddToCartProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [busy, setBusy] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    // This button sits inside the card's <Link>; take over the click so adding
    // to the cart doesn't also navigate to the product page.
    e.preventDefault()
    e.stopPropagation()
    if (busy || !inStock) return

    // Can't add an unspecified variant — send the shopper to the PDP to choose.
    if (!quickAdd || !variantId) {
      router.push(productHref)
      return
    }

    setBusy(true)
    try {
      // Guests must sign in first. Remember the intended item so SessionSync can
      // finish the add automatically once they return authenticated.
      const authed = await isUserAuthenticated()
      if (!authed) {
        setPendingCartAdd(variantId)
        router.push('/login?redirect=/')
        return
      }
      await addItem(variantId, 1)
      openCart()
    } finally {
      setBusy(false)
    }
  }

  if (!inStock) {
    return (
      <button
        type="button"
        data-testid={`add-to-cart-${productId}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        disabled
        aria-disabled="true"
        className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm border border-[var(--color-tt-outline-variant)] bg-[var(--color-tt-surface-container)] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-tt-outline)]"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      type="button"
      data-testid={`add-to-cart-${productId}`}
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--color-tt-ink)] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-tt-ink)] transition-colors hover:bg-[var(--color-tt-ink)] hover:text-[var(--color-tt-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && (
        <Loader2
          size={12}
          className="animate-spin"
          data-testid={`add-to-cart-spinner-${productId}`}
        />
      )}
      {quickAdd ? 'Add to Cart' : 'Select Options'}
    </button>
  )
}
