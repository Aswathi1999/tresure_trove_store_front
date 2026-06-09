import type { Metadata } from 'next'
import Image from 'next/image'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SectionReveal } from '@/components/layout/SectionReveal'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'About Treasure Trove — Our Story',
  description:
    'Curating heritage for the modern home. Handcrafted elegance delivered from Bangalore to your doorstep.',
}

const SECTIONS = [
  {
    title: 'Curated, not mass produced.',
    body: 'Every piece in our collection is handpicked for its unique story and architectural integrity. We reject the generic in favor of objects that carry the soul of the maker, ensuring your home remains a reflection of true craftsmanship.',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80',
    imageAlt: 'Curated ceramic vases styled on a neutral surface',
    imageLeft: true,
    bg: 'var(--color-tt-surface)',
  },
  {
    title: 'Made in India, for homes everywhere.',
    body: 'From the looms of Varanasi to the metal workshops of Moradabad, we collaborate with local artisans to bridge heritage techniques with contemporary design. We bring the best of Indian artistry to the modern global home.',
    imageUrl: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&q=80',
    imageAlt: "Artisan shaping clay on a potter's wheel",
    imageLeft: false,
    bg: 'var(--color-tt-surface-container)',
  },
  {
    title: 'A Bangalore boutique.',
    body: 'Rooted in the heart of Bangalore, our flagship boutique serves as a tactile sanctuary. It is a space where design enthusiasts can experience the texture of our linens and the weight of our ceramics in person.',
    imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&q=80',
    imageAlt: 'Warm boutique interior styled with home décor',
    imageLeft: true,
    bg: 'var(--color-tt-surface)',
  },
]

const STATS = [
  { value: '8', label: 'Categories' },
  { value: '16', label: 'Sub-Collections' },
  { value: 'Pan India', label: 'Shipping' },
  { value: '7-Day', label: 'Returns' },
]

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      </div>

      {/* Hero Band — premium dark band with a soft gold glow */}
      <section
        className="relative overflow-hidden w-full py-7 md:py-9 flex flex-col items-center justify-center text-center px-6"
        style={{
          backgroundColor: 'var(--color-tt-ink)',
          backgroundImage:
            'radial-gradient(ellipse 70% 75% at 50% -15%, rgba(213,198,143,0.20), transparent 70%)',
        }}
        data-testid="about-hero"
      >
        {/* Faint decorative rings in the top-right for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full border border-white/[0.05]"
        />

        <SectionReveal className="relative flex w-full max-w-2xl mx-auto flex-col items-center">
          {/* Eyebrow framed by short gold rules */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[var(--color-tt-gold)]/50" />
            <p className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)]">
              Our Story
            </p>
            <span className="h-px w-8 bg-[var(--color-tt-gold)]/50" />
          </div>

          <h1
            className="text-[40px] md:text-[56px] font-bold text-white text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            About <span className="text-[var(--color-tt-gold)]">Treasure Trove</span>
          </h1>

          {/* Gold divider accent */}
          <span className="mt-6 h-[3px] w-16 rounded-full bg-[var(--color-tt-gold)]" />

          <p className="mt-6 text-base md:text-lg text-white/65 max-w-2xl mx-auto font-light text-balance leading-relaxed">
            Luxury home decor, delivered across India.
          </p>
        </SectionReveal>
      </section>

      {/* Alternating sections */}
      {SECTIONS.map((section, i) => (
        <section
          key={i}
          className="w-full"
          style={{ backgroundColor: section.bg }}
          data-testid={`about-section-${i}`}
        >
          <div className="max-w-[1280px] mx-auto h-auto md:min-h-[440px] flex flex-col md:flex-row overflow-hidden">
            {section.imageLeft ? (
              <>
                <SectionReveal className="w-full md:w-1/2 relative min-h-[320px] md:min-h-0">
                  <Image
                    src={section.imageUrl}
                    alt={section.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </SectionReveal>
                <SectionReveal
                  className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 md:py-14"
                  delay={0.1}
                >
                  <h2
                    className="text-3xl md:text-[40px] font-semibold text-[var(--color-tt-ink)] mb-6 leading-tight"
                    data-testid={`about-section-title-${i}`}
                  >
                    {section.title}
                  </h2>
                  <p className="text-[var(--color-tt-ink-muted)] leading-relaxed text-base md:text-lg max-w-md">
                    {section.body}
                  </p>
                </SectionReveal>
              </>
            ) : (
              <>
                <SectionReveal className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 md:py-14 order-2 md:order-1">
                  <h2
                    className="text-3xl md:text-[40px] font-semibold text-[var(--color-tt-ink)] mb-6 leading-tight"
                    data-testid={`about-section-title-${i}`}
                  >
                    {section.title}
                  </h2>
                  <p className="text-[var(--color-tt-ink-muted)] leading-relaxed text-base md:text-lg max-w-md">
                    {section.body}
                  </p>
                </SectionReveal>
                <SectionReveal
                  className="w-full md:w-1/2 relative min-h-[320px] md:min-h-0 order-1 md:order-2"
                  delay={0.1}
                >
                  <Image
                    src={section.imageUrl}
                    alt={section.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </SectionReveal>
              </>
            )}
          </div>
        </section>
      ))}

      {/* Stats Strip */}
      <section
        className="w-full py-16"
        style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
        data-testid="about-stats"
      >
        <div className="max-w-screen-xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <SectionReveal key={s.label} delay={i * 0.08} className="flex flex-col gap-2">
              <span
                className="text-4xl font-bold text-[var(--color-tt-brown)]"
                data-testid={`about-stat-value-${i}`}
              >
                {s.value}
              </span>
              <span
                className="text-[12px] font-semibold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]"
                data-testid={`about-stat-label-${i}`}
              >
                {s.label}
              </span>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Editorial / Newsletter Band */}
      <section
        className="w-full py-16 lg:py-20 border-t border-[var(--color-tt-outline-variant)]"
        style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
        data-testid="about-newsletter"
      >
        <div className="max-w-3xl mx-auto text-center px-8">
          <SectionReveal>
            <h3 className="text-2xl font-semibold text-[var(--color-tt-ink)] mb-6 uppercase tracking-widest-ui">
              Stay Inspired
            </h3>
            <p className="text-[var(--color-tt-ink-muted)] text-base mb-8 leading-relaxed">
              Join our inner circle for early access to limited edition drops and stories of
              artisanal heritage. We believe in slow living and thoughtful curation.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                data-testid="about-newsletter-input"
                className="border border-[var(--color-tt-outline-variant)] bg-white px-6 py-4 text-sm tracking-widest-ui uppercase outline-none focus:border-[var(--color-tt-gold)] focus:ring-2 focus:ring-[var(--color-tt-gold)]/30 w-full md:w-80 rounded-[2px]"
              />
              <button
                type="button"
                data-testid="about-newsletter-submit"
                className="bg-[var(--color-tt-brown)] text-white px-10 py-4 text-sm font-semibold tracking-widest-ui uppercase hover:opacity-90 transition-opacity rounded-[2px]"
              >
                Subscribe
              </button>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}
