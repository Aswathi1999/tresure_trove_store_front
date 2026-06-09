import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
const searchParamsRef = { current: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/products',
  useSearchParams: () => searchParamsRef.current,
}))

import { Pagination } from './Pagination'

describe('Pagination', () => {
  beforeEach(() => {
    pushMock.mockReset()
    searchParamsRef.current = new URLSearchParams()
  })

  it('renders with data-testid="pagination"', () => {
    render(<Pagination currentPage={1} totalPages={3} />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('renders a page button for each page', () => {
    render(<Pagination currentPage={1} totalPages={3} />)
    expect(screen.getByTestId('page-button-1')).toBeInTheDocument()
    expect(screen.getByTestId('page-button-2')).toBeInTheDocument()
    expect(screen.getByTestId('page-button-3')).toBeInTheDocument()
  })

  it('marks the current page button with aria-current="page"', () => {
    render(<Pagination currentPage={2} totalPages={3} />)
    expect(screen.getByTestId('page-button-2')).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark non-current page buttons with aria-current', () => {
    render(<Pagination currentPage={2} totalPages={3} />)
    expect(screen.getByTestId('page-button-1')).not.toHaveAttribute('aria-current')
    expect(screen.getByTestId('page-button-3')).not.toHaveAttribute('aria-current')
  })

  it('disables the Previous button on page 1', () => {
    render(<Pagination currentPage={1} totalPages={3} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('enables the Previous button on pages after 1', () => {
    render(<Pagination currentPage={2} totalPages={3} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled()
  })

  it('disables the Next button on the last page', () => {
    render(<Pagination currentPage={3} totalPages={3} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('enables the Next button on pages before the last', () => {
    render(<Pagination currentPage={1} totalPages={3} />)
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled()
  })

  it('clicking a page button pushes the page param to the URL', async () => {
    const user = userEvent.setup()
    render(<Pagination currentPage={1} totalPages={3} />)
    await user.click(screen.getByTestId('page-button-2'))
    expect(pushMock).toHaveBeenCalledWith('/products?page=2')
  })

  it('clicking page 1 removes the page param from the URL', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('page=2')
    render(<Pagination currentPage={2} totalPages={3} />)
    await user.click(screen.getByTestId('page-button-1'))
    expect(pushMock).toHaveBeenCalledWith('/products?')
  })

  it('clicking Next advances to the next page', async () => {
    const user = userEvent.setup()
    render(<Pagination currentPage={1} totalPages={3} />)
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(pushMock).toHaveBeenCalledWith('/products?page=2')
  })

  it('clicking Previous goes to the previous page', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('page=3')
    render(<Pagination currentPage={3} totalPages={3} />)
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(pushMock).toHaveBeenCalledWith('/products?page=2')
  })

  it('preserves existing search params when navigating pages', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('sort=-created_at')
    render(<Pagination currentPage={1} totalPages={3} />)
    await user.click(screen.getByTestId('page-button-2'))
    expect(pushMock).toHaveBeenCalledWith('/products?sort=-created_at&page=2')
  })

  it('renders a single page without crashing', () => {
    render(<Pagination currentPage={1} totalPages={1} />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })
})
