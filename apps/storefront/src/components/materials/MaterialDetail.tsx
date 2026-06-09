import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { StorefrontMaterialStory } from '@/lib/payload'
import { SustainabilityRating } from '@/components/materials/SustainabilityRating'

interface MaterialDetailProps {
  material: StorefrontMaterialStory
}

export function MaterialDetail({ material }: MaterialDetailProps) {
  return (
    <article data-testid="material-detail">
      <div className="relative h-[480px] lg:h-[560px] w-full overflow-hidden">
        <Image
          src={material.featuredImage.url}
          alt={material.featuredImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-tt-ink)]/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 lg:px-8 pb-10 max-w-[1280px] mx-auto">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--color-tt-gold)] mb-3">
            Material Story
          </p>
          <div className="flex items-center gap-3 mb-1">
            <h1
              data-testid="material-detail-name"
              className="text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              {material.title}
            </h1>
            <span
              data-testid="material-detail-wood-type-badge"
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/10 text-[var(--color-tt-gold)] border border-white/20"
            >
              {material.woodType}
            </span>
          </div>
        </div>
      </div>

      {/* Body uses the same max-w-[1280px] container as the hero title overlay
          and the related-products grid so the content starts on a consistent
          left edge across the page. The prose inside is capped to a readable
          measure and left-aligned (not centred) to avoid a narrow column
          floating in empty space. */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-[var(--color-tt-outline-variant)]">
            <div
              data-testid="material-detail-origin"
              className="flex items-center gap-2 text-[11px] text-[var(--color-tt-outline)] uppercase tracking-widest"
            >
              <MapPin size={13} strokeWidth={1.5} className="text-[var(--color-tt-brown)]" />
              <span>{material.origin}</span>
            </div>
            <div className="w-px h-5 bg-[var(--color-tt-outline-variant)]" />
            <SustainabilityRating rating={material.sustainabilityRating} showLabel />
          </div>

          <p
            data-testid="material-detail-short-description"
            className="text-lg text-[var(--color-tt-ink-muted)] leading-relaxed mb-10 font-light italic"
          >
            {material.shortDescription}
          </p>

          <div data-testid="material-detail-description" className="space-y-6">
            {material.description.map((paragraph, idx) => (
              <p key={idx} className="text-base leading-[1.8] text-[var(--color-tt-ink-muted)]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
