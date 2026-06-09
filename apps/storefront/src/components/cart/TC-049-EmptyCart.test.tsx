import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}))

import { EmptyCart } from './EmptyCart'

describe('EmptyCart', () => {
  it('renders the empty-cart container', () => {
    render(<EmptyCart onClose={vi.fn()} />)
    expect(screen.getByTestId('empty-cart')).toBeInTheDocument()
  })

  it('shows the empty cart heading', () => {
    render(<EmptyCart onClose={vi.fn()} />)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('renders the continue shopping link to /products', () => {
    render(<EmptyCart onClose={vi.fn()} />)
    expect(screen.getByTestId('continue-shopping-link')).toHaveAttribute('href', '/products')
  })

  it('calls onClose when continue shopping link is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<EmptyCart onClose={onClose} />)
    await user.click(screen.getByTestId('continue-shopping-link'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
