import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { HTMLAttributes, ReactNode, AnchorHTMLAttributes } from 'react'

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
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _i,
      animate: _a,
      whileInView: _wv,
      viewport: _vp,
      transition: _t,
      ...rest
    }: HTMLAttributes<HTMLDivElement> & {
      children?: ReactNode
      initial?: unknown
      animate?: unknown
      whileInView?: unknown
      viewport?: unknown
      transition?: unknown
    }) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

import { RelatedProducts } from './RelatedProducts'

const baseProducts = [
  {
    id: 'p1',
    href: '/products/chair-a',
    title: 'Chair A',
    price: 'Rs. 450',
    imageUrl: 'https://cdn.example.com/a.jpg',
  },
  {
    id: 'p2',
    href: '/products/chair-b',
    title: 'Chair B',
    price: 'Rs. 550',
    imageUrl: 'https://cdn.example.com/b.jpg',
  },
  {
    id: 'p3',
    href: '/products/chair-c',
    title: 'Chair C',
    price: 'Rs. 650',
    imageUrl: 'https://cdn.example.com/c.jpg',
    badge: 'New',
    badgeVariant: 'gold' as const,
  },
]

describe('RelatedProducts', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollBy = vi.fn()
  })

  it('renders nothing when the products list is empty', () => {
    const { container } = render(<RelatedProducts products={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the section container', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByTestId('related-products')).toBeInTheDocument()
  })

  it('renders the "You May Also Like" heading', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByText(/you may also like/i)).toBeInTheDocument()
  })

  it('renders the carousel track', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByTestId('carousel-track')).toBeInTheDocument()
  })

  it('renders the previous carousel button', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByTestId('carousel-prev')).toBeInTheDocument()
  })

  it('renders the next carousel button', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByTestId('carousel-next')).toBeInTheDocument()
  })

  it('renders a card for each product', () => {
    render(<RelatedProducts products={baseProducts} />)
    baseProducts.forEach((p) => {
      expect(screen.getByTestId(`related-product-${p.id}`)).toBeInTheDocument()
    })
  })

  it('renders product titles', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByText('Chair A')).toBeInTheDocument()
    expect(screen.getByText('Chair B')).toBeInTheDocument()
    expect(screen.getByText('Chair C')).toBeInTheDocument()
  })

  it('renders product prices', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByText('Rs. 450')).toBeInTheDocument()
    expect(screen.getByText('Rs. 550')).toBeInTheDocument()
  })

  it('renders a badge when the product has one', () => {
    render(<RelatedProducts products={baseProducts} />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('does not render a badge for products without one', () => {
    render(<RelatedProducts products={[baseProducts[0]!]} />)
    expect(screen.queryByText('New')).not.toBeInTheDocument()
  })

  it('renders each product as a link with the correct href', () => {
    render(<RelatedProducts products={baseProducts} />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/products/chair-a')
    expect(hrefs).toContain('/products/chair-b')
  })

  it('caps at 6 products even when more are passed', () => {
    const manyProducts = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      href: `/products/item-${i}`,
      title: `Item ${i}`,
      price: 'Rs. 100',
      imageUrl: 'https://cdn.example.com/img.jpg',
    }))
    render(<RelatedProducts products={manyProducts} />)
    // Only 6 product testids should exist
    expect(screen.queryByTestId('related-product-p6')).not.toBeInTheDocument()
    expect(screen.queryByTestId('related-product-p7')).not.toBeInTheDocument()
    expect(screen.getByTestId('related-product-p5')).toBeInTheDocument()
  })

  it('calls scrollBy on the carousel track when next is clicked', async () => {
    const user = userEvent.setup()
    render(<RelatedProducts products={baseProducts} />)
    await user.click(screen.getByTestId('carousel-next'))
    expect(HTMLElement.prototype.scrollBy).toHaveBeenCalled()
  })

  it('calls scrollBy on the carousel track when prev is clicked', async () => {
    const user = userEvent.setup()
    render(<RelatedProducts products={baseProducts} />)
    await user.click(screen.getByTestId('carousel-prev'))
    expect(HTMLElement.prototype.scrollBy).toHaveBeenCalled()
  })
})
