import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const replaceMock = vi.fn()
const searchParamsRef = { current: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/products',
  useSearchParams: () => searchParamsRef.current,
}))

import { FilterSidebar } from './FilterSidebar'

describe('FilterSidebar', () => {
  beforeEach(() => {
    replaceMock.mockReset()
    searchParamsRef.current = new URLSearchParams()
  })

  it('renders with data-testid="filter-sidebar"', () => {
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument()
  })

  it('displays the correct result count (plural)', () => {
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('filter-result-count')).toHaveTextContent('24 results')
  })

  it('displays singular "result" when totalCount is 1', () => {
    render(<FilterSidebar totalCount={1} />)
    expect(screen.getByTestId('filter-result-count')).toHaveTextContent('1 result')
  })

  it('renders the price range slider with data-testid', () => {
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('price-range-slider')).toBeInTheDocument()
  })

  it('shows the default max price of ₹50,000 in the price heading', () => {
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByText(/Price \(₹0 – ₹50,000\)/)).toBeInTheDocument()
  })

  it('updates the displayed price in the heading when the slider changes', () => {
    render(<FilterSidebar totalCount={24} />)
    const slider = screen.getByTestId('price-range-slider')
    fireEvent.change(slider, { target: { value: '30000' } })
    expect(screen.getByText(/Price \(₹0 – ₹30,000\)/)).toBeInTheDocument()
  })

  it('replaces the URL with the maxPrice param on slider mouseup', () => {
    render(<FilterSidebar totalCount={24} />)
    const slider = screen.getByTestId('price-range-slider')
    fireEvent.mouseUp(slider, { target: { value: '20000' } })
    expect(replaceMock).toHaveBeenCalledWith('/products?maxPrice=20000')
  })

  // ── In-stock toggle ─────────────────────────────────────────────────────────

  it('renders the in-stock toggle with data-testid', () => {
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('in-stock-toggle')).toBeInTheDocument()
  })

  it('in-stock toggle has aria-checked="false" by default', () => {
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('in-stock-toggle')).toHaveAttribute('aria-checked', 'false')
  })

  it('in-stock toggle reflects aria-checked="true" when inStock=1 is in the URL', () => {
    searchParamsRef.current = new URLSearchParams('inStock=1')
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('in-stock-toggle')).toHaveAttribute('aria-checked', 'true')
  })

  it('clicking the in-stock toggle sets inStock=1 in the URL', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar totalCount={24} />)
    await user.click(screen.getByTestId('in-stock-toggle'))
    expect(replaceMock).toHaveBeenCalledWith('/products?inStock=1')
  })

  it('clicking in-stock toggle when active removes the inStock param', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('inStock=1')
    render(<FilterSidebar totalCount={24} />)
    await user.click(screen.getByTestId('in-stock-toggle'))
    expect(replaceMock).toHaveBeenCalledWith('/products?')
  })

  // ── Clear all ─────────────────────────────────────────────────────────────

  it('renders the Clear All button only when a filter is active', () => {
    searchParamsRef.current = new URLSearchParams('inStock=1')
    render(<FilterSidebar totalCount={24} />)
    expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument()
  })

  it('Clear All replaces with the bare pathname (no query params)', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('inStock=1')
    render(<FilterSidebar totalCount={24} />)
    await user.click(screen.getByTestId('clear-filters-button'))
    expect(replaceMock).toHaveBeenCalledWith('/products')
  })
})
