'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, MapPin, Heart, Settings, LogOut } from 'lucide-react'
import { logout } from '@/lib/auth/actions'

const navItems = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard, testId: 'nav-dashboard' },
  { label: 'My Orders', href: '/account/orders', icon: ShoppingBag, testId: 'nav-orders' },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin, testId: 'nav-addresses' },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart, testId: 'nav-wishlist' },
  { label: 'Settings', href: '/account/settings', icon: Settings, testId: 'nav-settings' },
]

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await logout()
    router.push('/login')
  }

  return (
    <nav data-testid="account-nav" className="w-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0">
        <div className="mb-6 px-4">
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-tt-ink)] leading-tight">
            My Account
          </h2>
        </div>
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ label, href, icon: Icon, testId }) => {
            const isActive = href === '/account' ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  data-testid={testId}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-tt-ink)] text-[var(--color-tt-gold)]'
                      : 'text-[var(--color-tt-ink-muted)] hover:bg-[var(--color-tt-surface-container)] hover:text-[var(--color-tt-ink)]'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-6 pt-6 border-t border-[var(--color-tt-outline-variant)]">
          <button
            onClick={handleSignOut}
            data-testid="account-nav-signout"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-tt-outline)] hover:text-[var(--color-tt-danger)] transition-colors w-full rounded-sm hover:bg-red-50"
          >
            <LogOut size={16} className="shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile horizontal scroll nav */}
      <div className="lg:hidden w-full overflow-x-auto hide-scrollbar border-b border-[var(--color-tt-outline-variant)]">
        <ul className="flex items-center gap-0 min-w-max px-4">
          {navItems.map(({ label, href, icon: Icon, testId }) => {
            const isActive = href === '/account' ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  data-testid={`mobile-${testId}`}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[var(--color-tt-ink)] text-[var(--color-tt-ink)]'
                      : 'border-transparent text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)]'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
