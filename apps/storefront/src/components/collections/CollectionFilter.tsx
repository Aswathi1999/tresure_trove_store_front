'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { MockProduct } from '@/lib/collections.mock'

export const MAX_PRICE_DEFAULT = 50000

interface CollectionFilterProps {
  products: MockProduct[]
  /** Slider ceiling + default. Falls back to 50000. */
  maxPriceCeiling?: number
}

export function CollectionFilter({
  products,
  maxPriceCeiling,
}: CollectionFilterProps): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const priceMax = maxPriceCeiling ?? MAX_PRICE_DEFAULT

  const committedMaxPrice = Math.min(Number(searchParams.get('maxPrice') ?? priceMax), priceMax)

  // Local dragging value for smooth slider UX — synced from URL on back navigation
  const [draggingPrice, setDraggingPrice] = useState(committedMaxPrice)
  useEffect(() => {
    setDraggingPrice(committedMaxPrice)
  }, [committedMaxPrice])

  const [mobileOpen, setMobileOpen] = useState(false)

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setDraggingPrice(priceMax)
    router.replace(pathname)
  }

  const hasActiveFilters = committedMaxPrice < priceMax

  const filteredCount = products.filter((p) => {
    if (p.priceValue > committedMaxPrice) return false
    return true
  }).length

  const filterContent = (
    <div className="space-y-10">
      {/* Price Range */}
      <div>
        <h3 className="text-base font-bold tracking-wide uppercase mb-5 text-[var(--color-tt-ink)]">
          Price (₹0 – ₹{draggingPrice.toLocaleString('en-IN')})
        </h3>
        <input
          type="range"
          min={0}
          max={priceMax}
          step={Math.max(500, Math.round(priceMax / 100))}
          value={draggingPrice}
          onChange={(e) => setDraggingPrice(Number(e.target.value))}
          onMouseUp={(e) => updateParam('maxPrice', (e.target as HTMLInputElement).value)}
          onTouchEnd={(e) => updateParam('maxPrice', (e.target as HTMLInputElement).value)}
          data-testid="collection-price-range"
          aria-label="Maximum price filter"
          className="w-full appearance-none cursor-pointer h-1 rounded-full bg-[var(--color-tt-outline-variant)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-tt-gold)] [&::-webkit-slider-thumb]:shadow-sm"
        />
        <div className="flex justify-between mt-4 text-sm font-medium tracking-wide text-[var(--color-tt-outline)]">
          <span>₹0</span>
          <span>₹{priceMax.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Result count */}
      <p
        data-testid="filter-result-count"
        className="text-sm font-medium text-[var(--color-tt-outline)] tracking-wide uppercase pt-5 border-t border-[var(--color-tt-outline-variant)]/30"
      >
        {filteredCount} of {products.length} {products.length === 1 ? 'product' : 'products'}
      </p>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-testid="collection-filter-sidebar"
        className="hidden lg:block w-[280px] shrink-0 sticky top-[176px] h-fit"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold tracking-wide uppercase text-[var(--color-tt-ink)]">
            Filter
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              data-testid="clear-filters-button"
              className="text-[var(--color-tt-gold)] text-sm font-bold tracking-wide uppercase hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
        {filterContent}
      </aside>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-5">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          data-testid="mobile-filter-toggle"
          suppressHydrationWarning
          className="flex items-center gap-2.5 px-5 py-3 border border-[var(--color-tt-outline-variant)] text-sm font-bold tracking-wide uppercase text-[var(--color-tt-ink)]"
        >
          <SlidersHorizontal size={17} />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[10px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div
            data-testid="mobile-filter-panel"
            className="mt-4 p-5 border border-[var(--color-tt-outline-variant)] bg-[var(--color-tt-surface)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold tracking-wide uppercase text-[var(--color-tt-ink)]">
                Filter
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  data-testid="clear-filters-button-mobile"
                  className="text-[var(--color-tt-gold)] text-sm font-bold tracking-wide uppercase hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {filterContent}
          </div>
        )}
      </div>
    </>
  )
}
