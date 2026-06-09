import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MockProduct } from '@/lib/collections.mock'

// CollectionFilter reads/writes filter state through the URL (next/navigation).
// A controllable searchParams lets us drive the committed price filter.
let mockSearchParams = new URLSearchParams()
const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/categories/test',
  useSearchParams: () => mockSearchParams,
}))

import { CollectionFilter } from './CollectionFilter'

const makeProduct = (
  overrides: Partial<MockProduct> & { id: string; title: string },
): MockProduct => ({
  price: 'Rs. 10,000',
  priceValue: 10000,
  imageUrl: '/img.jpg',
  href: `/products/${overrides.id}`,
  material: 'Wood',
  inStock: true,
  ...overrides,
})

const fixtures: MockProduct[] = [
  makeProduct({ id: '1', title: 'Teak Chair', priceValue: 15000 }),
  makeProduct({ id: '2', title: 'Brass Lamp', priceValue: 8000 }),
  makeProduct({ id: '3', title: 'Glass Vase', priceValue: 3000 }),
]

describe('CollectionFilter', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams()
    replace.mockClear()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the desktop sidebar', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByTestId('collection-filter-sidebar')).toBeInTheDocument()
  })

  it('renders the price range slider', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByTestId('collection-price-range')).toBeInTheDocument()
  })

  it('renders the filter result count', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByTestId('filter-result-count')).toBeInTheDocument()
  })

  it('result count shows all products initially', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByTestId('filter-result-count')).toHaveTextContent('3 of 3')
  })

  // ── Price filter (driven by the maxPrice URL param) ─────────────────────────

  it('a committed maxPrice reduces the result count', () => {
    mockSearchParams = new URLSearchParams('maxPrice=5000')
    render(<CollectionFilter products={fixtures} />)
    // Only Glass Vase (3000) is ≤ 5000
    expect(screen.getByTestId('filter-result-count')).toHaveTextContent('1 of 3')
  })

  it('the slider reflects the committed maxPrice in its heading', () => {
    mockSearchParams = new URLSearchParams('maxPrice=5000')
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByText(/Price \(₹0 – ₹5,000\)/)).toBeInTheDocument()
  })

  // ── Clear filters ─────────────────────────────────────────────────────────

  it('clear button is hidden when no filters are active', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument()
  })

  it('clear button appears when a price filter is active', () => {
    mockSearchParams = new URLSearchParams('maxPrice=5000')
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument()
  })

  it('clicking clear resets the URL to the pathname', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('maxPrice=5000')
    render(<CollectionFilter products={fixtures} />)
    await user.click(screen.getByTestId('clear-filters-button'))
    expect(replace).toHaveBeenCalledWith('/categories/test')
  })

  // ── Mobile filter toggle ──────────────────────────────────────────────────

  it('renders the mobile filter toggle button', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.getByTestId('mobile-filter-toggle')).toBeInTheDocument()
  })

  it('mobile filter panel is hidden initially', () => {
    render(<CollectionFilter products={fixtures} />)
    expect(screen.queryByTestId('mobile-filter-panel')).not.toBeInTheDocument()
  })

  it('clicking the mobile toggle opens the filter panel', async () => {
    const user = userEvent.setup()
    render(<CollectionFilter products={fixtures} />)
    await user.click(screen.getByTestId('mobile-filter-toggle'))
    expect(screen.getByTestId('mobile-filter-panel')).toBeInTheDocument()
  })

  it('clicking the mobile toggle a second time closes the panel', async () => {
    const user = userEvent.setup()
    render(<CollectionFilter products={fixtures} />)
    await user.click(screen.getByTestId('mobile-filter-toggle'))
    await user.click(screen.getByTestId('mobile-filter-toggle'))
    expect(screen.queryByTestId('mobile-filter-panel')).not.toBeInTheDocument()
  })
})
