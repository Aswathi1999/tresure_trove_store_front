'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, LayoutGrid, User, ShoppingBag, Package } from 'lucide-react'
import { useCartStore } from '@/stores/cart'

const tabs = [
  { label: 'Home', href: '/', icon: Home, testId: 'home' },
  { label: 'Categories', href: '/collections', icon: LayoutGrid, testId: 'categories' },
  { label: 'Account', href: '/account', icon: User, testId: 'account', center: true },
  // Cart opens the slide-in drawer (there is no /cart page).
  { label: 'Cart', href: '/cart', icon: ShoppingBag, testId: 'cart', drawer: true },
  { label: 'Orders', href: '/account/orders', icon: Package, testId: 'orders' },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const { items, openCart, isOpen } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = mounted ? items.reduce((n, i) => n + i.quantity, 0) : 0

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--color-tt-outline-variant)] grid grid-cols-5 items-center h-16"
      aria-label="Bottom navigation"
    >
      {tabs.map(({ label, href, icon: Icon, testId, center, drawer }) => {
        const isActive = drawer ? isOpen : pathname === href

        // Raised circular center button (Account).
        if (center) {
          return (
            <Link
              key={label}
              href={href}
              data-testid={`bottom-tab-${testId}`}
              className={`justify-self-center flex flex-col items-center justify-center w-12 h-12 -mt-4 rounded-full transition-colors ${
                isActive
                  ? 'bg-[#B45A3C] text-white'
                  : 'bg-[var(--color-tt-ink)] text-[var(--color-tt-gold)] hover:bg-[var(--color-tt-orange)]'
              }`}
            >
              <Icon size={20} />
            </Link>
          )
        }

        const tabClass = `relative flex flex-col items-center justify-center py-2 transition-colors ${
          isActive
            ? 'text-[#B45A3C]'
            : 'text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)]'
        }`

        const inner = (
          <>
            <div className="relative">
              <Icon size={20} />
              {testId === 'cart' && mounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">{label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 bg-[#B45A3C] rounded-full" />
            )}
          </>
        )

        // Cart is a drawer trigger, not a route.
        if (drawer) {
          return (
            <button
              key={label}
              type="button"
              onClick={openCart}
              data-testid={`bottom-tab-${testId}`}
              className={tabClass}
              aria-label="Open cart"
            >
              {inner}
            </button>
          )
        }

        return (
          <Link key={label} href={href} data-testid={`bottom-tab-${testId}`} className={tabClass}>
            {inner}
          </Link>
        )
      })}
    </nav>
  )
}
