'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingBag, Search, ArrowLeft, X, Heart } from 'lucide-react'
import { MobileSidebar } from './MobileSidebar'
import { CyclingPlaceholder, useCyclingWord, OFFER_MESSAGES } from './CyclingPlaceholder'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import logoImg from '@/assets/logo.jpg'

export function MobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { items, toggleCart } = useCartStore()
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)
  const offerMessage = useCyclingWord(OFFER_MESSAGES, 3000)

  // Wishlist count comes from the client-side store (localStorage), so guard on
  // mount to avoid an SSR/CSR hydration mismatch — same pattern as the cart badge.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const wishlistCount = useWishlistStore((s) => s.items.length)

  // Logo always returns the user to the top of the homepage. When already on the
  // homepage, Next.js skips the same-route navigation and would otherwise leave
  // the scroll position untouched, so scroll to the top explicitly.
  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* ── Offer strip — dark with gold text ── */}
      <div className="bg-[var(--color-tt-ink)] text-[var(--color-tt-gold)] text-[10px] font-semibold tracking-widest text-center py-2 px-4">
        <span key={offerMessage} className="tt-cycle-word">
          {offerMessage}
        </span>
      </div>

      {/* ── Main light bar: Hamburger | Round Logo (centred) | Search + Cart ── */}
      <div className="relative flex items-center justify-between px-3 h-[56px] bg-white border-b border-[var(--color-tt-outline-variant)] shadow-sm">
        {/* Left — Hamburger */}
        <button
          data-testid="mobile-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all shrink-0"
        >
          <Menu size={22} />
        </button>

        {/* Centre — Round logo (absolutely centred) */}
        <Link
          href="/"
          aria-label="Treasure Trove home"
          onClick={handleLogoClick}
          className="absolute left-1/2 -translate-x-1/2 group"
        >
          <div className="w-[44px] h-[44px] rounded-full border-2 border-[var(--color-tt-gold)] bg-white overflow-hidden shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-[var(--color-tt-brown)] transition-all duration-300">
            <Image
              src={logoImg}
              alt="Treasure Trove"
              height={44}
              width={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </Link>

        {/* Right — Search + Wishlist + Cart */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setShowSearch(true)}
            aria-label="Search products"
            className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all"
          >
            <Search size={20} />
          </button>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all"
          >
            <Heart size={20} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute top-1.5 right-0.5 w-[18px] h-[18px] rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[9px] font-extrabold flex items-center justify-center leading-none">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleCart}
            aria-label="Open cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-surface-container)] transition-all"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-0.5 w-[18px] h-[18px] rounded-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[9px] font-extrabold flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Full-screen search overlay ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-white flex flex-col"
          >
            {/* Search input */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-tt-outline-variant)]"
            >
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                }}
                aria-label="Back"
                className="text-[var(--color-tt-ink)] shrink-0"
              >
                <ArrowLeft size={22} />
              </button>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 text-base text-[var(--color-tt-ink)] outline-none placeholder:text-[var(--color-tt-outline)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[var(--color-tt-outline)] shrink-0"
                >
                  <X size={18} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileSidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
