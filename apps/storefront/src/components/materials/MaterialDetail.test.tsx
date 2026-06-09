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

import type { StorefrontMaterialStory } from '@/lib/payload'
import { MaterialDetail } from './MaterialDetail'

const mockMaterial: StorefrontMaterialStory = {
  id: 'mat-001',
  title: 'Teak',
  slug: 'teak',
  woodType: 'teak',
  origin: 'Kerala, India',
  sustainabilityRating: 5,
  shortDescription: 'The gold standard of Indian hardwoods.',
  description: [
    'Teak has been used in Indian craftsmanship for over a thousand years.',
    'We source exclusively from FSC-certified forest cooperatives.',
  ],
  featuredImage: {
    url: 'https://cdn.treasure-trove.in/materials/teak.jpg',
    alt: 'Close-up of teak wood grain',
  },
}

describe('MaterialDetail', () => {
  it('renders the article with correct testid', () => {
    render(<MaterialDetail material={mockMaterial} />)
    expect(screen.getByTestId('material-detail')).toBeInTheDocument()
  })

  it('renders the material name with correct testid', () => {
    render(<MaterialDetail material={mockMaterial} />)
    const name = screen.getByTestId('material-detail-name')
    expect(name).toBeInTheDocument()
    expect(name).toHaveTextContent('Teak')
  })

  it('renders the wood type badge with correct testid', () => {
    render(<MaterialDetail material={mockMaterial} />)
    const badge = screen.getByTestId('material-detail-wood-type-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('teak')
  })

  it('renders the origin with correct testid', () => {
    render(<MaterialDetail material={mockMaterial} />)
    const origin = screen.getByTestId('material-detail-origin')
    expect(origin).toBeInTheDocument()
    expect(origin).toHaveTextContent('Kerala, India')
  })

  it('renders the sustainability rating component', () => {
    render(<MaterialDetail material={mockMaterial} />)
    expect(screen.getByTestId('sustainability-rating')).toBeInTheDocument()
  })

  it('renders the short description with correct testid', () => {
    render(<MaterialDetail material={mockMaterial} />)
    const desc = screen.getByTestId('material-detail-short-description')
    expect(desc).toBeInTheDocument()
    expect(desc).toHaveTextContent('The gold standard of Indian hardwoods.')
  })

  it('renders the description section with correct testid', () => {
    render(<MaterialDetail material={mockMaterial} />)
    expect(screen.getByTestId('material-detail-description')).toBeInTheDocument()
  })

  it('renders all description paragraphs', () => {
    render(<MaterialDetail material={mockMaterial} />)
    expect(
      screen.getByText('Teak has been used in Indian craftsmanship for over a thousand years.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('We source exclusively from FSC-certified forest cooperatives.'),
    ).toBeInTheDocument()
  })

  it('renders the featured image with correct src', () => {
    render(<MaterialDetail material={mockMaterial} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://cdn.treasure-trove.in/materials/teak.jpg')
  })

  it('renders the featured image with correct alt', () => {
    render(<MaterialDetail material={mockMaterial} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Close-up of teak wood grain')
  })

  it('renders the "Material Story" eyebrow label', () => {
    render(<MaterialDetail material={mockMaterial} />)
    expect(screen.getByText('Material Story')).toBeInTheDocument()
  })

  it('renders empty description section when description array is empty', () => {
    const material = { ...mockMaterial, description: [] }
    render(<MaterialDetail material={material} />)
    const desc = screen.getByTestId('material-detail-description')
    expect(desc).toBeInTheDocument()
    expect(desc.children).toHaveLength(0)
  })
})
