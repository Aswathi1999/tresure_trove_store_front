import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
const pathnameMock = vi.fn(() => '/account')

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: pushMock }),
}))

const logoutMock = vi.fn()
vi.mock('@/lib/auth/actions', () => ({
  logout: () => logoutMock(),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import { AccountNav } from './AccountNav'

describe('AccountNav', () => {
  beforeEach(() => {
    pushMock.mockReset()
    logoutMock.mockReset()
  })

  it('renders all desktop nav links', () => {
    render(<AccountNav />)
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('nav-orders')).toBeInTheDocument()
    expect(screen.getByTestId('nav-addresses')).toBeInTheDocument()
    expect(screen.getByTestId('nav-wishlist')).toBeInTheDocument()
    expect(screen.getByTestId('nav-settings')).toBeInTheDocument()
  })

  it('renders all mobile nav links', () => {
    render(<AccountNav />)
    expect(screen.getByTestId('mobile-nav-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav-orders')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav-addresses')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav-wishlist')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav-settings')).toBeInTheDocument()
  })

  it('renders nav links with correct hrefs', () => {
    render(<AccountNav />)
    expect(screen.getByTestId('nav-dashboard')).toHaveAttribute('href', '/account')
    expect(screen.getByTestId('nav-orders')).toHaveAttribute('href', '/account/orders')
    expect(screen.getByTestId('nav-addresses')).toHaveAttribute('href', '/account/addresses')
    expect(screen.getByTestId('nav-wishlist')).toHaveAttribute('href', '/account/wishlist')
    expect(screen.getByTestId('nav-settings')).toHaveAttribute('href', '/account/settings')
  })

  it('renders a sign out button', () => {
    render(<AccountNav />)
    expect(screen.getByTestId('account-nav-signout')).toBeInTheDocument()
    expect(screen.getByTestId('account-nav-signout')).toHaveTextContent(/sign out/i)
  })

  it('calls logout and redirects to /login when sign out is clicked', async () => {
    const user = userEvent.setup()
    logoutMock.mockResolvedValueOnce({ ok: true })
    render(<AccountNav />)

    await user.click(screen.getByTestId('account-nav-signout'))

    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('marks the dashboard link as active when on /account', () => {
    pathnameMock.mockReturnValue('/account')
    render(<AccountNav />)
    const dashboardLink = screen.getByTestId('nav-dashboard')
    expect(dashboardLink.className).toMatch(/bg-/)
  })

  it('marks orders link as active when on /account/orders', () => {
    pathnameMock.mockReturnValue('/account/orders')
    render(<AccountNav />)
    const ordersLink = screen.getByTestId('nav-orders')
    expect(ordersLink.className).toMatch(/bg-/)
  })

  it('does not mark dashboard as active when on /account/orders', () => {
    pathnameMock.mockReturnValue('/account/orders')
    render(<AccountNav />)
    const dashboardLink = screen.getByTestId('nav-dashboard')
    const ordersLink = screen.getByTestId('nav-orders')
    expect(dashboardLink.className).not.toMatch(/bg-\[var\(--color-tt-ink\)\]/)
    expect(ordersLink.className).toMatch(/bg-/)
  })
})
