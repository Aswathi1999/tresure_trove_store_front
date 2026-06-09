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
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
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

import type { HomepageProduct } from '@/lib/medusa'
import { RelatedProductsByMaterial } from './RelatedProductsByMaterial'

const mockProducts: HomepageProduct[] = [
  {
    id: 'prod-001',
    title: 'Teak Dining Table',
    price: 'Rs. 45,000',
    imageUrl: 'https://cdn.treasure-trove.in/products/teak-table.jpg',
    href: '/products/teak-dining-table',
  },
  {
    id: 'prod-002',
    title: 'Teak Bed Frame',
    price: 'Rs. 85,000',
    imageUrl: 'https://cdn.treasure-trove.in/products/teak-bed.jpg',
    href: '/products/teak-bed-frame',
  },
  {
    id: 'prod-003',
    title: 'Teak Side Table',
    price: 'Rs. 12,000',
    imageUrl: 'https://cdn.treasure-trove.in/products/teak-side.jpg',
    href: '/products/teak-side-table',
  },
]

describe('RelatedProductsByMaterial', () => {
  it('renders nothing when products list is empty', () => {
    const { container } = render(<RelatedProductsByMaterial products={[]} materialName="Teak" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the section with correct testid', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByTestId('related-products-by-material')).toBeInTheDocument()
  })

  it('renders the "Featured Pieces" heading', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByText('Featured Pieces')).toBeInTheDocument()
  })

  it('renders the "Made with [materialName]" label', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByText('Made with Teak')).toBeInTheDocument()
  })

  it('uses the correct material name in the label', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Walnut" />)
    expect(screen.getByText('Made with Walnut')).toBeInTheDocument()
  })

  it('renders a card for each product', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    mockProducts.forEach((p) => {
      expect(screen.getByTestId(`related-product-card-${p.id}`)).toBeInTheDocument()
    })
  })

  it('renders product titles', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByText('Teak Dining Table')).toBeInTheDocument()
    expect(screen.getByText('Teak Bed Frame')).toBeInTheDocument()
    expect(screen.getByText('Teak Side Table')).toBeInTheDocument()
  })

  it('renders product prices', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByText('Rs. 45,000')).toBeInTheDocument()
    expect(screen.getByText('Rs. 85,000')).toBeInTheDocument()
  })

  it('renders product name with correct testid', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByTestId('related-product-name-prod-001')).toHaveTextContent(
      'Teak Dining Table',
    )
  })

  it('renders product price with correct testid', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    expect(screen.getByTestId('related-product-price-prod-001')).toHaveTextContent('Rs. 45,000')
  })

  it('product links use product.href', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/products/teak-dining-table')
    expect(hrefs).toContain('/products/teak-bed-frame')
  })

  it('renders product images with correct alt text', () => {
    render(<RelatedProductsByMaterial products={mockProducts} materialName="Teak" />)
    const imgs = screen.getAllByRole('img')
    expect(imgs[0]).toHaveAttribute('alt', 'Teak Dining Table')
    expect(imgs[1]).toHaveAttribute('alt', 'Teak Bed Frame')
  })
})
