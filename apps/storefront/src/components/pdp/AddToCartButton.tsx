'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart'
import { isUserAuthenticated } from '@/lib/auth/actions'
import { ShoppingBag, Loader2 } from 'lucide-react'

interface AddToCartButtonProps {
  variantId: string
  quantity: number
  outOfStock: boolean
  productTitle: string
  price: number
  imageUrl: string
}

export function AddToCartButton({
  variantId,
  quantity,
  outOfStock,
  productTitle,
  price,
  imageUrl,
}: AddToCartButtonProps) {
  const router = useRouter()
  const { isLoading, addItem, openCart } = useCartStore()
  const [isChecking, setIsChecking] = useState(false)

  async function handleAddToCart() {
    if (outOfStock || !variantId) return

    setIsChecking(true)
    try {
      const isAuthenticated = await isUserAuthenticated()
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      await addItem(variantId, quantity)
      openCart()
    } finally {
      setIsChecking(false)
    }
  }

  if (outOfStock) {
    return (
      <div
        className="flex-1 flex items-center justify-center py-4 bg-[var(--color-tt-surface-container-high)] text-[var(--color-tt-outline)] text-[11px] font-bold tracking-widest uppercase cursor-not-allowed"
        data-testid="add-to-cart-disabled"
      >
        Currently Unavailable
      </div>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || isChecking}
      data-testid="add-to-cart-button"
      className="flex-1 flex items-center justify-center gap-2 py-4 bg-[var(--color-tt-gold)] hover:bg-[var(--color-tt-gold-hover)] text-[var(--color-tt-ink)] font-bold tracking-widest uppercase text-[11px] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading || isChecking ? (
        <Loader2 size={16} className="animate-spin" data-testid="cart-loading-spinner" />
      ) : (
        <ShoppingBag size={16} />
      )}
      Add to Cart
    </button>
  )
}
