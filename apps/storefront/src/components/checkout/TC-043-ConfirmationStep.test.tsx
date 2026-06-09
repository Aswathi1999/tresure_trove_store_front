import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { MockOrder } from '@/lib/checkout.mock'

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

import ConfirmationStep from './ConfirmationStep'

const MOCK_ORDER: MockOrder = {
  id: 'TT-2026-12345',
  items: [
    {
      id: 'item_1',
      title: 'Artisan Sculpted Vase',
      variant: 'Ivory',
      quantity: 2,
      unitPrice: 845000,
      imageUrl: 'https://cdn.example.com/vase.jpg',
      imageAlt: 'Ivory vase',
    },
  ],
  address: {
    email: 'arjun@example.com',
    fullName: 'Arjun Mehra',
    phone: '+919876543210',
    addressLine1: '12 MG Road',
    addressLine2: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'IN',
  },
  shippingOption: {
    id: 'ship_standard',
    name: 'Standard Delivery',
    carrier: 'DTDC / Blue Dart',
    estimatedDelivery: '5–7 business days',
    price: 0,
  },
  subtotal: 1690000,
  shipping: 0,
  total: 1690000,
  currency: 'INR',
}

describe('ConfirmationStep', () => {
  it('renders the confirmation section', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
  })

  it('renders the "Order Placed." heading', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByTestId('confirmation-heading')).toHaveTextContent('Order Placed.')
  })

  it('renders the order ID', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByTestId('confirmation-order-id')).toHaveTextContent('TT-2026-12345')
  })

  it('renders the full shipping address', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    const addressEl = document.querySelector('address')
    expect(addressEl?.textContent).toContain('Arjun Mehra')
    expect(addressEl?.textContent).toContain('12 MG Road')
    expect(addressEl?.textContent).toContain('Indiranagar')
    expect(addressEl?.textContent).toContain('Bengaluru')
    expect(addressEl?.textContent).toContain('Karnataka')
    expect(addressEl?.textContent).toContain('560038')
    expect(addressEl?.textContent).toContain('IN')
  })

  it('renders address without optional line 2 when absent', () => {
    const orderNoLine2: MockOrder = {
      ...MOCK_ORDER,
      address: { ...MOCK_ORDER.address, addressLine2: undefined },
    }
    render(<ConfirmationStep order={orderNoLine2} />)
    const addressEl = document.querySelector('address')
    expect(addressEl?.textContent).not.toContain('Indiranagar')
    expect(addressEl?.textContent).toContain('Arjun Mehra')
  })

  it('renders shipping method name and estimated delivery', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByText('5–7 business days')).toBeInTheDocument()
    expect(screen.getByText('Standard Delivery')).toBeInTheDocument()
  })

  it('renders "Razorpay" as payment provider for INR orders', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByText(/Razorpay/)).toBeInTheDocument()
  })

  it('renders "Stripe" as payment provider for USD orders', () => {
    render(<ConfirmationStep order={{ ...MOCK_ORDER, currency: 'USD' }} />)
    expect(screen.getByText(/Stripe/)).toBeInTheDocument()
  })

  it('renders "Stripe" as payment provider for AED orders', () => {
    render(<ConfirmationStep order={{ ...MOCK_ORDER, currency: 'AED' }} />)
    expect(screen.getByText(/Stripe/)).toBeInTheDocument()
  })

  it('renders the order summary section', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByTestId('confirmation-order-summary')).toBeInTheDocument()
  })

  it('renders each order item with title and quantity', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByText('Artisan Sculpted Vase')).toBeInTheDocument()
    expect(screen.getByText(/QTY: 2/)).toBeInTheDocument()
    expect(screen.getByText(/Ivory/)).toBeInTheDocument()
  })

  it('renders item line price (unitPrice × quantity)', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    // 845000 × 2 = 1690000 → Rs. 16,900 (appears as item price, subtotal, and total)
    expect(screen.getAllByText('Rs. 16,900').length).toBeGreaterThanOrEqual(1)
  })

  it('renders subtotal', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    // subtotal = 1690000 → Rs. 16,900
    const amounts = screen.getAllByText('Rs. 16,900')
    expect(amounts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Complimentary" for zero shipping', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByText('Complimentary')).toBeInTheDocument()
  })

  it('renders formatted shipping cost when non-zero', () => {
    const orderWithShipping: MockOrder = {
      ...MOCK_ORDER,
      shippingOption: { ...MOCK_ORDER.shippingOption, price: 59900 },
      shipping: 59900,
      total: 1749900,
    }
    render(<ConfirmationStep order={orderWithShipping} />)
    expect(screen.getByText('Rs. 599')).toBeInTheDocument()
  })

  it('renders total amount', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    // total = 1690000 → Rs. 16,900
    const totals = screen.getAllByText('Rs. 16,900')
    expect(totals.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "CONTINUE SHOPPING" link pointing to /products', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    const link = screen.getByTestId('continue-shopping-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/products')
  })

  it('renders the "VIEW ORDER" button', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByTestId('view-order-button')).toBeInTheDocument()
  })

  it('renders item images with correct alt text', () => {
    render(<ConfirmationStep order={MOCK_ORDER} />)
    expect(screen.getByAltText('Ivory vase')).toBeInTheDocument()
  })
})
