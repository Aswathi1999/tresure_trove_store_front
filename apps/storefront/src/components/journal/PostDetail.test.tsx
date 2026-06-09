import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    className,
    priority: _priority,
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
    priority?: boolean
  }) => <img src={src} alt={alt} className={className} />,
}))

import { PostDetail } from './PostDetail'
import type { BlogPost, Media } from '@TreasureTrove/types'

const basePost: BlogPost = {
  id: 'post_01',
  title: 'The Art of Handcrafted Brass',
  slug: 'art-of-handcrafted-brass',
  excerpt: 'A deep dive into how brass is handcrafted by skilled artisans.',
  content: { root: { children: [] } },
  coverImage: 'https://cdn.example.com/brass.jpg',
  publishedAt: '2026-06-15T12:00:00.000Z',
  _status: 'published',
  author: 'Priya Nair',
  createdAt: '2026-06-15T12:00:00.000Z',
  updatedAt: '2026-06-15T12:00:00.000Z',
}

describe('PostDetail', () => {
  it('renders the article with data-testid="post-detail"', () => {
    render(<PostDetail post={basePost} />)
    expect(screen.getByTestId('post-detail')).toBeInTheDocument()
  })

  it('renders the cover image with the correct src and alt', () => {
    render(<PostDetail post={basePost} />)
    const img = screen.getByAltText('The Art of Handcrafted Brass')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/brass.jpg')
  })

  it('resolves a Media object coverImage to its url', () => {
    const post: BlogPost = {
      ...basePost,
      coverImage: {
        id: 'media_01',
        url: 'https://cdn.example.com/media.jpg',
        alt: 'brass cover',
      } as unknown as Media,
    }
    render(<PostDetail post={post} />)
    expect(screen.getByAltText('The Art of Handcrafted Brass')).toHaveAttribute(
      'src',
      'https://cdn.example.com/media.jpg',
    )
  })

  it('renders the post title as an h1', () => {
    render(<PostDetail post={basePost} />)
    expect(
      screen.getByRole('heading', { level: 1, name: /the art of handcrafted brass/i }),
    ).toBeInTheDocument()
  })

  it('renders the author name when provided', () => {
    render(<PostDetail post={basePost} />)
    expect(screen.getByText('Priya Nair')).toBeInTheDocument()
  })

  it('renders the author initial avatar when author is provided', () => {
    render(<PostDetail post={basePost} />)
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('does not render the author section when author is absent', () => {
    render(<PostDetail post={{ ...basePost, author: undefined }} />)
    expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument()
  })

  it('renders the formatted publish date', () => {
    render(<PostDetail post={basePost} />)
    expect(screen.getByText(/15 june 2026/i)).toBeInTheDocument()
  })
})
