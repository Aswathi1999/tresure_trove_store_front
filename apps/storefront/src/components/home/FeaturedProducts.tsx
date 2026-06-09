import Image from 'next/image'
import Link from 'next/link'
import { SectionReveal } from '@/components/layout/SectionReveal'
import { QuickAddToCart } from '@/components/home/QuickAddToCart'
import type { HomepageProduct } from '@/lib/medusa'

interface FeaturedProductsProps {
  products: HomepageProduct[]
  title: string
  subtitle: string
  viewAllHref?: string
  viewAllLabel?: string
}

const badgeClasses: Record<string, string> = {
  orange: 'bg-[var(--color-tt-orange)] text-white',
  brown: 'bg-[var(--color-tt-brown)] text-white',
  gold: 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]',
}

export function FeaturedProducts({
  products,
  title,
  subtitle,
  viewAllHref = '/products',
  viewAllLabel = 'View All',
}: FeaturedProductsProps) {
  return (
    <section
      className="py-12 px-4 lg:px-8"
      style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
      aria-label={title}
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionReveal>
          <div className="text-center mb-8">
            <h2 className="tt-reveal-blur text-[var(--color-tt-ink)] text-2xl font-bold mb-1">
              {title}
            </h2>
            <p className="tt-reveal-up text-[var(--color-tt-ink-muted)] text-sm">{subtitle}</p>
          </div>
        </SectionReveal>

        {products.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-tt-ink-muted)]">
            Could not load products — please refresh
          </div>
        ) : (
          <SectionReveal delay={0.1}>
            <div className="tt-stagger grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product, idx) => (
                <Link
                  key={product.id}
                  href={product.href}
                  data-testid={`product-card-${product.id}`}
                  className="group block"
                  style={{ '--i': idx } as React.CSSProperties}
                >
                  <div className="tt-zoom-hover relative aspect-[4/5] overflow-hidden rounded-lg bg-[var(--color-tt-surface)]">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={idx < 2}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-tt-surface)]">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]">
                          No Image
                        </span>
                      </div>
                    )}
                    {product.badge && (
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeClasses[product.badgeVariant ?? 'gold']}`}
                      >
                        {product.badge}
                      </span>
                    )}
                    {product.inStock === false && (
                      <div
                        data-testid={`out-of-stock-${product.id}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                      >
                        <span className="bg-black/60 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-14 bg-gradient-to-t from-black/70 to-transparent transition-all duration-500 flex items-end justify-center pb-3 overflow-hidden">
                      <span
                        className="text-white text-xs font-bold tracking-widest-ui uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        Quick View →
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 px-0.5">
                    <p className="text-[var(--color-tt-ink)] text-sm font-semibold leading-snug">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[var(--color-tt-ink)] text-sm font-bold">
                        {product.price || 'Price on request'}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[var(--color-tt-ink-muted)] text-xs line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    <QuickAddToCart
                      productId={product.id}
                      productHref={product.href}
                      variantId={product.defaultVariantId}
                      inStock={product.inStock !== false}
                      quickAdd={
                        Boolean(product.price) &&
                        product.variantCount === 1 &&
                        Boolean(product.defaultVariantId)
                      }
                    />
                  </div>
                </Link>
              ))}
            </div>
          </SectionReveal>
        )}

        {viewAllHref && (
          <SectionReveal delay={0.2}>
            <div className="mt-8 text-center">
              <Link
                href={viewAllHref}
                data-testid="view-all-button"
                className="inline-flex items-center gap-2 border border-[var(--color-tt-ink)] text-[var(--color-tt-ink)] text-xs font-bold tracking-widest px-8 py-3 rounded hover:bg-[var(--color-tt-ink)] hover:text-[var(--color-tt-gold)] transition-colors"
              >
                {viewAllLabel}
              </Link>
            </div>
          </SectionReveal>
        )}
      </div>
    </section>
  )
}
