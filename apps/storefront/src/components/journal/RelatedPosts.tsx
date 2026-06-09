import type { BlogPost } from '@TreasureTrove/types'
import { PostCard } from '@/components/journal/PostCard'

interface RelatedPostsProps {
  posts: BlogPost[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section
      data-testid="related-posts"
      className="py-16 px-4 lg:px-8"
      style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
    >
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-2xl font-bold text-[var(--color-tt-ink)] mb-10 text-center">
          More from the Journal
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
