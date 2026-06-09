import Image from 'next/image'
import Link from 'next/link'
import { SectionReveal } from '@/components/layout/SectionReveal'
import type { HomepageCollection } from '@/lib/medusa'

interface CollectionsGridProps {
  collections: HomepageCollection[]
  heading?: string
  subtitle?: string
}

export function CollectionsGrid({
  collections,
  heading = 'Our Collections',
  subtitle = 'Thoughtfully curated for every space',
}: CollectionsGridProps) {
  return (
    <section aria-label="Collections" className="py-12 px-4 lg:px-8 bg-[var(--color-tt-bg)]">
      <div className="max-w-[1280px] mx-auto">
        <SectionReveal>
          <div className="text-center mb-8">
            <h2 className="text-[var(--color-tt-ink)] text-2xl font-bold mb-1">{heading}</h2>
            <p className="text-[var(--color-tt-ink-muted)] text-sm">{subtitle}</p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="tt-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {collections.map((collection, i) => (
              <Link
                key={collection.id}
                href={collection.href}
                data-testid={`collection-card-${collection.id}`}
                className="tt-lift group block"
                style={{ '--i': i } as React.CSSProperties}
              >
                <div className="tt-zoom-hover relative h-[320px] md:h-[280px] lg:h-[420px] rounded-lg overflow-hidden bg-[var(--color-tt-surface-container)]">
                  {collection.imageUrl ? (
                    <>
                      <Image
                        src={collection.imageUrl}
                        alt={collection.title}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </>
                  ) : null}
                  {/* SHOP NOW overlaid on the image — revealed on hover */}
                  <span className="absolute inset-x-0 bottom-4 text-center text-white text-xs font-bold tracking-wider drop-shadow [text-shadow:0_1px_3px_rgba(0,0,0,0.85)] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    SHOP NOW &gt;
                  </span>
                </div>
                {/* Category name centered below the card */}
                <div className="mt-3 pb-2 px-0.5 text-center">
                  <span className="text-[var(--color-tt-ink)] text-base font-bold">
                    {collection.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
