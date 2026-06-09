'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { usePdpImage } from './PdpImageContext'
import { MobileImageCarousel } from './MobileImageCarousel'

interface ProductImage {
  id: string
  url: string
  alt: string
}

interface ImageGalleryProps {
  images: ProductImage[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  // A manual thumbnail click takes display precedence over the variant-driven
  // override until the next variant change. We can't clear the override from
  // here (the variant selector would just re-apply it on the next render and
  // snap the image back), so we shadow it locally instead.
  const [userPicked, setUserPicked] = useState(false)
  const pdpImage = usePdpImage()
  const overrideUrl = pdpImage?.overrideUrl ?? null
  const lastOverrideRef = useRef(overrideUrl)

  // Only react when the override URL actually changes — i.e. a real variant
  // switch — never on a manual thumbnail click. A variant change wins: it
  // clears the manual pick and jumps to the matching thumbnail when present.
  useEffect(() => {
    if (overrideUrl === lastOverrideRef.current) return
    lastOverrideRef.current = overrideUrl
    setUserPicked(false)
    if (!overrideUrl) return
    const matchedIdx = images.findIndex((img) => img.url === overrideUrl)
    if (matchedIdx < 0) return
    setActiveIndex((prev) => {
      if (matchedIdx !== prev) setDirection(matchedIdx > prev ? 1 : -1)
      return matchedIdx
    })
  }, [overrideUrl, images])

  function selectImage(idx: number) {
    setDirection(idx > activeIndex ? 1 : -1)
    setActiveIndex(idx)
    setUserPicked(true)
  }

  // Cursor-following zoom for the main image. `x`/`y` are percentages so the
  // transform-origin tracks the pointer; `active` toggles the scale.
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 })

  function handleZoomMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom((z) => ({ ...z, x, y }))
  }

  const galleryImage = images[activeIndex]
  // If the variant has a dedicated image not present in product.images, show
  // that URL directly — unless the shopper has manually picked a thumbnail,
  // in which case their choice wins.
  const overrideInGallery = overrideUrl ? images.some((img) => img.url === overrideUrl) : true
  const showingOutOfGalleryOverride = !userPicked && Boolean(overrideUrl) && !overrideInGallery
  const displayImage = showingOutOfGalleryOverride
    ? { id: `override-${overrideUrl}`, url: overrideUrl as string, alt: title }
    : galleryImage

  return (
    <div className="flex gap-4 lg:gap-6" data-testid="image-gallery">
      {/* Thumbnail strip — capped to the main image height so extra images
          scroll inside the column instead of stretching the page taller. */}
      <div className="hidden lg:flex flex-col gap-3 w-[88px] shrink-0 max-h-[600px] overflow-y-auto pr-1 tt-thumb-scroll">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => selectImage(idx)}
            data-testid={`thumbnail-${idx}`}
            suppressHydrationWarning
            className={`relative aspect-[4/5] shrink-0 overflow-hidden rounded-sm transition-all duration-200
              ${
                activeIndex === idx && !showingOutOfGalleryOverride
                  ? 'ring-1 ring-[var(--color-tt-gold)] opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
          >
            <Image src={img.url} alt={img.alt} fill sizes="88px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image (desktop) — vertical-thumbnail + cursor-zoom view. Hidden on
          mobile, where the swipe carousel below takes over. */}
      <div
        className="hidden lg:block flex-1 relative aspect-[4/5] lg:max-h-[600px] rounded-sm overflow-hidden group cursor-zoom-in"
        data-testid="main-image"
        onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
        onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
        onMouseMove={handleZoomMove}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={displayImage?.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {displayImage && (
              <Image
                src={displayImage.url}
                alt={displayImage.alt || title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-contain transition-transform duration-200 ease-out"
                style={{
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  transform: zoom.active ? 'scale(2.2)' : 'scale(1)',
                }}
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Hover to zoom
        </div>
      </div>

      {/* Mobile swipe carousel — replaces the desktop main image below lg. Owns
          the dot indicators and keeps activeIndex in sync with the scroll position
          (and scrolls itself when a variant switch moves activeIndex). */}
      <MobileImageCarousel
        images={images}
        title={title}
        activeIndex={activeIndex}
        onSelect={selectImage}
        overrideOverlayUrl={showingOutOfGalleryOverride ? (overrideUrl as string) : null}
      />
    </div>
  )
}
