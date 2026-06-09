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

import { CollectionsGrid } from './CollectionsGrid'
import type { HomepageCollection } from '@/lib/medusa'

const collections: HomepageCollection[] = [
  {
    id: 'col_01',
    title: 'Living Room',
    handle: 'living-room',
    imageUrl: 'https://cdn.example.com/living.jpg',
    href: '/collections/living-room',
  },
  {
    id: 'col_02',
    title: 'Bedroom',
    handle: 'bedroom',
    imageUrl: 'https://cdn.example.com/bedroom.jpg',
    href: '/collections/bedroom',
  },
  { id: 'col_03', title: 'Dining', handle: 'dining', imageUrl: null, href: '/collections/dining' },
]

describe('CollectionsGrid', () => {
  it('renders the Collections section', () => {
    render(<CollectionsGrid collections={collections} />)
    expect(screen.getByRole('region', { name: /collections/i })).toBeInTheDocument()
  })

  it('renders the section heading "Our Collections"', () => {
    render(<CollectionsGrid collections={collections} />)
    expect(screen.getByRole('heading', { name: 'Our Collections' })).toBeInTheDocument()
  })

  it('renders a card for each collection', () => {
    render(<CollectionsGrid collections={collections} />)
    expect(screen.getByTestId('collection-card-col_01')).toBeInTheDocument()
    expect(screen.getByTestId('collection-card-col_02')).toBeInTheDocument()
    expect(screen.getByTestId('collection-card-col_03')).toBeInTheDocument()
  })

  it('renders each collection title', () => {
    render(<CollectionsGrid collections={collections} />)
    expect(screen.getByText('Living Room')).toBeInTheDocument()
    expect(screen.getByText('Bedroom')).toBeInTheDocument()
    expect(screen.getByText('Dining')).toBeInTheDocument()
  })

  it('links each card to the correct href', () => {
    render(<CollectionsGrid collections={collections} />)
    const card = screen.getByTestId('collection-card-col_01')
    expect(card).toHaveAttribute('href', '/collections/living-room')
  })

  it('renders images for collections that have an imageUrl', () => {
    render(<CollectionsGrid collections={collections} />)
    const img = screen.getByAltText('Living Room')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/living.jpg')
  })

  it('does not render an image when imageUrl is null', () => {
    render(<CollectionsGrid collections={collections} />)
    expect(screen.queryByAltText('Dining')).not.toBeInTheDocument()
  })

  it('renders "SHOP NOW >" text for each collection', () => {
    render(<CollectionsGrid collections={collections} />)
    const shopLinks = screen.getAllByText(/SHOP NOW/i)
    expect(shopLinks).toHaveLength(collections.length)
  })

  it('renders an empty grid without crashing', () => {
    render(<CollectionsGrid collections={[]} />)
    expect(screen.getByRole('region', { name: /collections/i })).toBeInTheDocument()
  })
})
