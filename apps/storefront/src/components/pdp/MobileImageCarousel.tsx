'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface ProductImage {
  id: string
  url: string
  alt: string
}

interface MobileImageCarouselProps {
  images: ProductImage[]
  title: string
  /** The image currently considered active (drives the dots and the scroll position). */
  activeIndex: number
  /** Called when the shopper taps a dot or swipes to a new slide. */
  onSelect: (idx: number) => void
  /** A variant image that isn't in `images` — overlays the track, mirroring desktop. */
  overrideOverlayUrl: string | null
}

// Mobile-only hero gallery: a native CSS scroll-snap track so the shopper can
// swipe between product images with momentum. Desktop keeps the thumbnail strip
// + zoom in ImageGallery; this component only renders below `lg`.
export function MobileImageCarousel({
  images,
  title,
  activeIndex,
  onSelect,
  overrideOverlayUrl,
}: MobileImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  // Mirror activeIndex in a ref so the scroll handler reads the latest value
  // without being re-created (and re-bound) on every render.
  const activeRef = useRef(activeIndex)
  activeRef.current = activeIndex
  const rafRef = useRef<number | null>(null)

  // When activeIndex changes from outside (dot tap or a variant switch), scroll
  // the track to that slide. Skips when the track is already there — which is the
  // case right after a user swipe — so it never fights an in-progress gesture.
  useEffect(() => {
    const el = trackRef.current
    if (!el || typeof el.scrollTo !== 'function') return
    const width = el.clientWidth
    if (!width) return
    if (Math.round(el.scrollLeft / width) === activeIndex) return
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: activeIndex * width, behavior: reduce ? 'auto' : 'smooth' })
  }, [activeIndex])

  // Detect which slide the user has swiped to (throttled to one rAF per frame)
  // and report it up so the dots and the desktop view stay in sync.
  function handleScroll() {
    const el = trackRef.current
    if (!el || rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const width = el.clientWidth
      if (!width) return
      const idx = Math.round(el.scrollLeft / width)
      if (idx !== activeRef.current && idx >= 0 && idx < images.length) onSelect(idx)
    })
  }

  return (
    <div className="lg:hidden relative flex-1 aspect-[4/5] max-h-[70vh] overflow-hidden rounded-sm">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product images"
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, idx) => (
          <div
            key={img.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Image ${idx + 1} of ${images.length}`}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <Image
              src={img.url}
              alt={img.alt || title}
              fill
              sizes="100vw"
              className="object-contain"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {/* A variant image not present in the gallery overlays the track, matching
          the desktop out-of-gallery override. Tapping a dot clears it (the parent
          marks the choice as a manual pick). */}
      {overrideOverlayUrl && (
        <div className="absolute inset-0 bg-[var(--color-tt-surface)]">
          <Image
            src={overrideOverlayUrl}
            alt={title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      )}

      {/* Dot indicators — reflect the visible slide; tapping scrolls the track. */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            data-testid={`dot-${idx}`}
            aria-label={`View image ${idx + 1}`}
            suppressHydrationWarning
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === idx ? 'w-4 bg-[var(--color-tt-gold)]' : 'w-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
