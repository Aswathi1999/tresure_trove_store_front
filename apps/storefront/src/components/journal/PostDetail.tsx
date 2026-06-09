import Image from 'next/image'
import type { BlogPost, Media } from '@TreasureTrove/types'
import type { LexicalContent } from '@/lib/payload.mock'
import { RichTextRenderer } from '@/components/journal/RichTextRenderer'

function resolveUrl(field: Media | string): string {
  return typeof field === 'string' ? field : field.url
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface PostDetailProps {
  post: BlogPost
}

export function PostDetail({ post }: PostDetailProps) {
  const coverUrl = resolveUrl(post.coverImage)
  const displayDate = post.publishedAt ? formatDate(post.publishedAt) : ''
  const content = post.content as LexicalContent | null

  return (
    <article data-testid="post-detail">
      <div
        data-testid="blog-post-cover"
        className="relative h-[480px] lg:h-[560px] w-full overflow-hidden"
      >
        <Image
          src={coverUrl}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-tt-ink)]/60 via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
        <h1
          data-testid="blog-post-title"
          className="text-3xl lg:text-4xl font-bold text-[var(--color-tt-ink)] leading-tight mb-8"
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-8">
          {post.author && (
            <>
              <div className="w-10 h-10 rounded-full bg-[var(--color-tt-surface-container-high)] flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[var(--color-tt-brown)]">
                  {post.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-tt-ink)]">{post.author}</p>
              </div>
              <span className="w-px h-8 bg-[var(--color-tt-outline-variant)] mx-2" />
            </>
          )}
          <div className="text-[11px] text-[var(--color-tt-outline)] uppercase tracking-widest">
            <p>{displayDate}</p>
          </div>
        </div>

        <hr className="border-[var(--color-tt-outline-variant)] mb-10" />

        {content && (
          <div data-testid="blog-post-body">
            <RichTextRenderer content={content} />
          </div>
        )}
      </div>
    </article>
  )
}
