'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export interface SubcategoryChip {
  label: string
  value: string
  count?: number
}

interface SubcategoryChipsProps {
  chips: SubcategoryChip[]
}

export function SubcategoryChips({ chips }: SubcategoryChipsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('sub') ?? ''

  const handleClick = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('sub', value)
      } else {
        params.delete('sub')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div
      className="sticky top-[104px] z-40 h-14 flex items-center justify-center gap-3 overflow-x-auto hide-scrollbar px-4"
      style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
    >
      {chips.map((chip) => {
        const active = chip.value === '' ? current === '' : current === chip.value
        return (
          <button
            key={chip.value}
            onClick={() => handleClick(chip.value)}
            className={`shrink-0 px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors duration-200 ${
              active
                ? 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]'
                : 'border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container-lowest)]'
            }`}
          >
            {chip.label}
            {chip.count !== undefined ? ` (${chip.count})` : ''}
          </button>
        )
      })}
    </div>
  )
}
