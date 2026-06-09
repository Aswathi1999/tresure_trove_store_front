'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart'
import { isUserAuthenticated } from '@/lib/auth/actions'
import { Loader2 } from 'lucide-react'

interface BuyNowButtonProps {
  variantId: string
  quantity: number
  outOfStock: boolean
}

export function BuyNowButton({ variantId, quantity, outOfStock }: BuyNowButtonProps) {
  const router = useRouter()
  const { isLoading, addItem } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleBuyNow() {
    if (outOfStock || !variantId) return

    setIsProcessing(true)
    try {
      // Cart/checkout require a signed-in customer (same as Add to Cart).
      const isAuthenticated = await isUserAuthenticated()
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      // Add the selected variant, then go straight to checkout.
      await addItem(variantId, quantity)
      // Buy Now should check out ONLY this product. Select just this line item
      // so the checkout/order summary excludes other items already in the cart —
      // those remain in the cart and are only checked out via the cart flow.
      const store = useCartStore.getState()
      const line = store.items.find((i) => i.variantId === variantId)
      if (line) useCartStore.setState({ selectedIds: [line.id] })
      router.push('/checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={outOfStock || isLoading || isProcessing}
      data-testid="buy-now-button"
      className="w-full flex items-center justify-center gap-2 border-2 border-[var(--color-tt-ink)] text-[var(--color-tt-ink)] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[var(--color-tt-ink)] hover:text-white transition-all duration-200 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing && <Loader2 size={16} className="animate-spin" />}
      Buy Now
    </button>
  )
}
