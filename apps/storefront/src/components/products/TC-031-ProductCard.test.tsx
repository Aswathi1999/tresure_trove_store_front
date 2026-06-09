import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _priority,
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

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    className?: string
    'data-testid'?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { ProductCard } from './ProductCard'
import type { HomepageProduct } from '@/lib/medusa'

const baseProduct: HomepageProduct = {
  id: 'prod_01',
  title: 'Ōkura Lounge Chair',
  price: 'Rs. 45,000',
  imageUrl: 'https://cdn.example.com/chair.jpg',
  href: '/products/okura-lounge-chair',
}

describe('ProductCard', () => {
  it('renders a link with the product data-testid', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('product-card-prod_01')).toBeInTheDocument()
  })

  it('links to the correct product href', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('product-card-prod_01')).toHaveAttribute(
      'href',
      '/products/okura-lounge-chair',
    )
  })

  it('renders the product title', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Ōkura Lounge Chair')).toBeInTheDocument()
  })

  it('renders the product price', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Rs. 45,000')).toBeInTheDocument()
  })

  it('renders the original price when provided', () => {
    const product: HomepageProduct = {
      ...baseProduct,
      originalPrice: 'Rs. 60,000',
    }
    render(<ProductCard product={product} />)
    expect(screen.getByText('Rs. 60,000')).toBeInTheDocument()
  })

  it('does not render an original price when not provided', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.queryByText('Rs. 60,000')).not.toBeInTheDocument()
  })

  it('renders the badge text when badge is provided', () => {
    const product: HomepageProduct = {
      ...baseProduct,
      badge: 'NEW',
      badgeVariant: 'gold',
    }
    render(<ProductCard product={product} />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('does not render a badge when badge is not provided', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.queryByText('NEW')).not.toBeInTheDocument()
  })

  it('renders the product image with correct src and alt', () => {
    render(<ProductCard product={baseProduct} />)
    const img = screen.getByAltText('Ōkura Lounge Chair')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/chair.jpg')
  })

  it('shows "No Image" placeholder when imageUrl is empty', () => {
    const product: HomepageProduct = { ...baseProduct, imageUrl: '' }
    render(<ProductCard product={product} />)
    expect(screen.getByText('No Image')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders the SALE badge with orange variant', () => {
    const product: HomepageProduct = {
      ...baseProduct,
      badge: 'SALE',
      badgeVariant: 'orange',
    }
    render(<ProductCard product={product} />)
    expect(screen.getByText('SALE')).toBeInTheDocument()
  })
})
