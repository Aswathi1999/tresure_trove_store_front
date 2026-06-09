'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Category {
  title: string
  handle: string
  href: string
}

const FALLBACK_LINKS: Category[] = [
  { title: 'Decor', handle: 'decor', href: '/categories/decor' },
  { title: 'Bed & Bath', handle: 'bed-bath', href: '/categories/bed-bath' },
  { title: 'Kitchen', handle: 'kitchen-dining', href: '/categories/kitchen-dining' },
  { title: 'Bar & Glass', handle: 'bar-glassware', href: '/categories/bar-glassware' },
  { title: 'Flowers', handle: 'flowers-plants', href: '/categories/flowers-plants' },
  { title: 'Outdoor', handle: 'outdoor', href: '/categories/outdoor' },
  { title: 'Lighting', handle: 'lighting', href: '/categories/lighting' },
  { title: 'Accessories', handle: 'accessories', href: '/categories/accessories' },
]

export function NavLinks(): React.JSX.Element {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_LINKS)
  const [isLoading, setIsLoading] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  // Recompute whether the rail can scroll further in either direction.
  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setIsOverflowing(maxScroll > 1)
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft < maxScroll - 1)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    window.addEventListener('resize', updateScrollState)
    return () => window.removeEventListener('resize', updateScrollState)
  }, [categories])

  // Auto-scroll while the pointer hovers an edge zone. `direction` is -1 (left)
  // or 1 (right); the rail glides until the pointer leaves or it hits an end.
  const startEdgeScroll = (direction: number) => {
    const el = scrollRef.current
    if (!el) return
    const step = () => {
      el.scrollLeft += direction * 6
      updateScrollState()
      rafRef.current = requestAnimationFrame(step)
    }
    stopEdgeScroll()
    rafRef.current = requestAnimationFrame(step)
  }

  const stopEdgeScroll = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  useEffect(() => stopEdgeScroll, [])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
        const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

        const res = await fetch(`${baseUrl}/store/product-categories`, {
          headers: { 'x-publishable-api-key': pubKey },
        })

        if (!res.ok) throw new Error('Failed to fetch categories')

        const data = (await res.json()) as {
          product_categories: Array<{ id: string; name: string; handle: string }>
        }

        if (data.product_categories && data.product_categories.length > 0) {
          const mapped = data.product_categories.map((c) => ({
            title: c.name,
            handle: c.handle,
            href: `/categories/${c.handle}`,
          }))
          setCategories(mapped)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching categories:', error)
        setCategories(FALLBACK_LINKS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="relative flex-1 min-w-0">
      {/* Left edge — fade hint + auto-scroll hover zone */}
      <div
        onMouseEnter={() => startEdgeScroll(-1)}
        onMouseLeave={stopEdgeScroll}
        className={`absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <nav
        ref={scrollRef}
        onScroll={updateScrollState}
        className={`flex items-center gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isOverflowing ? 'justify-start' : 'justify-center'
        }`}
      >
        {categories.map(({ title, handle, href }) => (
          <Link
            key={handle}
            href={href}
            className="relative px-3 py-2 text-sm font-bold tracking-[0.12em] text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors duration-200 whitespace-nowrap group"
          >
            {title}
            <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-[var(--color-tt-gold)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left rounded-full" />
          </Link>
        ))}
      </nav>

      {/* Right edge — fade hint + auto-scroll hover zone */}
      <div
        onMouseEnter={() => startEdgeScroll(1)}
        onMouseLeave={stopEdgeScroll}
        className={`absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
    </div>
  )
}
