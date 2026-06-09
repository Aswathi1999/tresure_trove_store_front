import type { Metadata } from 'next'
import Image from 'next/image'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SectionReveal } from '@/components/layout/SectionReveal'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Careers — Treasure Trove',
  description:
    'Join the team behind Treasure Trove — designers and artisans crafting heirloom home décor in India.',
}

const CAREERS_EMAIL = 'careers@treasuretrove.in'

const VALUES = [
  {
    num: '01',
    title: 'Craft over speed',
    body: 'We measure our work in decades, not deadlines. Nothing leaves the studio before it is right.',
  },
  {
    num: '02',
    title: 'Makers first',
    body: 'Designers and artisans share one table and one credit. The hands that build a piece help shape its design.',
  },
  {
    num: '03',
    title: 'Quiet ambition',
    body: 'We grow slowly and deliberately — like the wood we work — choosing depth over scale.',
  },
]

export default function CareersPage() {
  return (
    <div data-testid="careers-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />
      </div>

      {/* Hero */}
      <section
        className="w-full min-h-[220px] lg:min-h-[300px] py-12 flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundColor: 'var(--color-tt-surface)' }}
        data-testid="careers-hero"
      >
        <SectionReveal className="flex w-full max-w-2xl mx-auto flex-col items-center">
          <span className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)] block mb-4">
            Careers
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-bold text-[var(--color-tt-ink)] mb-4 text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            Make things that outlast us
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-tt-ink-muted)] max-w-2xl mx-auto font-light text-balance">
            A small studio of designers and artisans crafting heirloom décor in India.
          </p>
        </SectionReveal>
      </section>

      {/* Values */}
      <section
        className="w-full py-16 lg:py-20"
        style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
        data-testid="careers-values"
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {VALUES.map((v, i) => (
              <SectionReveal
                key={v.title}
                delay={i * 0.08}
                className="p-8 rounded-lg border border-[var(--color-tt-outline-variant)] border-t-2 border-t-[var(--color-tt-gold)] bg-[var(--color-tt-surface)] shadow-sm h-full"
              >
                <span className="text-sm font-bold tracking-widest-ui text-[var(--color-tt-gold)]">
                  {v.num}
                </span>
                <h2 className="text-xl font-semibold text-[var(--color-tt-ink)] mt-3 mb-3 leading-tight">
                  {v.title}
                </h2>
                <p className="text-base leading-relaxed text-[var(--color-tt-ink-muted)]">
                  {v.body}
                </p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Life at the studio — image + text */}
      <section
        className="w-full"
        style={{ backgroundColor: 'var(--color-tt-surface)' }}
        data-testid="careers-life"
      >
        <div className="max-w-[1280px] mx-auto h-auto md:min-h-[420px] flex flex-col md:flex-row overflow-hidden">
          <SectionReveal className="w-full md:w-1/2 relative min-h-[300px] md:min-h-0">
            <Image
              src="https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=1200&q=80"
              alt="Artisan at work at the studio bench"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </SectionReveal>
          <SectionReveal
            className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 md:py-14"
            delay={0.1}
          >
            <h2 className="text-3xl md:text-[40px] font-semibold text-[var(--color-tt-ink)] mb-6 leading-tight">
              Life at Treasure Trove
            </h2>
            <p className="text-[var(--color-tt-ink-muted)] leading-relaxed text-base md:text-lg max-w-md">
              We are a tight studio in Bengaluru where designers, craftspeople, and storytellers
              work side by side. There are no silos — you will see a piece through from sketch to
              finish, learn from third-generation artisans, and have your name attached to work
              built to be passed down.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Open roles */}
      <section
        className="w-full py-16 lg:py-20"
        style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
        data-testid="careers-openings"
      >
        <div className="max-w-2xl mx-auto text-center px-6">
          <SectionReveal className="flex flex-col items-center">
            <span className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)] block mb-4">
              Open Roles
            </span>
            <h3 className="text-2xl md:text-3xl font-semibold text-[var(--color-tt-ink)] mb-4 text-balance">
              No open roles right now
            </h3>
            <p className="text-[var(--color-tt-ink-muted)] text-base md:text-lg mb-8 leading-relaxed text-balance">
              But we are always glad to hear from people who care about how things are made. Send
              your portfolio and a note about what you would like to build — we read every one.
            </p>
            <a
              href={`mailto:${CAREERS_EMAIL}`}
              className="inline-block bg-[var(--color-tt-gold)] hover:bg-[var(--color-tt-gold-hover)] text-[var(--color-tt-ink)] px-10 py-4 text-sm font-bold tracking-widest-ui uppercase rounded-[2px] transition-colors duration-200"
              data-testid="careers-email-link"
            >
              Email {CAREERS_EMAIL}
            </a>
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}
