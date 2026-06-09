import { Breadcrumb } from '@/components/ui/Breadcrumb'

export interface PolicySection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

interface PolicyPageProps {
  title: string
  lastUpdated: string
  intro: string
  sections: PolicySection[]
  testId: string
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function PolicyPage({ title, lastUpdated, intro, sections, testId }: PolicyPageProps) {
  return (
    <div data-testid={testId}>
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: title }]} />
      </div>

      {/* Header band */}
      <section
        className="w-full py-14 lg:py-20 px-4 text-center"
        style={{ backgroundColor: 'var(--color-tt-ink)' }}
        data-testid={`${testId}-hero`}
      >
        <div className="max-w-3xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--color-tt-gold)] block mb-4">
            Legal
          </span>
          <h1
            className="text-[34px] md:text-[48px] font-bold text-white mb-5 text-balance leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          <div className="mx-auto h-px w-14 bg-[var(--color-tt-gold)]/60 mb-5" />
          <p className="text-sm text-white/60 uppercase tracking-widest-ui">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Body */}
      <section
        className="w-full py-12 lg:py-20 px-6"
        style={{ backgroundColor: 'var(--color-tt-surface)' }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-base md:text-lg text-[var(--color-tt-ink-muted)] leading-relaxed mb-10">
            {intro}
          </p>

          {/* On this page — quick jump links */}
          <nav
            aria-label="On this page"
            className="mb-12 rounded-lg border border-[var(--color-tt-outline-variant)] p-6"
            style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
          >
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--color-tt-ink-muted)] mb-4">
              On this page
            </p>
            <ol className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#${slugify(section.heading)}`}
                    className="group flex gap-2.5 text-sm leading-snug text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors"
                  >
                    <span className="text-[var(--color-tt-gold)] font-semibold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="group-hover:underline underline-offset-2">
                      {section.heading}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <div
                key={section.heading}
                id={slugify(section.heading)}
                data-testid={`${testId}-section-${i}`}
                className="scroll-mt-[140px] border-t border-[var(--color-tt-outline-variant)] pt-10 first:border-t-0 first:pt-0"
              >
                <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-[var(--color-tt-ink)] mb-4 leading-tight">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-tt-gold)]/15 text-[var(--color-tt-gold)] text-sm font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.heading}
                </h2>
                {section.paragraphs?.map((p, j) => (
                  <p
                    key={j}
                    className="text-base text-[var(--color-tt-ink-muted)] leading-relaxed mb-3 last:mb-0"
                  >
                    {p}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2.5 mt-2">
                    {section.bullets.map((b, k) => (
                      <li
                        key={k}
                        className="flex gap-3 text-base text-[var(--color-tt-ink-muted)] leading-relaxed"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-tt-gold)]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
