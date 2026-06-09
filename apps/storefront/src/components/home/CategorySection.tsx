import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: string
  label: string
  imageUrl: string | null
  href: string
}

interface CategorySectionProps {
  categories: Category[]
  eyebrow?: string
  heading?: string
  subtitle?: string
}

function CategoryThumb({ label, imageUrl }: { label: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={label}
        fill
        sizes="104px"
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
    )
  }
  // Fallback: monogram tile so the section still renders when admin hasn't uploaded an image yet.
  const initial = label.trim().charAt(0).toUpperCase() || '·'
  return (
    <div
      className="w-full h-full flex items-center justify-center bg-[var(--color-tt-surface-container)] text-[var(--color-tt-ink)] font-bold"
      style={{ fontSize: '28px' }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

export function CategorySection({
  categories,
  eyebrow = 'Browse',
  heading = 'Shop by Category',
  subtitle = 'Explore our curated collections for every corner of your home',
}: CategorySectionProps) {
  if (categories.length === 0) return null

  return (
    <section
      aria-label="Shop by Category"
      data-testid="category-section"
      className="py-8 lg:py-10 px-4 lg:px-8"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-6 lg:mb-8">
          <p className="text-[var(--color-tt-orange)] text-[12px] font-bold tracking-widest uppercase mb-2">
            {eyebrow}
          </p>
          <h2 className="tt-reveal-blur text-[var(--color-tt-ink)] text-xl lg:text-2xl font-bold mb-1">
            {heading}
          </h2>
          <p className="tt-reveal-up text-[var(--color-tt-ink-muted)] text-sm hidden lg:block">
            {subtitle}
          </p>
        </div>

        {/* Desktop: round tiles in a row */}
        <div className="tt-stagger-scale hidden lg:grid grid-cols-8 gap-4 justify-items-center">
          {categories.map(({ id, label, imageUrl, href }, i) => (
            <Link
              key={id}
              href={href}
              data-testid={`category-item-${id}`}
              className="flex flex-col items-center gap-2 group"
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className="tt-zoom-hover w-[104px] h-[104px] rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--color-tt-gold)] transition-all">
                <div className="relative w-full h-full">
                  <CategoryThumb label={label} imageUrl={imageUrl} />
                </div>
              </div>
              <span className="text-[var(--color-tt-ink)] text-[13px] font-bold tracking-wider text-center leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile: horizontally scrollable chip row */}
        <div className="lg:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {categories.map(({ id, label, imageUrl, href }) => (
            <Link
              key={id}
              href={href}
              data-testid={`category-item-${id}`}
              className="snap-start shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border-2 border-transparent group-active:border-[var(--color-tt-gold)] bg-[var(--color-tt-surface-container)]">
                <CategoryThumb label={label} imageUrl={imageUrl} />
              </div>
              <span className="text-[var(--color-tt-ink)] text-[12px] font-bold tracking-wide text-center leading-tight w-[76px] line-clamp-2">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
