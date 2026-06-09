'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

export interface HeroSlide {
  badge: string
  title: string
  subtitle?: string
  cta: string
  href: string
  image: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    badge: 'FESTIVE EDIT',
    title: 'Up to 40% off across Decor & Lighting',
    subtitle: 'Elevate your home with our curated seasonal collection of handcrafted essentials.',
    cta: 'SHOP THE EDIT',
    href: '/collections',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGG8MbU3_0hsJsOkWqPUyMWW86O-VAqWzcRJmoavzh-fmu3Qcphjf5qF1iwf8K4TFZIs0EBKFqy721gUkQV8W3yVIIoyVZ76Jv4IKYmQnF2r-F-y78511img4_17qgSMAsLJL9mjcOXtoxf9vG6M5dou_RHl4ytIcB_Bti_CKeEiOlfGGnTCr-l9xYq1CgElr7beC3XPPhDtk_W0QIOHRY7zo-ZP9h3L27dtCltr3uN1U5btGQ3QkaC8kK5_ZWqWaZLkCR3F6TCNIC',
  },
  {
    badge: 'THE LIGHTING EDIT',
    title: 'Brass pendants, from ₹2,499',
    subtitle: 'Sculptural lighting that transforms any room — hand-finished, heirloom quality.',
    cta: 'EXPLORE LIGHTING',
    href: '/collections/lighting',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBng-6O8h79tXp6sCk6iLfPPtRBzOMnq22E6Lb7zdDwZjfMzkDhwCNztPgVDy4kQAhDYqK0thbBgRgbaRFtb48fvnLKEeNA_bcosdC7XomWBKGUED31Zmq0mj9a-RPM5I76k_krBj2LHr5LeWAOmL-wBskaKMmAKRar79mZfVsLmSPq8Kj-k8EsodoQ-pDDHryaJK3g0gUFReVVn7FNtzA6NHaBoNsoVRt5A9W0JEY9qGcDFnPEfcD8pQqYIjvbQG6S20haVB7TzbTO',
  },
  {
    badge: 'MONSOON READY',
    title: 'Outdoor Planters from ₹1,499',
    subtitle:
      'Weather-resistant terracotta and stoneware — made for the rains and the years ahead.',
    cta: 'SHOP OUTDOOR',
    href: '/collections/outdoor',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
  },
]

export function HeroCarousel({
  slides = HERO_SLIDES,
  intervalMs = 5500,
  size = 'desktop',
}: {
  slides?: HeroSlide[]
  intervalMs?: number
  size?: 'desktop' | 'mobile'
}) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isMobile = size === 'mobile'

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs)
    return () => clearInterval(id)
  }, [slides.length, intervalMs, paused])

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative w-full overflow-hidden ${isMobile ? 'rounded-lg h-[220px]' : 'h-full'}`}
    >
      {slides.map((slide, i) => (
        <Link
          key={slide.badge}
          href={slide.href}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? 'auto' : 'none' }}
          aria-hidden={i !== idx}
          tabIndex={i === idx ? 0 : -1}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes={isMobile ? '100vw' : '65vw'}
            className="object-cover"
            style={{
              transform: i === idx ? 'scale(1)' : 'scale(1.06)',
              transition: 'transform 7s linear',
            }}
          />
          <div
            className={`absolute inset-0 flex flex-col justify-center ${isMobile ? 'px-5 bg-black/45' : 'px-8 md:px-16 bg-black/35'}`}
          >
            <span
              className={`text-[var(--color-tt-gold)] font-bold tracking-widest-ui mb-2 md:mb-4 uppercase ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'}`}
              style={{
                transform: i === idx ? 'translateY(0)' : 'translateY(14px)',
                opacity: i === idx ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s',
              }}
            >
              {slide.badge}
            </span>
            <h2
              className={`font-bold text-white leading-tight mb-2 md:mb-4 max-w-lg ${isMobile ? 'text-xl' : 'text-3xl md:text-[48px]'}`}
              style={{
                transform: i === idx ? 'translateY(0)' : 'translateY(20px)',
                opacity: i === idx ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s',
              }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && !isMobile && (
              <p
                className="text-white/90 text-sm md:text-lg mb-8 max-w-md hidden md:block"
                style={{
                  transform: i === idx ? 'translateY(0)' : 'translateY(20px)',
                  opacity: i === idx ? 1 : 0,
                  transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1) 0.45s',
                }}
              >
                {slide.subtitle}
              </p>
            )}
            <span
              data-testid="hero-carousel-cta"
              className={`w-fit inline-flex items-center gap-2 font-bold tracking-widest-ui uppercase bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-ink)] hover:text-[var(--color-tt-gold)] hover:shadow-2xl hover:tracking-[0.25em] active:brightness-90 cursor-pointer ${isMobile ? 'text-[10px] px-5 py-2.5 rounded-sm' : 'text-xs md:text-sm px-10 py-4 rounded-[2px]'}`}
              style={{
                transform: i === idx ? 'translateY(0)' : 'translateY(24px)',
                opacity: i === idx ? 1 : 0,
                transition:
                  'opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s, background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, letter-spacing 0.3s ease',
              }}
            >
              {slide.cta}
              {isMobile && <ChevronRight size={14} />}
            </span>
          </div>
        </Link>
      ))}

      {/* Dot indicators */}
      <div
        className={`absolute flex items-center gap-2 ${isMobile ? 'bottom-3 left-1/2 -translate-x-1/2' : 'bottom-6 left-8 md:left-16'}`}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIdx(i)
            }}
            aria-label={`Go to slide ${i + 1}`}
            className="group p-1"
            suppressHydrationWarning
          >
            <span
              className={`block rounded-full transition-all duration-500 ${i === idx ? 'w-8 h-1.5 bg-[var(--color-tt-gold)]' : 'w-1.5 h-1.5 bg-white/50 group-hover:bg-white/80'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
