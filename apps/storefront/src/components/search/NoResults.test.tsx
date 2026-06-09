import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoResults } from './NoResults'

describe('NoResults', () => {
  it('renders the no-results container', () => {
    render(<NoResults query="lamp" />)
    expect(screen.getByTestId('no-results')).toBeInTheDocument()
  })

  it('echoes the query back in the heading', () => {
    render(<NoResults query="lamp" />)
    expect(screen.getByRole('heading')).toHaveTextContent(/No results for.*lamp/i)
  })

  it('renders the provided collection browse links with correct hrefs', () => {
    render(
      <NoResults
        query="anything"
        links={[
          { label: 'Decore', href: '/collections/decore' },
          { label: 'Bed & Bath', href: '/collections/bed-%26-bath' },
        ]}
      />,
    )
    expect(screen.getByTestId('no-results-browse-Decore')).toBeInTheDocument()
    expect(screen.getByTestId('no-results-browse-Decore').closest('a')).toHaveAttribute(
      'href',
      '/collections/decore',
    )
    expect(screen.getByTestId('no-results-browse-Bed & Bath').closest('a')).toHaveAttribute(
      'href',
      '/collections/bed-%26-bath',
    )
  })

  it('falls back to a Browse All Products link when no collections are provided', () => {
    render(<NoResults query="x" />)
    expect(screen.getByTestId('no-results-browse-all').closest('a')).toHaveAttribute(
      'href',
      '/products',
    )
  })

  it('shows the helper text asking to try different keywords', () => {
    render(<NoResults query="test" />)
    expect(screen.getByText(/try different keywords/i)).toBeInTheDocument()
  })

  it('handles a query with special characters without crashing', () => {
    render(<NoResults query="chair & table" />)
    expect(screen.getByTestId('no-results')).toBeInTheDocument()
  })
})
