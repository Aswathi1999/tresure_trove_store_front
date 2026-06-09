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

// QuickAddToCart (rendered inside each card) pulls in the Next router, the cart
// store, and an auth server action — stub them so this stays a pure rendering test.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/auth/actions', () => ({
  isUserAuthenticated: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/stores/cart', () => ({
  useCartStore: (selector: (s: { addItem: unknown; openCart: unknown }) => unknown) =>
    selector({ addItem: vi.fn(), openCart: vi.fn() }),
}))

import { FeaturedProducts } from './FeaturedProducts'
import type { HomepageProduct } from '@/lib/medusa'

const baseProps = { title: 'Bestsellers', subtitle: 'Our most-loved pieces' }

const products: HomepageProduct[] = [
  {
    id: 'prod_01',
    title: 'Ōkura Lounge Chair',
    price: 'Rs. 45,000',
    imageUrl: 'https://cdn.example.com/chair.jpg',
    href: '/products/okura-lounge-chair',
  },
  {
    id: 'prod_02',
    title: 'Kyōto Sofa',
    price: 'Rs. 1,20,000',
    originalPrice: 'Rs. 1,50,000',
    imageUrl: 'https://cdn.example.com/sofa.jpg',
    href: '/products/kyoto-sofa',
    badge: 'SALE',
    badgeVariant: 'orange',
  },
]

describe('FeaturedProducts', () => {
  it('renders the section with the given title as aria-label', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByRole('region', { name: 'Bestsellers' })).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByRole('heading', { name: 'Bestsellers' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByText('Our most-loved pieces')).toBeInTheDocument()
  })

  it('renders a card for each product', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByTestId('product-card-prod_01')).toBeInTheDocument()
    expect(screen.getByTestId('product-card-prod_02')).toBeInTheDocument()
  })

  it('links each product card to the correct href', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    const card = screen.getByTestId('product-card-prod_01')
    expect(card).toHaveAttribute('href', '/products/okura-lounge-chair')
  })

  it('renders the product title', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByText('Ōkura Lounge Chair')).toBeInTheDocument()
  })

  it('renders the product price', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByText('Rs. 45,000')).toBeInTheDocument()
  })

  it('renders the original price with line-through when discounted', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByText('Rs. 1,50,000')).toBeInTheDocument()
  })

  it('renders the badge text when provided', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.getByText('SALE')).toBeInTheDocument()
  })

  it('does not render a badge when badge is undefined', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    expect(screen.queryByText('BESTSELLER')).not.toBeInTheDocument()
  })

  it('renders the product image with correct alt text', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    const img = screen.getByAltText('Ōkura Lounge Chair')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/chair.jpg')
  })

  it('renders the "No Image" placeholder when imageUrl is empty', () => {
    const noImageProduct: HomepageProduct[] = [
      {
        id: 'prod_no_img',
        title: 'Chair Without Image',
        price: '₹10,000',
        imageUrl: '',
        href: '/products/no-img',
      },
    ]
    render(<FeaturedProducts {...baseProps} products={noImageProduct} />)
    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('shows the empty state message when products array is empty', () => {
    render(<FeaturedProducts {...baseProps} products={[]} />)
    expect(screen.getByText(/could not load products/i)).toBeInTheDocument()
  })

  it('does not render any product cards in the empty state', () => {
    render(<FeaturedProducts {...baseProps} products={[]} />)
    expect(screen.queryByTestId('product-card-prod_01')).not.toBeInTheDocument()
  })

  it('renders the default View All button with href /products', () => {
    render(<FeaturedProducts {...baseProps} products={products} />)
    const btn = screen.getByTestId('view-all-button')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/products')
  })

  it('renders a custom viewAllHref and viewAllLabel', () => {
    render(
      <FeaturedProducts
        {...baseProps}
        products={products}
        viewAllHref="/collections/new"
        viewAllLabel="See New Arrivals"
      />,
    )
    const btn = screen.getByTestId('view-all-button')
    expect(btn).toHaveAttribute('href', '/collections/new')
    expect(btn).toHaveTextContent('See New Arrivals')
  })
})
