import type { Metadata } from 'next'
import type { BlogPost } from '@TreasureTrove/types'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { PostCard } from '@/components/journal/PostCard'
import { getPosts } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'The Journal — Treasure Trove',
  description:
    'Stories, craft insights, and styling inspiration for beautiful living from Treasure Trove.',
}

export default async function JournalPage() {
  let posts: BlogPost[] = []
  try {
    const data = await getPosts()
    posts = data.docs
  } catch {
    posts = []
  }

  return (
    <div data-testid="journal-listing-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Journal' }]} />
      </div>

      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center h-[260px] lg:h-[340px] px-4 text-center overflow-hidden"
        style={{ backgroundColor: 'var(--color-tt-ink)' }}
      >
        {/* subtle diagonal texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <p className="relative text-[10px] font-bold tracking-[0.35em] uppercase text-[var(--color-tt-gold)] mb-4">
          Treasure Trove Blog
        </p>
        <h1 className="relative text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          Stories &amp; Inspiration
        </h1>
        <p className="relative text-[15px] text-white/60 max-w-lg leading-relaxed">
          Craft insights, styling guides, and living ideas from our artisans and editors
        </p>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 lg:px-8 py-14">
        {posts.length === 0 ? (
          <p className="text-center text-[var(--color-tt-ink-muted)] py-20 text-sm tracking-wide">
            No posts yet — check back soon.
          </p>
        ) : (
          <div
            data-testid="blog-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
