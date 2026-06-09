'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

export interface BrowseLink {
  label: string
  href: string
}

interface NoResultsProps {
  query: string
  /** Real collections to browse, supplied by the server. Falls back to an
   *  "all products" link when none are available, so the buttons always lead
   *  somewhere valid (the old hardcoded handles pointed at non-existent pages). */
  links?: BrowseLink[]
}

const linkCls =
  'px-4 py-2 border border-[var(--color-tt-outline-variant)] text-[10px] font-bold uppercase tracking-widest hover:border-[var(--color-tt-ink)] hover:text-[var(--color-tt-ink)] text-[var(--color-tt-outline)] transition-colors'

export function NoResults({ query, links }: NoResultsProps) {
  const browseLinks = links ?? []

  return (
    <div
      data-testid="no-results"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Search size={48} className="text-[var(--color-tt-outline-variant)] mb-8" strokeWidth={1} />
      <h2 className="text-2xl font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-3">
        No results for &lsquo;{query}&rsquo;
      </h2>
      <p className="text-sm text-[var(--color-tt-outline)] tracking-widest uppercase mb-10 max-w-sm">
        Try different keywords or explore our collections below
      </p>
      {browseLinks.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {browseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`no-results-browse-${link.label}`}
              className={linkCls}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : (
        <Link href="/products" data-testid="no-results-browse-all" className={linkCls}>
          Browse All Products
        </Link>
      )}
    </div>
  )
}
