import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const pushMock = vi.fn()
const searchParamsRef = { current: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  // SortToolbar navigates via router.replace; map it to the same spy assertions check.
  useRouter: () => ({ push: pushMock, replace: pushMock }),
  usePathname: () => '/products',
  useSearchParams: () => searchParamsRef.current,
}))

import { SortToolbar } from './SortToolbar'

describe('SortToolbar', () => {
  beforeEach(() => {
    pushMock.mockReset()
    searchParamsRef.current = new URLSearchParams()
  })

  it('renders with data-testid="sort-toolbar"', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    expect(screen.getByTestId('sort-toolbar')).toBeInTheDocument()
  })

  it('shows "No results" when total is 0', () => {
    render(<SortToolbar total={0} offset={0} limit={16} />)
    expect(screen.getByTestId('results-count')).toHaveTextContent('No results')
  })

  it('shows the correct range for the first page', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    expect(screen.getByTestId('results-count')).toHaveTextContent('Displaying 1–16 of 48 Results')
  })

  it('shows the correct range for the second page', () => {
    render(<SortToolbar total={48} offset={16} limit={16} />)
    expect(screen.getByTestId('results-count')).toHaveTextContent('Displaying 17–32 of 48 Results')
  })

  it('clamps the "to" value at total on the last page', () => {
    render(<SortToolbar total={48} offset={40} limit={16} />)
    expect(screen.getByTestId('results-count')).toHaveTextContent('Displaying 41–48 of 48 Results')
  })

  it('renders the sort trigger with data-testid', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    expect(screen.getByTestId('sort-select')).toBeInTheDocument()
  })

  it('keeps the options list closed until the trigger is clicked', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    expect(screen.queryByTestId('sort-options')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('sort-select'))
    expect(screen.getByTestId('sort-options')).toBeInTheDocument()
  })

  it('renders all 4 sort options when open', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    fireEvent.click(screen.getByTestId('sort-select'))
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('defaults to Recommended when no sort param is set', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    expect(screen.getByTestId('sort-select')).toHaveTextContent('Recommended')
  })

  it('reflects the current sort param from search params', () => {
    searchParamsRef.current = new URLSearchParams('sort=-created_at')
    render(<SortToolbar total={48} offset={0} limit={16} />)
    expect(screen.getByTestId('sort-select')).toHaveTextContent('Newest Arrivals')
  })

  it('selecting an option sets the sort param in the URL', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    fireEvent.click(screen.getByTestId('sort-select'))
    fireEvent.click(screen.getByTestId('sort-option-variants.prices.amount'))
    expect(pushMock).toHaveBeenCalledWith('/products?sort=variants.prices.amount')
  })

  it('selecting Recommended removes the sort param from the URL', () => {
    searchParamsRef.current = new URLSearchParams('sort=-created_at')
    render(<SortToolbar total={48} offset={0} limit={16} />)
    fireEvent.click(screen.getByTestId('sort-select'))
    fireEvent.click(screen.getByTestId('sort-option-recommended'))
    expect(pushMock).toHaveBeenCalledWith('/products?')
  })

  it('changing sort always removes the page param', () => {
    searchParamsRef.current = new URLSearchParams('page=3')
    render(<SortToolbar total={48} offset={32} limit={16} />)
    fireEvent.click(screen.getByTestId('sort-select'))
    fireEvent.click(screen.getByTestId('sort-option--variants.prices.amount'))
    expect(pushMock).toHaveBeenCalledWith('/products?sort=-variants.prices.amount')
  })

  it('closes the options list after a selection', () => {
    render(<SortToolbar total={48} offset={0} limit={16} />)
    fireEvent.click(screen.getByTestId('sort-select'))
    fireEvent.click(screen.getByTestId('sort-option--created_at'))
    expect(screen.queryByTestId('sort-options')).not.toBeInTheDocument()
  })
})
