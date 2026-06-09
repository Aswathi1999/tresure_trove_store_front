'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SortToolbarProps {
  total: number
  offset: number
  limit: number
}

const SORT_OPTIONS = [
  { label: 'Recommended', value: '' },
  { label: 'Price: Low to High', value: 'variants.prices.amount' },
  { label: 'Price: High to Low', value: '-variants.prices.amount' },
  { label: 'Newest Arrivals', value: '-created_at' },
]

export function SortToolbar({ total, offset, limit }: SortToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? ''
  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? 'Recommended'

  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('sort', value)
      } else {
        params.delete('sort')
      }
      params.delete('page')
      router.replace(`${pathname}?${params.toString()}`)
      setOpen(false)
    },
    [router, pathname, searchParams],
  )

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-10 pb-5 border-b border-[var(--color-tt-outline-variant)]/25"
      data-testid="sort-toolbar"
    >
      <p
        className="text-sm tracking-wide font-semibold text-[var(--color-tt-ink-muted)]"
        data-testid="results-count"
      >
        {total === 0 ? 'No results' : `Displaying ${from}–${to} of ${total} Results`}
      </p>

      <div className="flex items-center gap-3">
        <span className="text-base tracking-wide font-bold uppercase text-[var(--color-tt-ink)] whitespace-nowrap">
          Sort by:
        </span>

        <div className="relative" ref={wrapperRef}>
          {/* Trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            data-testid="sort-select"
            aria-haspopup="listbox"
            aria-expanded={open}
            suppressHydrationWarning
            className="inline-flex items-center justify-between gap-3 min-w-[210px] bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-md pl-4 pr-3 py-2.5 text-sm font-semibold tracking-wide uppercase text-[var(--color-tt-ink)] cursor-pointer outline-none transition-colors duration-200 hover:border-[var(--color-tt-gold)] focus:border-[var(--color-tt-gold)] focus:ring-2 focus:ring-[var(--color-tt-gold)]/30"
          >
            {currentLabel}
            <ChevronDown
              size={17}
              className={`text-[var(--color-tt-outline)] transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown panel */}
          {open && (
            <ul
              role="listbox"
              aria-label="Sort products by"
              data-testid="sort-options"
              className="absolute right-0 z-20 mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-[var(--color-tt-outline-variant)] bg-[var(--color-tt-surface)] py-1.5 shadow-xl shadow-black/5"
            >
              {SORT_OPTIONS.map((o) => {
                const selected = o.value === currentSort
                return (
                  <li key={o.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => handleSort(o.value)}
                      data-testid={`sort-option-${o.value || 'recommended'}`}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm tracking-wide transition-colors duration-150 ${
                        selected
                          ? 'font-bold text-[var(--color-tt-gold)] bg-[var(--color-tt-gold)]/8'
                          : 'font-medium text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)]'
                      }`}
                    >
                      {o.label}
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
  )
}
