'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, User, Heart, ShoppingBag } from 'lucide-react'
import { MobileHeader } from './MobileHeader'
import { SearchBar } from './SearchBar'
import { AutocompleteDropdown } from '@/components/search/AutocompleteDropdown'
import { CyclingPlaceholder, useCyclingWord, OFFER_MESSAGES } from './CyclingPlaceholder'
import { NavLinks } from './NavLinks'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useSearchStore } from '@/stores/search'
import logoImg from '@/assets/logo.jpg'

export function Navbar(): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastY = useRef(0)

  const pathname = usePathname()
  const { resetSearch } = useSearchStore()
  const { toggleCart } = useCartStore()
  const itemCount = useCartStore((s) => (mounted ? s.items.reduce((n, i) => n + i.quantity, 0) : 0))
  const wishlistCount = useWishlistStore((s) => (mounted ? s.items.length : 0))
  const offerMessage = useCyclingWord(OFFER_MESSAGES, 3000)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastY.current
      lastY.current = y
      setScrolled(y > 50)
      setHidden(goingDown && y > 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeSearch = () => {
    setShowSearch(false)
    resetSearch()
  }

  // Logo always returns the user to the top of the homepage. When already on the
  // homepage, Next.js skips the same-route navigation and would otherwise leave
  // the scroll position untouched, so scroll to the top explicitly.
  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Mobile — handled by MobileHeader */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 w-full" data-testid="mobile-header">
        <MobileHeader />
      </div>

      {/* ── Desktop header ── */}
      <header
        data-testid="navbar"
        className={`hidden lg:flex flex-col fixed top-0 left-0 right-0 z-30 w-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Offer strip — collapses on first scroll */}
        <div
          className={`bg-[var(--color-tt-ink)] text-[var(--color-tt-gold)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            scrolled ? 'max-h-0' : 'max-h-[38px]'
          }`}
        >
          <p className="text-[12px] font-semibold tracking-[0.22em] text-center py-2.5">
            <span key={offerMessage} className="tt-cycle-word">
              {offerMessage}
            </span>
          </p>
        </div>

        {/* ── Main light navigation bar ── */}
        <div
          className={`bg-white border-b border-[var(--color-tt-outline-variant)] transition-shadow duration-300 ${
            scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'shadow-none'
          }`}
        >
          <div className="max-w-screen-2xl mx-auto px-8 h-[68px] flex items-center gap-6">
            {/* ── Left — Round logo ── */}
            <Link
              href="/"
              aria-label="Treasure Trove home"
              onClick={handleLogoClick}
              className="shrink-0 group"
            >
              <div className="w-[52px] h-[52px] rounded-full border-2 border-[var(--color-tt-gold)] bg-white overflow-hidden shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-[var(--color-tt-brown)] transition-all duration-300">
                <Image
                  src={logoImg}
                  alt="Treasure Trove"
                  height={40}
                  width={40}
                  className="w-full h-full object-contain p-0"
                  priority
                />
              </div>
            </Link>

            {/* ── Centre — Category nav links ── */}
            <NavLinks />

            {/* ── Right — Action icons ── */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Search */}
              <button
                data-testid="navbar-search-trigger"
                onClick={() => setShowSearch(true)}
                aria-label="Search products"
                className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all duration-200"
                suppressHydrationWarning
              >
                <Search size={19} />
              </button>

              {/* Account */}
              <Link
                href="/account"
                aria-label="My account"
                className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all duration-200"
              >
                <User size={19} />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all duration-200"
              >
                <Heart size={19} />
                {mounted && wishlistCount > 0 && (
                  <span
                    data-testid="navbar-wishlist-count"
                    className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-[var(--color-tt-danger)] text-white text-[9px] font-extrabold flex items-center justify-center leading-none"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart — gold accent, more prominent */}
              <button
                data-testid="desktop-cart-trigger"
                onClick={toggleCart}
                aria-label="Open shopping cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all duration-200"
                suppressHydrationWarning
              >
                <ShoppingBag size={19} />
                {mounted && itemCount > 0 && (
                  <span
                    data-testid="desktop-cart-count"
                    className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[9px] font-extrabold flex items-center justify-center leading-none"
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search overlay ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-[var(--color-tt-ink)]/60 backdrop-blur-sm z-[200] hidden lg:flex items-start justify-center pt-28"
            onClick={closeSearch}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-[90%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchBar onClose={closeSearch} autoFocus />
              <AutocompleteDropdown onClose={closeSearch} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
