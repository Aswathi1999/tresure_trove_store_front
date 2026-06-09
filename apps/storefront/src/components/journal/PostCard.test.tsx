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

import { PostCard } from './PostCard'
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

describe('PostCard', () => {
  it('renders the article with the correct data-testid', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByTestId('post-card-post_01')).toBeInTheDocument()
  })

  it('renders the cover image with the correct src and alt text', () => {
    render(<PostCard post={basePost} />)
    const img = screen.getByAltText('The Art of Handcrafted Brass')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/brass.jpg')
  })

  it('resolves a Media object coverImage — uses CloudFrontImage with media.alt and media.url', () => {
    const post: BlogPost = {
      ...basePost,
      coverImage: {
        id: 'media_01',
        url: 'https://cdn.example.com/media.jpg',
        alt: 'brass cover',
        filename: 'media.jpg',
        width: 1200,
        height: 800,
        mimeType: 'image/jpeg',
        filesize: 100000,
        createdAt: '2026-05-07T00:00:00.000Z',
        updatedAt: '2026-05-07T00:00:00.000Z',
      } as Media,
    }
    render(<PostCard post={post} />)
    // CloudFrontImage uses media.alt, not post.title; URL passes through getCloudFrontUrl unchanged
    expect(screen.getByAltText('brass cover')).toHaveAttribute(
      'src',
      'https://cdn.example.com/media.jpg',
    )
  })

  it('renders the post title as a heading', () => {
    render(<PostCard post={basePost} />)
    expect(
      screen.getByRole('heading', { name: /the art of handcrafted brass/i }),
    ).toBeInTheDocument()
  })

  it('renders the author name when provided', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText('Priya Nair')).toBeInTheDocument()
  })

  it('does not render an author name when absent', () => {
    render(<PostCard post={{ ...basePost, author: undefined }} />)
    expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument()
  })

  it('renders the formatted publish date', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText(/15 june 2026/i)).toBeInTheDocument()
  })

  it('renders the excerpt', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText(/deep dive into how brass is handcrafted/i)).toBeInTheDocument()
  })

  it('renders a "Read More →" link', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText(/read more/i)).toBeInTheDocument()
  })

  it('links the image, title and "Read More" to the correct journal slug URL', () => {
    render(<PostCard post={basePost} />)
    const links = screen.getAllByRole('link')
    const slugLinks = links.filter(
      (l) => l.getAttribute('href') === '/journal/art-of-handcrafted-brass',
    )
    expect(slugLinks.length).toBeGreaterThanOrEqual(2)
  })
})
