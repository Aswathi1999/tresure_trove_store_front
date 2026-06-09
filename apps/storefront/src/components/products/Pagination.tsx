'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 mt-16"
      data-testid="pagination"
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="p-2 border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] disabled:opacity-30 hover:bg-[var(--color-tt-surface-container)] transition-colors"
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          data-testid={`page-button-${p}`}
          className={`w-8 h-8 text-[10px] font-bold tracking-widest transition-colors ${
            p === currentPage
              ? 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]'
              : 'border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)]'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="p-2 border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] disabled:opacity-30 hover:bg-[var(--color-tt-surface-container)] transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
