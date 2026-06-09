import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="w-full py-1.5" style={{ backgroundColor: 'var(--color-tt-surface-container)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2.5 text-[13px] leading-none tracking-[0.15em] font-medium uppercase text-[var(--color-tt-outline)]"
        >
          {items.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2.5">
              {idx > 0 && <ChevronRight size={14} strokeWidth={2} />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--color-tt-gold)] transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--color-tt-ink)]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
