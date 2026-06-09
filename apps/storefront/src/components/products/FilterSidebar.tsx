'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'

interface FilterSidebarProps {
  totalCount: number
  /** Collection options (handle + display title). Hidden when empty. */
  collections?: Array<{ handle: string; title: string }>
  /** Slider ceiling (and default when no maxPrice param). Falls back to 50000. */
  maxPriceCeiling?: number
}

export function FilterSidebar({
  totalCount,
  collections,
  maxPriceCeiling = 50000,
}: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const collectionOptions = collections ?? []
  const priceMax = maxPriceCeiling

  const [maxPrice, setMaxPrice] = useState(() =>
    Math.min(Number(searchParams.get('maxPrice') ?? priceMax), priceMax),
  )

  const inStock = searchParams.get('inStock') === '1'
  const selectedCollections = (searchParams.get('collection') ?? '').split(',').filter(Boolean)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(true)

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== null && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  // Toggle a single value in/out of a comma-separated URL param (OR logic).
  const toggleParamValue = useCallback(
    (key: string, value: string) => {
      const current = (searchParams.get(key) ?? '').split(',').filter(Boolean)
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateParam(key, next.length > 0 ? next.join(',') : null)
    },
    [searchParams, updateParam],
  )

  const clearAll = useCallback(() => {
    setMaxPrice(priceMax)
    router.replace(pathname)
  }, [router, pathname, priceMax])

  const hasActiveFilters = inStock || selectedCollections.length > 0 || maxPrice < priceMax

  const filterContent = (
    <div className="space-y-10">
      {/* Price Range */}
      <div>
        <h3 className="text-base font-bold tracking-wide uppercase mb-5 text-[var(--color-tt-ink)]">
          Price (₹0 – ₹{maxPrice.toLocaleString('en-IN')})
        </h3>
        <input
          type="range"
          min={0}
          max={priceMax}
          step={Math.max(500, Math.round(priceMax / 100))}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={(e) => updateParam('maxPrice', (e.target as HTMLInputElement).value)}
          onTouchEnd={(e) => updateParam('maxPrice', (e.target as HTMLInputElement).value)}
          data-testid="price-range-slider"
          className="w-full appearance-none cursor-pointer h-1 rounded-full bg-[var(--color-tt-outline-variant)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-tt-gold)] [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:shadow-sm"
        />
        <div className="flex justify-between mt-4 text-sm font-medium tracking-wide text-[var(--color-tt-outline)]">
          <span>₹0</span>
          <span>₹{priceMax.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Collection */}
      {collectionOptions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setCollectionOpen((v) => !v)}
            data-testid="collection-filter-toggle"
            aria-expanded={collectionOpen}
            aria-controls="collection-filter-options"
            className="w-full text-base font-bold tracking-wide uppercase mb-5 flex justify-between items-center text-[var(--color-tt-ink)]"
          >
            Collection
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${collectionOpen ? '' : '-rotate-90'}`}
            />
          </button>
          {collectionOpen && (
            <div id="collection-filter-options" className="flex flex-col gap-3.5">
              {collectionOptions.map((c) => {
                const checked = selectedCollections.includes(c.handle)
                return (
                  <label
                    key={c.handle}
                    className="flex items-center gap-3 cursor-pointer text-sm font-semibold tracking-wide uppercase text-[var(--color-tt-ink)] hover:text-[var(--color-tt-gold)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleParamValue('collection', c.handle)}
                      data-testid={`collection-filter-${c.handle}`}
                      className="accent-[var(--color-tt-gold)] w-5 h-5"
                    />
                    {c.title}
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* In Stock Toggle */}
      <div className="pt-6 border-t border-[var(--color-tt-outline-variant)]/30">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-base font-bold tracking-wide uppercase text-[var(--color-tt-ink)]">
            In Stock Only
          </span>
          <button
            role="switch"
            aria-checked={inStock}
            onClick={() => updateParam('inStock', inStock ? null : '1')}
            data-testid="in-stock-toggle"
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              inStock ? 'bg-[var(--color-tt-gold)]' : 'bg-[var(--color-tt-outline-variant)]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                inStock ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      <p
        className="text-sm font-medium text-[var(--color-tt-outline)] tracking-wide uppercase"
        data-testid="filter-result-count"
      >
        {totalCount} {totalCount === 1 ? 'result' : 'results'}
      </p>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-[280px] shrink-0 sticky top-[176px] h-fit"
        data-testid="filter-sidebar"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold tracking-wide uppercase text-[var(--color-tt-ink)]">
            Filter
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
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
                  onClick={clearAll}
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
