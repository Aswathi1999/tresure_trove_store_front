import Image from 'next/image'
import Link from 'next/link'
import { SectionReveal } from '@/components/layout/SectionReveal'
import type { BlogPreviewItem } from '@/lib/payload'

interface BlogPreviewProps {
  posts: BlogPreviewItem[]
  eyebrow?: string
  heading?: string
  subtitle?: string
}

export function BlogPreview({
  posts,
  eyebrow = 'Journal',
  heading = 'From Our Journal',
  subtitle = 'Stories, tips, and inspiration for a beautiful home',
}: BlogPreviewProps) {
  return (
    <section aria-label="Blog" className="py-14 lg:py-16 px-4 lg:px-8 bg-[var(--color-tt-surface)]">
      <div className="max-w-[1280px] mx-auto">
        <SectionReveal>
          <div className="text-center mb-10">
            <p className="text-[var(--color-tt-orange)] text-[12px] font-bold tracking-widest uppercase mb-2">
              {eyebrow}
            </p>
            <h2 className="tt-reveal-up text-[var(--color-tt-ink)] text-2xl lg:text-3xl font-bold mb-2">
              {heading}
            </h2>
            <p className="tt-reveal-up text-[var(--color-tt-ink-muted)] text-base">{subtitle}</p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="tt-stagger grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((post, i) => (
              <article
                key={post.id}
                data-testid={`blog-card-${post.id}`}
                className="tt-lift group flex flex-col bg-[var(--color-tt-surface-container-lowest)] rounded-xl overflow-hidden border border-[var(--color-tt-outline-variant)]/60 shadow-sm hover:shadow-md hover:border-[var(--color-tt-outline-variant)] transition-all duration-300"
                style={{ '--i': i } as React.CSSProperties}
              >
                <Link href={`/journal/${post.slug}`} className="block overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="flex flex-col flex-1 p-5 lg:p-6">
                  <p className="text-[var(--color-tt-outline)] text-[12px] font-bold tracking-widest uppercase mb-2">
                    {post.publishDate}
                  </p>
                  <h3 className="text-[var(--color-tt-ink)] text-lg lg:text-xl font-bold mb-3 leading-snug">
                    <Link
                      href={`/journal/${post.slug}`}
                      className="hover:text-[var(--color-tt-orange)] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-[var(--color-tt-ink-muted)] text-[15px] leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/journal/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-[var(--color-tt-orange)] text-[13px] font-bold tracking-widest uppercase hover:gap-2 transition-all w-fit"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
