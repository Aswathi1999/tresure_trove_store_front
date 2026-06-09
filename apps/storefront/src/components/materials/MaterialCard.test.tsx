import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

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

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    'data-testid': dataTestId,
  }: {
    href: string
    children: ReactNode
    className?: string
    'data-testid'?: string
  }) => (
    <a href={href} className={className} data-testid={dataTestId}>
      {children}
    </a>
  ),
}))

import type { StorefrontMaterialStory } from '@/lib/payload'
import { MaterialCard } from './MaterialCard'

const mockMaterial: StorefrontMaterialStory = {
  id: 'mat-001',
  title: 'Teak',
  slug: 'teak',
  woodType: 'teak',
  origin: 'Kerala, India',
  sustainabilityRating: 5,
  shortDescription: 'The gold standard of Indian hardwoods.',
  description: ['Teak has been used in Indian craftsmanship for centuries.'],
  featuredImage: {
    url: 'https://cdn.treasure-trove.in/materials/teak.jpg',
    alt: 'Close-up of teak wood grain',
  },
}

describe('MaterialCard', () => {
  it('renders the card article with correct testid', () => {
    render(<MaterialCard material={mockMaterial} />)
    expect(screen.getByTestId('material-card-mat-001')).toBeInTheDocument()
  })

  it('renders the material title', () => {
    render(<MaterialCard material={mockMaterial} />)
    expect(screen.getByText('Teak')).toBeInTheDocument()
  })

  it('renders the origin with correct testid', () => {
    render(<MaterialCard material={mockMaterial} />)
    expect(screen.getByTestId('material-card-origin-mat-001')).toBeInTheDocument()
  })

  it('renders the origin text', () => {
    render(<MaterialCard material={mockMaterial} />)
    expect(screen.getByText('Kerala, India')).toBeInTheDocument()
  })

  it('renders the wood type badge with correct testid', () => {
    render(<MaterialCard material={mockMaterial} />)
    const badge = screen.getByTestId('material-card-wood-type-badge-mat-001')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('teak')
  })

  it('renders the sustainability rating component', () => {
    render(<MaterialCard material={mockMaterial} />)
    expect(screen.getByTestId('sustainability-rating')).toBeInTheDocument()
  })

  it('renders the short description', () => {
    render(<MaterialCard material={mockMaterial} />)
    expect(screen.getByText('The gold standard of Indian hardwoods.')).toBeInTheDocument()
  })

  it('renders the featured image with correct src', () => {
    render(<MaterialCard material={mockMaterial} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://cdn.treasure-trove.in/materials/teak.jpg')
  })

  it('renders the featured image with correct alt text', () => {
    render(<MaterialCard material={mockMaterial} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Close-up of teak wood grain')
  })

  it('image link points to /materials/[slug]', () => {
    render(<MaterialCard material={mockMaterial} />)
    const link = screen.getByTestId('material-card-image-link-mat-001')
    expect(link).toHaveAttribute('href', '/materials/teak')
  })

  it('title link points to /materials/[slug]', () => {
    render(<MaterialCard material={mockMaterial} />)
    const link = screen.getByTestId('material-card-title-link-mat-001')
    expect(link).toHaveAttribute('href', '/materials/teak')
  })

  it('CTA link points to /materials/[slug] and has correct text', () => {
    render(<MaterialCard material={mockMaterial} />)
    const cta = screen.getByTestId('material-card-cta-mat-001')
    expect(cta).toHaveAttribute('href', '/materials/teak')
    expect(cta).toHaveTextContent(/Explore Material/i)
  })

  it('renders correctly for a different material', () => {
    const walnut: StorefrontMaterialStory = {
      ...mockMaterial,
      id: 'mat-002',
      title: 'Walnut',
      slug: 'walnut',
      woodType: 'walnut',
      origin: 'Himachal Pradesh, India',
      sustainabilityRating: 4,
      shortDescription: 'Dark, dense, and deeply beautiful.',
      featuredImage: { url: 'https://cdn.example.com/walnut.jpg', alt: 'Walnut grain' },
    }
    render(<MaterialCard material={walnut} />)
    expect(screen.getByTestId('material-card-mat-002')).toBeInTheDocument()
    expect(screen.getByText('Walnut')).toBeInTheDocument()
    expect(screen.getByText('Himachal Pradesh, India')).toBeInTheDocument()
    expect(screen.getByTestId('material-card-wood-type-badge-mat-002')).toHaveTextContent('walnut')
  })
})
