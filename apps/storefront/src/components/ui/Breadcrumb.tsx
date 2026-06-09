import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Tailwind max-width class for the inner container, so a page can align the
   *  breadcrumb to its own content width. Defaults to the site-wide container. */
  maxWidthClassName?: string
}

export function Breadcrumb({ items, maxWidthClassName = 'max-w-screen-2xl' }: BreadcrumbProps) {
  return (
    <div className="w-full py-2 bg-[var(--color-tt-surface-container)]">
      <div className={`${maxWidthClassName} mx-auto px-4 lg:px-8`}>
        <nav
          aria-label="Breadcrumb"
          data-testid="breadcrumb"
          className="flex flex-wrap items-center gap-2.5 text-[13px] leading-none tracking-[0.15em] font-medium uppercase text-[var(--color-tt-outline)]"
        >
          {items.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2.5">
              {idx > 0 && <ChevronRight size={14} strokeWidth={2} />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--color-tt-gold)] transition-colors duration-200"
                  data-testid={`breadcrumb-link-${idx}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--color-tt-ink)]" data-testid={`breadcrumb-current`}>
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
