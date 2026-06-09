'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Check } from 'lucide-react'
import { ProductCard } from '@/components/products/ProductCard'
import { NoResults, type BrowseLink } from './NoResults'
import type { SearchProduct } from '@/lib/medusa'

const SORT_OPTIONS = ['Featured', 'Newest', 'Price: Low to High', 'Price: High to Low']
const MAX_PRICE = 50000

interface SearchResultsProps {
  query: string
  initialProducts: SearchProduct[]
  /** Real collections shown as browse shortcuts in the no-results state. */
  browseLinks?: BrowseLink[]
}

export function SearchResults({ query, initialProducts, browseLinks }: SearchResultsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('Featured')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close the sort dropdown on outside click or Escape.
  useEffect(() => {
    if (!sortOpen) return
    const onPointer = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSortOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [sortOpen])

  const availableCategories = useMemo(() => {
    const counts = new Map<string, number>()
    initialProducts.forEach((p) => {
      if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    })
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }))
  }, [initialProducts])

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      if (activeCategory && p.category && p.category !== activeCategory) return false
      if (priceMax < MAX_PRICE && p.priceAmount > priceMax) return false
      return true
    })
  }, [initialProducts, activeCategory, priceMax])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'Price: Low to High') arr.sort((a, b) => a.priceAmount - b.priceAmount)
    if (sortBy === 'Price: High to Low') arr.sort((a, b) => b.priceAmount - a.priceAmount)
    return arr
  }, [filtered, sortBy])

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-2 pb-12 lg:pt-3 lg:pb-16">
      {/* Breadcrumb — matches the site-wide Breadcrumb style (13px, gold hover) */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2.5 text-[13px] tracking-[0.15em] font-medium uppercase text-[var(--color-tt-outline)] mb-6"
      >
        <Link href="/" className="hover:text-[var(--color-tt-gold)] transition-colors duration-200">
          Home
        </Link>
        <ChevronRight size={14} strokeWidth={2} />
        <span className="text-[var(--color-tt-ink)]">Search</span>
      </nav>

      {/* True no-results (search returned nothing): show only a full-width,
          centered message — no heading/sort row or sidebar to throw off the
          alignment. The inner check below still covers filters excluding all. */}
      {initialProducts.length === 0 ? (
        <NoResults query={query} links={browseLinks} />
      ) : (
        <>
          {/* Heading + Sort */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1
                data-testid="search-heading"
                className="text-xl md:text-3xl font-bold tracking-tight uppercase mb-2 text-[var(--color-tt-ink)]"
              >
                Results for &lsquo;{query}&rsquo;
              </h1>
              <p
                data-testid="search-result-count"
                className="text-sm text-[var(--color-tt-outline)] font-medium uppercase tracking-widest"
              >
                {sorted.length} product{sorted.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold uppercase tracking-wide text-[var(--color-tt-ink)] whitespace-nowrap">
                Sort By:
              </span>
              <div className="relative" ref={sortRef}>
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setSortOpen((v) => !v)}
                  data-testid="search-sort"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className="inline-flex items-center justify-between gap-3 min-w-[210px] bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-md pl-4 pr-3 py-2.5 text-sm font-semibold tracking-wide uppercase text-[var(--color-tt-ink)] cursor-pointer outline-none transition-colors duration-200 hover:border-[var(--color-tt-gold)] focus:border-[var(--color-tt-gold)] focus:ring-2 focus:ring-[var(--color-tt-gold)]/30"
                >
                  {sortBy}
                  <ChevronDown
                    size={17}
                    className={`text-[var(--color-tt-outline)] transition-transform duration-200 ${
                      sortOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                {sortOpen && (
                  <ul
                    role="listbox"
                    aria-label="Sort results by"
                    data-testid="search-sort-options"
                    className="absolute right-0 z-20 mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-[var(--color-tt-outline-variant)] bg-[var(--color-tt-surface)] py-1.5 shadow-xl shadow-black/5"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const selected = opt === sortBy
                      return (
                        <li key={opt} role="option" aria-selected={selected}>
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy(opt)
                              setSortOpen(false)
                            }}
                            className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm tracking-wide transition-colors duration-150 ${
                              selected
                                ? 'font-bold text-[var(--color-tt-gold)] bg-[var(--color-tt-gold)]/8'
                                : 'font-medium text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)]'
                            }`}
                          >
                            {opt}
                            {selected && <Check size={16} className="shrink-0" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filter sidebar — omitted when the search returned no products, so the
            no-results message spans the full width instead of leaving a blank gap. */}
            {initialProducts.length > 0 && (
              <aside className="w-full lg:w-64 shrink-0">
                <div className="lg:sticky lg:top-40 space-y-10">
                  {availableCategories.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wide mb-5 pb-3 border-b border-[var(--color-tt-outline-variant)]">
                        Categories
                      </h3>
                      <ul className="space-y-3">
                        {availableCategories.map(({ label, count }) => (
                          <li
                            key={label}
                            data-testid={`filter-category-${label}`}
                            onClick={() =>
                              setActiveCategory(activeCategory === label ? null : label)
                            }
                            className={`flex justify-between items-center cursor-pointer transition-colors ${
                              activeCategory === label
                                ? 'text-[var(--color-tt-ink)] font-bold'
                                : 'text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)]'
                            }`}
                          >
                            <span className="text-sm font-semibold uppercase tracking-wide">
                              {label}
                            </span>
                            <span className="text-xs font-bold">
                              {String(count).padStart(2, '0')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wide mb-5 pb-3 border-b border-[var(--color-tt-outline-variant)]">
                      Price Range
                    </h3>
                    <div className="space-y-3">
                      <input
                        data-testid="filter-price-range"
                        type="range"
                        min={0}
                        max={MAX_PRICE}
                        step={1000}
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="w-full h-1.5 accent-[var(--color-tt-gold)] cursor-pointer"
                      />
                      <div className="flex justify-between text-sm font-semibold tracking-wide text-[var(--color-tt-outline)]">
                        <span>₹0</span>
                        <span>₹{priceMax.toLocaleString('en-IN')}+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Product Grid */}
            <div className="flex-grow" data-testid="search-results-grid">
              {sorted.length === 0 ? (
                <NoResults query={query} links={browseLinks} />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
                    {sorted.map((product, i) => (
                      <ProductCard key={product.id} product={product} priority={i < 4} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-24 flex items-center justify-center gap-8 border-t border-[var(--color-tt-outline-variant)] pt-12">
                    <button
                      disabled
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-tt-outline)] disabled:opacity-30"
                    >
                      ← Prev
                    </button>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold tracking-[0.2em] border-b-2 border-[var(--color-tt-gold)] pb-1">
                        01
                      </span>
                    </div>
                    <button
                      disabled
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-tt-outline)] disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
