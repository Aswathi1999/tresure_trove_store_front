import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/layout/SectionReveal', () => ({
  SectionReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { BlogPreview } from './BlogPreview'
import type { BlogPreviewItem } from '@/lib/payload'

const posts: BlogPreviewItem[] = [
  {
    id: 'post_01',
    title: 'Why We Use Teak',
    excerpt: 'Teak is one of the most durable hardwoods in the world.',
    coverImageUrl: 'https://cdn.example.com/teak.jpg',
    publishDate: '1 April 2026',
    slug: 'why-we-use-teak',
  },
  {
    id: 'post_02',
    title: 'Designing a Japandi Living Room',
    excerpt: 'A guide to blending Japanese and Scandinavian aesthetics.',
    coverImageUrl: 'https://cdn.example.com/japandi.jpg',
    publishDate: '15 March 2026',
    slug: 'japandi-living-room',
  },
]

describe('BlogPreview', () => {
  it('renders the Blog section', () => {
    render(<BlogPreview posts={posts} />)
    expect(screen.getByRole('region', { name: /blog/i })).toBeInTheDocument()
  })

  it('renders the section heading "From Our Journal"', () => {
    render(<BlogPreview posts={posts} />)
    expect(screen.getByRole('heading', { name: /from our journal/i })).toBeInTheDocument()
  })

  it('renders a card for each post', () => {
    render(<BlogPreview posts={posts} />)
    expect(screen.getByTestId('blog-card-post_01')).toBeInTheDocument()
    expect(screen.getByTestId('blog-card-post_02')).toBeInTheDocument()
  })

  it('renders each post title', () => {
    render(<BlogPreview posts={posts} />)
    expect(screen.getByText('Why We Use Teak')).toBeInTheDocument()
    expect(screen.getByText('Designing a Japandi Living Room')).toBeInTheDocument()
  })

  it('renders the publish date for each post', () => {
    render(<BlogPreview posts={posts} />)
    expect(screen.getByText('1 April 2026')).toBeInTheDocument()
    expect(screen.getByText('15 March 2026')).toBeInTheDocument()
  })

  it('renders the excerpt for each post', () => {
    render(<BlogPreview posts={posts} />)
    expect(screen.getByText(/teak is one of the most durable/i)).toBeInTheDocument()
  })

  it('renders the cover image with correct alt text', () => {
    render(<BlogPreview posts={posts} />)
    const img = screen.getByAltText('Why We Use Teak')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/teak.jpg')
  })

  it('links the post title to the correct blog slug', () => {
    render(<BlogPreview posts={posts} />)
    const titleLinks = screen.getAllByRole('link', { name: 'Why We Use Teak' })
    expect(titleLinks[0]).toHaveAttribute('href', '/blog/why-we-use-teak')
  })

  it('renders a "Read More →" link for each post pointing to the slug', () => {
    render(<BlogPreview posts={posts} />)
    const readMoreLinks = screen.getAllByText(/read more/i)
    expect(readMoreLinks).toHaveLength(posts.length)
    expect(readMoreLinks[0].closest('a')).toHaveAttribute('href', '/blog/why-we-use-teak')
  })

  it('renders an empty grid without crashing', () => {
    render(<BlogPreview posts={[]} />)
    expect(screen.getByRole('region', { name: /blog/i })).toBeInTheDocument()
  })
})
