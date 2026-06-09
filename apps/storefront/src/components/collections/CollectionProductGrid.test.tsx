import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import type { MockProduct } from '@/lib/collections.mock'

// The grid reads the committed maxPrice from the URL (next/navigation).
let mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _p,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    priority?: boolean
    className?: string
  }) => <img src={src} alt={alt} {...props} />,
}))

import { CollectionProductGrid } from './CollectionProductGrid'

const makeProduct = (
  overrides: Partial<MockProduct> & { id: string; title: string },
): MockProduct => ({
  price: 'Rs. 10,000',
  priceValue: 10000,
  imageUrl: '/img.jpg',
  href: `/products/${overrides.id}`,
  material: '',
  inStock: true,
  ...overrides,
})

const fixtures: MockProduct[] = [
  makeProduct({ id: '1', title: 'Teak Chair', priceValue: 15000, price: 'Rs. 15,000' }),
  makeProduct({ id: '2', title: 'Brass Lamp', priceValue: 8000, price: 'Rs. 8,000' }),
  makeProduct({
    id: '3',
    title: 'Glass Vase',
    priceValue: 3000,
    price: 'Rs. 3,000',
    inStock: false,
  }),
]

// Renders and advances past the 600 ms skeleton delay
function renderAndSkipSkeleton(products: MockProduct[], handle = 'test') {
  render(<CollectionProductGrid products={products} collectionHandle={handle} />)
  act(() => {
    vi.advanceTimersByTime(600)
  })
}

describe('CollectionProductGrid', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSearchParams = new URLSearchParams()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Skeleton ──────────────────────────────────────────────────────────────

  it('shows the skeleton immediately after render', () => {
    render(<CollectionProductGrid products={fixtures} collectionHandle="test" />)
    expect(screen.getByTestId('collection-product-grid-skeleton')).toBeInTheDocument()
  })

  it('hides the skeleton after 600 ms', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.queryByTestId('collection-product-grid-skeleton')).not.toBeInTheDocument()
  })

  // ── Product grid ──────────────────────────────────────────────────────────

  it('renders the product grid after the loading delay', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.getByTestId('collection-product-grid')).toBeInTheDocument()
  })

  it('renders a card for each product', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.getByTestId('collection-product-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('collection-product-card-2')).toBeInTheDocument()
    expect(screen.getByTestId('collection-product-card-3')).toBeInTheDocument()
  })

  it('displays product title', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.getByText('Teak Chair')).toBeInTheDocument()
  })

  it('displays product price', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.getByText('Rs. 8,000')).toBeInTheDocument()
  })

  it('shows out-of-stock overlay for inStock=false products', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.getByTestId('out-of-stock-3')).toBeInTheDocument()
  })

  it('does not show out-of-stock overlay for in-stock products', () => {
    renderAndSkipSkeleton(fixtures)
    expect(screen.queryByTestId('out-of-stock-1')).not.toBeInTheDocument()
  })

  it('displays a badge when product has one', () => {
    const withBadge = [
      makeProduct({ id: 'b1', title: 'Sale Item', badge: 'SALE', badgeVariant: 'orange' }),
    ]
    renderAndSkipSkeleton(withBadge)
    expect(screen.getByText('SALE')).toBeInTheDocument()
  })

  it('does not render a badge when product has none', () => {
    renderAndSkipSkeleton([makeProduct({ id: 'nb', title: 'Plain Item' })])
    expect(screen.queryByText('SALE')).not.toBeInTheDocument()
  })

  it('renders product image', () => {
    renderAndSkipSkeleton([makeProduct({ id: 'img1', title: 'Chair', imageUrl: '/chair.jpg' })])
    expect(screen.getByAltText('Chair')).toHaveAttribute('src', '/chair.jpg')
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows empty state when products array is empty', () => {
    renderAndSkipSkeleton([], 'living-room')
    expect(screen.getByTestId('collection-empty-living-room')).toBeInTheDocument()
  })

  it('empty state has the browse-all-collections link', () => {
    renderAndSkipSkeleton([], 'dining')
    expect(screen.getByTestId('empty-state-browse-link')).toBeInTheDocument()
  })

  it('empty state browse link points to /collections', () => {
    renderAndSkipSkeleton([], 'dining')
    expect(screen.getByTestId('empty-state-browse-link')).toHaveAttribute('href', '/collections')
  })

  it('shows empty state when all products are filtered out by price', () => {
    mockSearchParams = new URLSearchParams('maxPrice=0')
    renderAndSkipSkeleton(fixtures, 'test')
    expect(screen.getByTestId('collection-empty-test')).toBeInTheDocument()
  })

  // ── Price filtering (driven by the maxPrice URL param) ──────────────────────

  it('price filter from the URL reduces visible cards', () => {
    mockSearchParams = new URLSearchParams('maxPrice=5000')
    renderAndSkipSkeleton(fixtures)
    // Only Glass Vase at 3000 is ≤ 5000
    expect(screen.getByTestId('collection-product-card-3')).toBeInTheDocument()
    expect(screen.queryByTestId('collection-product-card-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('collection-product-card-2')).not.toBeInTheDocument()
  })
})
