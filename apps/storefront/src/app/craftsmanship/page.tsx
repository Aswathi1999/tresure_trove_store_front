import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SectionReveal } from '@/components/layout/SectionReveal'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Our Craftsmanship — Treasure Trove',
  description:
    'From raw timber to finished heirloom — discover the four-stage process behind every Treasure Trove piece.',
}

const STEPS = [
  {
    num: '01',
    title: 'Design & Conception',
    body: 'Every piece begins as a conversation between our design team and the master craftsmen who will build it. Proportions, joinery, and grain direction are settled before a single cut is made. We draw by hand first — a deliberate slowness that reveals problems no software can catch.',
    imageUrl: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=1200&q=80',
    imageAlt: 'Designer sketching furniture proportions by hand',
  },
  {
    num: '02',
    title: 'Material Selection & Seasoning',
    body: 'We select timber board by board, reading the grain for figure and stability. Chosen planks are kiln-dried to 8–12% moisture content and rested for weeks before cutting begins. Rushing seasoning is how furniture warps. We do not rush.',
    imageUrl: 'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=1200&q=80',
    imageAlt: 'Timber being selected and graded in the workshop',
  },
  {
    num: '03',
    title: 'Master Craftsmen at Work',
    body: 'Third-generation artisans in our workshops in Mysore, Jodhpur, and Srinagar cut, shape, and join each piece using a combination of traditional hand tools and precision machinery. Mortise-and-tenon joints are cut by hand. No staples. No nails. No shortcuts.',
    imageUrl: 'https://images.unsplash.com/photo-1599619585752-c3edb42a414c?w=1200&q=80',
    imageAlt: 'Master craftsman hand-cutting mortise joints',
  },
  {
    num: '04',
    title: 'Finishing & Quality',
    body: 'Each finished piece is sanded through six progressive grits, then hand-oiled with natural oils and beeswax. A final quality check measures every dimension against the design specification. Only pieces that pass leave the workshop — imperfect pieces are reworked, never shipped.',
    // The original aida-public asset 404s; use a stable wood-tone photo.
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80',
    imageAlt: 'Artisan hand-oiling a finished teak table',
  },
]

export default function CraftsmanshipPage() {
  return (
    <div data-testid="craftsmanship-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Craftsmanship' }]} />
      </div>

      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center min-h-[240px] lg:min-h-[320px] py-12 px-4 text-center overflow-hidden"
        style={{ backgroundColor: 'var(--color-tt-ink)' }}
        data-testid="craftsmanship-hero"
      >
        <Image
          src="https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=1920&q=80"
          alt="Craftsman shaping timber at the workshop bench"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay keeps the heading legible over the photo */}
        <div className="absolute inset-0 bg-[var(--color-tt-ink)]/75" />
        <SectionReveal className="relative z-10 flex w-full max-w-3xl mx-auto flex-col items-center">
          <span className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)] block mb-4">
            Our Process
          </span>
          <h1
            className="text-[40px] lg:text-[56px] font-bold text-white leading-tight mb-4 text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            From Forest to Heirloom
          </h1>
          <p className="text-base lg:text-lg text-white/70 max-w-lg mx-auto leading-relaxed text-balance">
            Four stages. No shortcuts. Every piece built to outlast the century.
          </p>
        </SectionReveal>
      </div>

      {/* Steps */}
      <div data-testid="craftsmanship-steps">
        {STEPS.map((step, i) => {
          const isEven = i % 2 === 1
          return (
            <section
              key={step.num}
              className="w-full py-14 lg:py-20"
              style={{
                backgroundColor: isEven
                  ? 'var(--color-tt-surface-container)'
                  : 'var(--color-tt-surface)',
              }}
              data-testid={`craftsmanship-step-${i}`}
            >
              <div className="max-w-[1280px] mx-auto px-6 lg:px-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                  <SectionReveal
                    className={`lg:col-span-7 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                    delay={0.05}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-sm">
                      <Image
                        src={step.imageUrl}
                        alt={step.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </SectionReveal>

                  <SectionReveal
                    className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
                  >
                    <span className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)] block mb-3">
                      Step {step.num}
                    </span>
                    <h2
                      className="text-[32px] font-bold text-[var(--color-tt-ink)] mb-5 leading-tight"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {step.title}
                    </h2>
                    <p className="text-base leading-relaxed text-[var(--color-tt-outline)]">
                      {step.body}
                    </p>
                  </SectionReveal>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* Closing CTA band */}
      <section
        className="relative overflow-hidden py-16 lg:py-20 px-4 text-center"
        style={{ backgroundColor: 'var(--color-tt-ink)' }}
        data-testid="craftsmanship-cta"
      >
        <Image
          src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1920&q=80"
          alt="Finished heirloom furniture in a warm living room"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay keeps the heading and button legible over the photo */}
        <div className="absolute inset-0 bg-[var(--color-tt-ink)]/80" />
        <SectionReveal className="relative z-10">
          <span className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)] block mb-5">
            The Result
          </span>
          <h2
            className="text-[40px] font-bold text-white mb-8 max-w-2xl mx-auto leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            Furniture Built to Be Passed Down
          </h2>
          <Link
            href="/materials"
            className="inline-block bg-[var(--color-tt-gold)] hover:bg-[var(--color-tt-gold-hover)] text-[var(--color-tt-ink)] px-10 py-4 text-sm font-bold tracking-widest-ui uppercase rounded-[2px] transition-colors duration-200"
            data-testid="craftsmanship-materials-link"
          >
            Explore Our Materials →
          </Link>
        </SectionReveal>
      </section>
    </div>
  )
}
