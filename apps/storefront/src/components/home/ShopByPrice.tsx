import Link from 'next/link'
import type { PriceBucket } from '@/lib/payload'

interface ShopByPriceProps {
  heading: string
  buckets: PriceBucket[]
}

export function ShopByPrice({ heading, buckets }: ShopByPriceProps) {
  if (buckets.length === 0) return null

  return (
    <section
      aria-label="Shop by Price"
      data-testid="shop-by-price"
      className="py-8 lg:py-12 px-4 lg:px-8 bg-[var(--color-tt-bg)]"
    >
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-[var(--color-tt-ink)] text-lg lg:text-2xl font-bold mb-4 lg:mb-6 lg:text-center">
          {heading}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {buckets.map(({ label, href, dark }) => (
            <Link
              key={label}
              href={href}
              data-testid={`price-bucket-${label.replace(/\s/g, '-').toLowerCase()}`}
              className={`flex items-center justify-center h-16 lg:h-24 rounded-lg text-sm lg:text-base font-bold tracking-wide transition-opacity hover:opacity-90 ${
                dark
                  ? 'bg-[var(--color-tt-ink)] text-[var(--color-tt-gold)]'
                  : 'bg-[var(--color-tt-surface-container-high)] text-[var(--color-tt-ink)]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
