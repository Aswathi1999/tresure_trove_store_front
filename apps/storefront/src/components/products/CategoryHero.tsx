import Image from 'next/image'

interface CategoryHeroProps {
  title: string
  subtitle?: string
  imageUrl?: string
}

export function CategoryHero({ title, subtitle, imageUrl }: CategoryHeroProps) {
  return (
    <section className="relative h-[120px] sm:h-[150px] lg:h-[190px] w-full overflow-hidden flex items-center justify-center">
      {imageUrl ? (
        <Image src={imageUrl} alt={title} fill className="object-cover" priority sizes="100vw" />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-tt-ink)' }} />
      )}

      <div className="absolute inset-0 bg-[#1F1B16]/50" />

      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-5xl font-extrabold tracking-tight mb-2 leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/80 text-xs tracking-[0.25em] uppercase font-light mt-3">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
