import Image from 'next/image'
import Link from 'next/link'
import type { BrandPhilosophyContent } from '@/lib/payload'

interface BrandPhilosophyProps {
  content: BrandPhilosophyContent | null
}

export function BrandPhilosophy({ content }: BrandPhilosophyProps) {
  if (!content) return null

  return (
    <section
      aria-label="Brand Philosophy"
      className="bg-[var(--color-tt-surface-container-high)] py-0 lg:py-0"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row h-auto lg:h-[320px]">
          {/* Image — left on desktop, top on mobile */}
          <div className="tt-reveal-left tt-zoom-hover relative w-full lg:w-1/2 h-[240px] lg:h-full overflow-hidden">
            <Image
              src={content.imageUrl}
              alt={content.headline}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Copy — right on desktop, bottom on mobile */}
          <div className="tt-stagger flex flex-col justify-center px-8 py-8 lg:py-0 lg:w-1/2">
            <p
              className="text-[var(--color-tt-orange)] text-sm font-bold tracking-widest mb-3"
              style={{ '--i': 0 } as React.CSSProperties}
            >
              {content.eyebrow}
            </p>
            <h2
              className="text-[var(--color-tt-ink)] text-2xl lg:text-3xl font-bold mb-4 leading-snug"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              {content.headline}
            </h2>
            <p
              className="text-[var(--color-tt-ink)] text-base leading-relaxed mb-6 max-w-[440px]"
              style={{ '--i': 2 } as React.CSSProperties}
            >
              {content.body}
            </p>
            <Link
              href={content.ctaHref}
              data-testid="brand-philosophy-cta"
              className="inline-flex items-center gap-2 bg-[var(--color-tt-ink)] hover:bg-[var(--color-tt-orange)] text-[var(--color-tt-gold)] text-xs font-bold tracking-widest px-6 py-3 rounded transition-colors w-fit"
            >
              {content.ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
