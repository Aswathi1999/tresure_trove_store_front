import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface StoryLinkData {
  title: string
  excerpt: string
  href: string
}

interface MaterialStoryLinkProps {
  story: StoryLinkData | null
}

export function MaterialStoryLink({ story }: MaterialStoryLinkProps) {
  if (!story) return null

  return (
    <div
      className="border-l-2 border-[var(--color-tt-gold)] pl-4 py-1"
      data-testid="material-story-link"
    >
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
        Material Story
      </p>
      <Link
        href={story.href}
        className="group flex items-start gap-2 hover:text-[var(--color-tt-gold)] transition-colors duration-200"
      >
        <BookOpen size={14} className="mt-0.5 shrink-0 text-[var(--color-tt-gold)]" />
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-tt-ink)] group-hover:text-[var(--color-tt-gold)] transition-colors duration-200 leading-snug mb-1">
            {story.title}
          </p>
          <p className="text-[12px] text-[var(--color-tt-outline)] leading-relaxed line-clamp-2">
            {story.excerpt}
          </p>
        </div>
      </Link>
    </div>
  )
}
