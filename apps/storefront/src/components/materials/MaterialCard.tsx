import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { StorefrontMaterialStory } from '@/lib/payload'
import { SustainabilityRating } from '@/components/materials/SustainabilityRating'

interface MaterialCardProps {
  material: StorefrontMaterialStory
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <article
      data-testid={`material-card-${material.id}`}
      className="group flex flex-col bg-[var(--color-tt-surface)] overflow-hidden"
    >
      <Link
        href={`/materials/${material.slug}`}
        className="block overflow-hidden relative aspect-video"
        data-testid={`material-card-image-link-${material.id}`}
      >
        <Image
          src={material.featuredImage.url}
          alt={material.featuredImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold text-[var(--color-tt-ink)]">
            <Link
              href={`/materials/${material.slug}`}
              className="hover:text-[var(--color-tt-orange)] transition-colors duration-200"
              data-testid={`material-card-title-link-${material.id}`}
            >
              {material.title}
            </Link>
          </h3>
          <span
            data-testid={`material-card-wood-type-badge-${material.id}`}
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[var(--color-tt-surface-container)] text-[var(--color-tt-brown)] border border-[var(--color-tt-outline-variant)]"
          >
            {material.woodType}
          </span>
        </div>

        <div
          data-testid={`material-card-origin-${material.id}`}
          className="flex items-center gap-1.5 text-[11px] text-[var(--color-tt-outline)] uppercase tracking-widest mb-3"
        >
          <MapPin size={11} strokeWidth={1.5} />
          <span>{material.origin}</span>
        </div>

        <SustainabilityRating rating={material.sustainabilityRating} showLabel />

        <p className="text-sm leading-relaxed text-[var(--color-tt-ink-muted)] mt-4 mb-5 flex-1 line-clamp-2">
          {material.shortDescription}
        </p>

        <Link
          href={`/materials/${material.slug}`}
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-orange)] hover:underline self-start"
          data-testid={`material-card-cta-${material.id}`}
        >
          Explore Material →
        </Link>
      </div>
    </article>
  )
}
