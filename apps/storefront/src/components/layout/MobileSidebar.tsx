'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Home,
  LayoutGrid,
  Truck,
  ShoppingBag,
  Info,
  Mail,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import logoImg from '@/assets/logo.jpg'
import { useCartStore } from '@/stores/cart'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type MenuItem = {
  label: string
  href: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  // When true this item opens the cart slide-in drawer instead of navigating
  // (there is no /cart page — the cart is a drawer, same as BottomTabBar).
  drawer?: boolean
}

const menuItems: MenuItem[] = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'All Collections', href: '/collections', Icon: LayoutGrid },
  { label: 'Blog', href: '/journal', Icon: BookOpen },
  { label: 'Track Order', href: '/account/orders', Icon: Truck },
  { label: 'My Cart', href: '/cart', Icon: ShoppingBag, drawer: true },
  { label: 'About Us', href: '/about', Icon: Info },
  { label: 'Contact', href: '/contact', Icon: Mail },
]

const categoryItems = [
  { label: 'Décor', href: '/collections/decor', handle: 'decor' },
  { label: 'Bed & Bath', href: '/collections/bed-bath', handle: 'bed-bath' },
  { label: 'Kitchen & Dining', href: '/collections/kitchen-dining', handle: 'kitchen-dining' },
  { label: 'Bar & Glassware', href: '/collections/bar-glassware', handle: 'bar-glassware' },
  { label: 'Flowers & Plants', href: '/collections/flowers-plants', handle: 'flowers-plants' },
  { label: 'Outdoor', href: '/collections/outdoor', handle: 'outdoor' },
  { label: 'Lighting', href: '/collections/lighting', handle: 'lighting' },
  { label: 'Accessories', href: '/collections/accessories', handle: 'accessories' },
]

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { openCart } = useCartStore()

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="sidebar-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 top-0 z-50 h-full w-[82%] max-w-sm flex flex-col bg-[var(--color-tt-bg)] overflow-y-auto"
          >
            {/* Dark Header */}
            <div className="flex items-center justify-between bg-[var(--color-tt-ink)] px-4 py-4">
              <Link href="/" onClick={onClose} aria-label="Treasure Trove home">
                <span className="bg-white/95 rounded px-2 py-0.5 inline-flex items-center">
                  <Image
                    src={logoImg}
                    alt="Treasure Trove"
                    height={28}
                    width={82}
                    className="h-7 w-auto object-contain"
                  />
                </span>
              </Link>
              <button
                data-testid="sidebar-close-button"
                onClick={onClose}
                aria-label="Close menu"
                className="text-[var(--color-tt-gold)] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sign In Button */}
            <div className="px-4 py-4 border-b border-[var(--color-tt-outline-variant)]">
              <Link
                href="/login"
                onClick={onClose}
                className="block w-full text-center bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-xs font-bold tracking-widest py-2.5 rounded hover:bg-[var(--color-tt-gold-hover)] transition-colors"
              >
                SIGN IN / REGISTER
              </Link>
            </div>

            {/* Shop By Category — prominent, at top */}
            <div className="px-4 py-5 border-b border-[var(--color-tt-outline-variant)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-[var(--color-tt-gold)] rounded-full" />
                <p className="text-[var(--color-tt-orange)] text-[11px] font-bold tracking-widest">
                  SHOP BY CATEGORY
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryItems.map(({ label, href, handle }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={onClose}
                      data-testid={`category-item-${handle}`}
                      className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors border ${
                        isActive
                          ? 'bg-[var(--color-tt-surface-container-high)] text-[var(--color-tt-orange)] border-[var(--color-tt-orange)]'
                          : 'text-[var(--color-tt-ink)] bg-[var(--color-tt-surface)] border-[var(--color-tt-outline-variant)] hover:bg-[var(--color-tt-surface-container)] hover:border-[var(--color-tt-outline)]'
                      }`}
                    >
                      <span className="text-[12px] font-semibold leading-tight">{label}</span>
                      <ChevronRight
                        size={14}
                        className={
                          isActive
                            ? 'text-[var(--color-tt-orange)]'
                            : 'text-[var(--color-tt-outline)]'
                        }
                      />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Menu Section */}
            <div className="px-4 py-4 flex-1">
              <p className="text-[var(--color-tt-ink-muted)] text-[10px] font-bold tracking-widest mb-3">
                MENU
              </p>
              <nav className="flex flex-col gap-1">
                {menuItems.map(({ label, href, Icon, drawer }) => {
                  const isActive =
                    !drawer &&
                    (pathname === href || (href === '/journal' && pathname.startsWith('/journal')))
                  const itemClass = `flex items-center gap-3 py-2.5 px-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-tt-surface-container-high)] text-[var(--color-tt-orange)]'
                      : 'text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)]'
                  }`
                  const iconEl = (
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-[var(--color-tt-orange)]'
                          : 'text-[var(--color-tt-ink-muted)]'
                      }
                    />
                  )

                  // Cart opens the drawer rather than navigating to a route.
                  if (drawer) {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          onClose()
                          openCart()
                        }}
                        className={`${itemClass} w-full text-left`}
                      >
                        {iconEl}
                        {label}
                      </button>
                    )
                  }

                  return (
                    <Link key={label} href={href} onClick={onClose} className={itemClass}>
                      {iconEl}
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-[var(--color-tt-outline-variant)]">
              <p className="text-[var(--color-tt-ink-muted)] text-[10px] tracking-widest text-center">
                © 2026 Treasure Trove · Made in India
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
