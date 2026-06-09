import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    className,
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} className={className} />,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    className?: string
    [key: string]: unknown
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}))

import { RelatedPosts } from './RelatedPosts'
import type { BlogPost } from '@TreasureTrove/types'

function makePosts(count: number): BlogPost[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `post_0${i + 1}`,
    title: `Post ${i + 1}`,
    slug: `post-${i + 1}`,
    excerpt: `Excerpt for post ${i + 1}.`,
    content: { root: { children: [] } },
    coverImage: `https://cdn.example.com/post${i + 1}.jpg`,
    publishedAt: '2026-06-15T12:00:00.000Z',
    _status: 'published' as const,
    createdAt: '2026-06-15T12:00:00.000Z',
    updatedAt: '2026-06-15T12:00:00.000Z',
  }))
}

describe('RelatedPosts', () => {
  it('returns null (renders nothing) when the posts array is empty', () => {
    const { container } = render(<RelatedPosts posts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the section container with the correct data-testid', () => {
    render(<RelatedPosts posts={makePosts(1)} />)
    expect(screen.getByTestId('related-posts')).toBeInTheDocument()
  })

  it('renders the "More from the Journal" heading', () => {
    render(<RelatedPosts posts={makePosts(1)} />)
    expect(screen.getByRole('heading', { name: /more from the journal/i })).toBeInTheDocument()
  })

  it('renders a PostCard for each post', () => {
    const posts = makePosts(3)
    render(<RelatedPosts posts={posts} />)
    posts.forEach((post) => {
      expect(screen.getByTestId(`post-card-${post.id}`)).toBeInTheDocument()
    })
  })

  it('renders the correct number of article elements', () => {
    render(<RelatedPosts posts={makePosts(3)} />)
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('renders each post title', () => {
    render(<RelatedPosts posts={makePosts(2)} />)
    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getByText('Post 2')).toBeInTheDocument()
  })
})
