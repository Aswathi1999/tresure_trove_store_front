import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost, Media } from '@TreasureTrove/types'
import { CloudFrontImage } from '@/components/ui/CloudFrontImage'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface PostCardProps {
  post: BlogPost
}

export function PostCard({ post }: PostCardProps) {
  const displayDate = post.publishedAt ? formatDate(post.publishedAt) : ''
  const coverImage = post.coverImage
  const isPopulated = typeof coverImage !== 'string'

  return (
    <article
      data-testid={`post-card-${post.id}`}
      className="group flex flex-col bg-[var(--color-tt-surface)] overflow-hidden"
    >
      <Link href={`/journal/${post.slug}`} className="block overflow-hidden relative aspect-video">
        {isPopulated ? (
          <CloudFrontImage
            media={coverImage as Media}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Image
            src={coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </Link>

      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-lg font-bold text-[var(--color-tt-ink)] leading-snug mb-3">
          <Link
            href={`/journal/${post.slug}`}
            className="hover:text-[var(--color-tt-orange)] transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-[var(--color-tt-outline)] uppercase tracking-widest mb-4">
          {post.author && (
            <>
              <span>{post.author}</span>
              <span className="w-px h-3 bg-[var(--color-tt-outline-variant)]" />
            </>
          )}
          <span>{displayDate}</span>
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-tt-ink-muted)] line-clamp-3 flex-1 mb-5">
          {post.excerpt}
        </p>

        <Link
          href={`/journal/${post.slug}`}
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-orange)] hover:underline self-start"
        >
          Read More →
        </Link>
      </div>
    </article>
  )
}
