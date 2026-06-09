'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type OfferCard = {
  badge: string
  title: string
  link: string
  href: string
  image: string
}

export function OfferCarousel({
  cards,
  intervalMs = 4500,
}: {
  cards: OfferCard[]
  intervalMs?: number
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  // Auto-advance by scrolling one card width
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const el = scrollerRef.current
      if (!el) return
      const cardWidth =
        el.firstElementChild instanceof HTMLElement
          ? el.firstElementChild.offsetWidth + 16 /* gap */
          : 320
      const maxScroll = el.scrollWidth - el.clientWidth
      const next = el.scrollLeft + cardWidth >= maxScroll - 4 ? 0 : el.scrollLeft + cardWidth
      el.scrollTo({ left: next, behavior: 'smooth' })
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, paused])

  // Track active dot based on scroll position
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const cardWidth =
        el.firstElementChild instanceof HTMLElement ? el.firstElementChild.offsetWidth + 16 : 320
      setActiveIdx(Math.round(el.scrollLeft / cardWidth))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const cardWidth =
      el.firstElementChild instanceof HTMLElement ? el.firstElementChild.offsetWidth + 16 : 320
    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
    >
      <div
        ref={scrollerRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth px-4 md:px-8"
      >
        {cards.map((offer, i) => (
          <Link
            href={offer.href}
            key={offer.badge + i}
            className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-[calc((100%-48px)/3)] h-[220px] md:h-[420px] relative rounded-lg overflow-hidden bg-[var(--color-tt-surface-container)] tt-lift group"
          >
            <Image
              src={offer.image}
              alt={offer.title}
              fill
              sizes="320px"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/35 p-6 md:p-10 flex flex-col justify-end transition-colors group-hover:bg-black/50">
              <span className="text-white text-[10px] md:text-xs font-bold tracking-widest-ui uppercase mb-1 md:mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                {offer.badge}
              </span>
              <h4 className="text-white text-lg md:text-3xl font-bold mb-3 md:mb-6 drop-shadow-md transition-transform duration-500 group-hover:-translate-y-1">
                {offer.title}
              </h4>
              <span className="text-white font-bold text-[10px] md:text-xs tracking-widest-ui uppercase inline-flex items-center gap-1 underline decoration-[#D5C68F] underline-offset-8 group-hover:text-[#D5C68F] group-hover:underline-offset-4 transition-all">
                {offer.link}
                <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Prev/Next buttons — desktop only */}
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Previous offer"
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110"
        suppressHydrationWarning
      >
        <ChevronLeft size={20} className="text-[#1F1B16]" />
      </button>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Next offer"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110"
        suppressHydrationWarning
      >
        <ChevronRight size={20} className="text-[#1F1B16]" />
      </button>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = scrollerRef.current
              if (!el) return
              const cardWidth =
                el.firstElementChild instanceof HTMLElement
                  ? el.firstElementChild.offsetWidth + 16
                  : 320
              el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
            }}
            aria-label={`Go to offer ${i + 1}`}
            className="p-1"
            suppressHydrationWarning
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                i === activeIdx
                  ? 'w-6 h-1.5 bg-[#1F1B16]'
                  : 'w-1.5 h-1.5 bg-[var(--color-tt-outline)]/40 hover:bg-[var(--color-tt-outline)]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
