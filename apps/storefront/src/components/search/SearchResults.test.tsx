import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

vi.mock('@/components/products/ProductCard', () => ({
  ProductCard: ({ product }: { product: { id: string; title: string } }) => (
    <div data-testid={`product-card-${product.id}`}>{product.title}</div>
  ),
}))

import { SearchResults } from './SearchResults'
import type { SearchProduct } from '@/lib/medusa'

const makeProduct = (
  overrides: Partial<SearchProduct> & { id: string; title: string },
): SearchProduct => ({
  price: 'Rs. 10,000',
  imageUrl: '/img.jpg',
  href: `/products/${overrides.id}`,
  priceAmount: 10000,
  ...overrides,
})

const fixtures: SearchProduct[] = [
  makeProduct({
    id: '1',
    title: 'Teak Chair',
    priceAmount: 15000,
    price: 'Rs. 15,000',
    category: 'Seating',
    material: 'Teak',
  }),
  makeProduct({
    id: '2',
    title: 'Oak Table',
    priceAmount: 25000,
    price: 'Rs. 25,000',
    category: 'Tables',
    material: 'Oak',
  }),
  makeProduct({
    id: '3',
    title: 'Linen Sofa',
    priceAmount: 45000,
    price: 'Rs. 45,000',
    category: 'Seating',
    material: 'Linen',
  }),
]

describe('SearchResults', () => {
  describe('heading and count', () => {
    it('renders the search heading containing the query', () => {
      render(<SearchResults query="chair" initialProducts={fixtures} />)
      expect(screen.getByTestId('search-heading')).toHaveTextContent('chair')
    })

    it('shows the correct result count', () => {
      render(<SearchResults query="chair" initialProducts={fixtures} />)
      expect(screen.getByTestId('search-result-count')).toHaveTextContent('3 products found')
    })

    it('shows "1 product found" (singular) for a single result', () => {
      render(<SearchResults query="chair" initialProducts={[fixtures[0]!]} />)
      expect(screen.getByTestId('search-result-count')).toHaveTextContent('1 product found')
    })

    it('shows "0 products found" and no-results state when initialProducts is empty', () => {
      render(<SearchResults query="xyzzy" initialProducts={[]} />)
      expect(screen.getByTestId('no-results')).toBeInTheDocument()
    })
  })

  describe('product grid', () => {
    it('renders a card for each product', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-3')).toBeInTheDocument()
    })

    it('renders the results grid container', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      expect(screen.getByTestId('search-results-grid')).toBeInTheDocument()
    })
  })

  describe('sort', () => {
    it('renders the sort select', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      expect(screen.getByTestId('search-sort')).toBeInTheDocument()
    })

    it('sorts products by price low-to-high', async () => {
      const user = userEvent.setup()
      render(<SearchResults query="q" initialProducts={fixtures} />)
      await user.click(screen.getByTestId('search-sort'))
      await user.click(screen.getByRole('button', { name: 'Price: Low to High' }))
      const cards = screen.getAllByTestId(/^product-card-/)
      expect(cards[0]).toHaveTextContent('Teak Chair') // 15 000
      expect(cards[1]).toHaveTextContent('Oak Table') // 25 000
      expect(cards[2]).toHaveTextContent('Linen Sofa') // 45 000
    })

    it('sorts products by price high-to-low', async () => {
      const user = userEvent.setup()
      render(<SearchResults query="q" initialProducts={fixtures} />)
      await user.click(screen.getByTestId('search-sort'))
      await user.click(screen.getByRole('button', { name: 'Price: High to Low' }))
      const cards = screen.getAllByTestId(/^product-card-/)
      expect(cards[0]).toHaveTextContent('Linen Sofa') // 45 000
      expect(cards[1]).toHaveTextContent('Oak Table') // 25 000
      expect(cards[2]).toHaveTextContent('Teak Chair') // 15 000
    })
  })

  describe('category filter', () => {
    it('shows category filter when products have categories', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      expect(screen.getByTestId('filter-category-Seating')).toBeInTheDocument()
      expect(screen.getByTestId('filter-category-Tables')).toBeInTheDocument()
    })

    it('hides category filter when no products have a category', () => {
      const noCatProducts = fixtures.map(({ category: _c, ...p }) => p as SearchProduct)
      render(<SearchResults query="q" initialProducts={noCatProducts} />)
      expect(screen.queryByTestId('filter-category-Seating')).not.toBeInTheDocument()
    })

    it('filters the grid to the clicked category', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      fireEvent.click(screen.getByTestId('filter-category-Tables'))
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-card-3')).not.toBeInTheDocument()
    })

    it('clicking the active category again shows all products', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      fireEvent.click(screen.getByTestId('filter-category-Tables'))
      fireEvent.click(screen.getByTestId('filter-category-Tables'))
      expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-3')).toBeInTheDocument()
    })
  })

  describe('price range filter', () => {
    it('renders the price range slider', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      expect(screen.getByTestId('filter-price-range')).toBeInTheDocument()
    })

    it('filters out products above the set max price', () => {
      render(<SearchResults query="q" initialProducts={fixtures} />)
      fireEvent.change(screen.getByTestId('filter-price-range'), { target: { value: '20000' } })
      expect(screen.getByTestId('product-card-1')).toBeInTheDocument() // 15 000 ≤ 20 000
      expect(screen.queryByTestId('product-card-2')).not.toBeInTheDocument() // 25 000 > 20 000
      expect(screen.queryByTestId('product-card-3')).not.toBeInTheDocument() // 45 000 > 20 000
    })
  })
})
