import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { CartSummary } from './CartSummary'
import type { CartLineItem } from '@/lib/cart-types'

function makeItem(unitPrice: number, quantity: number): CartLineItem {
  return {
    id: `item_${Math.random()}`,
    productId: 'prod_01',
    variantId: 'var_01',
    title: 'Test Item',
    category: 'Furniture',
    variant: 'Natural',
    imageUrl: '',
    imageAlt: 'Test',
    unitPrice,
    quantity,
  }
}

describe('CartSummary', () => {
  it('renders the subtotal for a single item', () => {
    render(<CartSummary items={[makeItem(50000, 1)]} />)
    // 50000 paise = Rs. 500
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('Rs. 500')
  })

  it('renders the estimated total equal to subtotal', () => {
    render(<CartSummary items={[makeItem(50000, 1)]} />)
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Rs. 500')
  })

  it('applies quantity multiplier for subtotal', () => {
    render(<CartSummary items={[makeItem(50000, 3)]} />)
    // 50000 * 3 = 150000 paise = Rs. 1,500
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('Rs. 1,500')
  })

  it('sums multiple items correctly', () => {
    const items = [makeItem(50000, 2), makeItem(100000, 1)]
    render(<CartSummary items={items} />)
    // (50000*2) + (100000*1) = 200000 paise = Rs. 2,000
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('Rs. 2,000')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Rs. 2,000')
  })

  it('renders the checkout CTA linking to /checkout', () => {
    render(<CartSummary items={[makeItem(50000, 1)]} />)
    const cta = screen.getByTestId('checkout-cta')
    expect(cta).toHaveAttribute('href', '/checkout')
    expect(cta).toHaveTextContent(/proceed to checkout/i)
  })

  it('shows the GST (incl.) line instead of the old "Included" label', () => {
    render(<CartSummary items={[makeItem(50000, 1)]} />)
    expect(screen.getByText(/gst \(12%\)/i)).toBeInTheDocument()
    expect(screen.queryByText('Included')).not.toBeInTheDocument()
  })

  it('shows complimentary shipping label', () => {
    render(<CartSummary items={[makeItem(50000, 1)]} />)
    expect(screen.getByText(/complimentary/i)).toBeInTheDocument()
  })
})
