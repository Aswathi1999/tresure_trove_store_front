'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWishlistStore, type WishlistItem } from '@/stores/wishlist'

interface Props {
  item: WishlistItem
  size?: number
  className?: string
  // When the button sits inside a parent <Link>/<button>, set this so the
  // wrapping element doesn't navigate / submit when the heart is clicked.
  stopPropagation?: boolean
}

export function WishlistButton({
  item,
  size = 18,
  className = '',
  stopPropagation = false,
}: Props): React.JSX.Element {
  const [mounted, setMounted] = useState(false)
  // Subscribe to a value DERIVED FROM `items` (not the stable `has` function) so
  // the button re-renders the instant the item is toggled. Selecting `s.has`
  // returned the same function reference every time, so Zustand never re-rendered
  // this component on change — the heart only updated after an unrelated refresh.
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.id === item.id))
  const toggle = useWishlistStore((s) => s.toggle)

  useEffect(() => {
    setMounted(true)
  }, [])

  const active = mounted && inWishlist

  return (
    <button
      type="button"
      onClick={(e) => {
        if (stopPropagation) {
          e.preventDefault()
          e.stopPropagation()
        }
        toggle(item)
      }}
      aria-label={active ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
      aria-pressed={active}
      data-testid={`wishlist-toggle-${item.id}`}
      suppressHydrationWarning
      className={`inline-flex items-center justify-center transition-colors ${
        active
          ? 'text-[var(--color-tt-danger)]'
          : 'text-[var(--color-tt-outline)] hover:text-[var(--color-tt-danger)]'
      } ${className}`}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
