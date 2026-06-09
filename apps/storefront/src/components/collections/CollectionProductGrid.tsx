'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MAX_PRICE_DEFAULT } from './CollectionFilter'
import type { MockProduct } from '@/lib/collections.mock'

const badgeClasses: Record<string, string> = {
  orange: 'bg-[var(--color-tt-orange)] text-white',
  brown: 'bg-[var(--color-tt-brown)] text-white',
  gold: 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]',
}

interface ProductItemProps {
  product: MockProduct
  priority: boolean
}

function ProductItem({ product, priority }: ProductItemProps) {
  return (
    <Link
      href={product.href}
      className="group block"
      data-testid={`collection-product-card-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-4 bg-[var(--color-tt-surface-container-high)]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-tt-outline-variant)]">
            <div className="w-10 h-10 rounded-full border border-[var(--color-tt-outline-variant)] flex items-center justify-center">
              <span className="text-[10px] font-bold">TT</span>
            </div>
            <span className="text-[9px] tracking-widest uppercase">{product.material}</span>
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 ${badgeClasses[product.badgeVariant ?? 'gold']}`}
          >
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div
            data-testid={`out-of-stock-${product.id}`}
            className="absolute inset-0 bg-black/30 flex items-center justify-center"
          >
            <span className="text-white text-[9px] font-bold tracking-widest uppercase bg-black/50 px-3 py-1">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-sm text-[var(--color-tt-ink)] text-xs font-bold tracking-widest uppercase py-3 text-center">
            Quick View
          </div>
        </div>
      </div>

      <h4 className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-1 leading-snug">
        {product.title}
      </h4>
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-medium tracking-wider text-[var(--color-tt-outline)]">
          {product.price}
        </p>
        {product.originalPrice && (
          <p className="text-[10px] text-[var(--color-tt-outline)] line-through">
            {product.originalPrice}
          </p>
        )}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-sm bg-[var(--color-tt-surface-container-high)] mb-4" />
      <div className="h-3 bg-[var(--color-tt-surface-container-high)] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[var(--color-tt-surface-container)] rounded w-1/3" />
    </div>
  )
}

interface CollectionProductGridProps {
  products: MockProduct[]
  collectionHandle: string
  /** Price-slider ceiling — must match CollectionFilter so the grid shows every
   *  product the count claims. Without it the grid defaulted to MAX_PRICE_DEFAULT
   *  (₹50k) and silently hid pricier products that the count still included. */
  maxPriceCeiling?: number
}

export function CollectionProductGrid({
  products,
  collectionHandle,
  maxPriceCeiling,
}: CollectionProductGridProps) {
  const searchParams = useSearchParams()
  // Default to the dynamic ceiling (same as CollectionFilter), and clamp any
  // explicit param to it, so "X of Y" and the rendered grid always agree.
  const ceiling = maxPriceCeiling ?? MAX_PRICE_DEFAULT
  const maxPrice = Math.min(Number(searchParams.get('maxPrice') ?? ceiling), ceiling)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filtered = products.filter((p) => {
    if (p.priceValue > maxPrice) return false
    return true
  })

  if (isLoading) {
    return (
      <div
        data-testid="collection-product-grid-skeleton"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div
        data-testid={`collection-empty-${collectionHandle}`}
        className="flex flex-col items-center justify-center py-28 text-center"
      >
        <div className="w-14 h-14 rounded-full border-2 border-[var(--color-tt-outline-variant)] flex items-center justify-center mb-5">
          <span className="text-[var(--color-tt-outline)] text-xs font-bold">0</span>
        </div>
        <p className="text-sm font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-2">
          No products found
        </p>
        <p className="text-xs text-[var(--color-tt-outline)] tracking-wider mb-6">
          Try adjusting your filters or browse all collections
        </p>
        <Link
          href="/collections"
          data-testid="empty-state-browse-link"
          className="inline-block px-6 py-2.5 bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors"
        >
          Browse All Collections
        </Link>
      </div>
    )
  }

  return (
    <div
      data-testid="collection-product-grid"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10"
    >
      {filtered.map((product, i) => (
        <ProductItem key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  )
}
