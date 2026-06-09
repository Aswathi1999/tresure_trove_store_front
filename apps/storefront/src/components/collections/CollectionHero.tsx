import Image from 'next/image'

interface CollectionHeroProps {
  title: string
  subtitle: string
  imageUrl?: string
}

export function CollectionHero({ title, subtitle, imageUrl }: CollectionHeroProps) {
  const hasImage = Boolean(imageUrl)

  return (
    <section
      data-testid="collection-hero"
      className={`relative w-full overflow-hidden flex ${
        hasImage ? 'h-[320px] lg:h-[420px] items-end' : 'h-[220px] lg:h-[280px] items-center'
      }`}
    >
      {hasImage ? (
        <>
          <Image src={imageUrl!} alt={title} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </>
      ) : (
        <>
          {/* Branded gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-tt-ink)] via-[var(--color-tt-brown)] to-[var(--color-tt-rose)]" />
          {/* Soft gold glow + decorative rings to fill the space */}
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[var(--color-tt-gold)]/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-[var(--color-tt-gold)]/10 blur-3xl" />
          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="h-56 w-56 rounded-full border border-[var(--color-tt-gold)]/25" />
            <div className="absolute inset-6 rounded-full border border-[var(--color-tt-gold)]/15" />
          </div>
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-screen-2xl mx-auto px-4 lg:px-8 ${
          hasImage ? 'pb-10 lg:pb-14' : 'py-0'
        }`}
      >
        {!hasImage && (
          <div className="mb-4 h-px w-12 bg-[var(--color-tt-gold)]" aria-hidden="true" />
        )}
        <p
          data-testid="collection-hero-subtitle"
          className={`text-[var(--color-tt-gold)] tracking-[0.3em] uppercase font-semibold mb-3 ${
            hasImage ? 'text-[10px] lg:text-[11px]' : 'text-[11px] lg:text-[12px]'
          }`}
        >
          {subtitle}
        </p>
        <h1
          data-testid="collection-hero-title"
          className="text-white text-4xl lg:text-6xl font-extrabold tracking-tight leading-none"
        >
          {title}
        </h1>
      </div>
    </section>
  )
}
