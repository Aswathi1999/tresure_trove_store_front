'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
const BADGE_CLASSES: Record<string, string> = {
  orange: 'bg-[var(--color-tt-orange)] text-white',
  brown: 'bg-[var(--color-tt-brown)] text-white',
  gold: 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]',
}

interface PdpRelatedProduct {
  id: string
  href: string
  title: string
  price: string
  imageUrl: string
  badge?: string
  badgeVariant?: 'orange' | 'brown' | 'gold'
}

interface RelatedProductsProps {
  products: PdpRelatedProduct[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section
      className="py-10 lg:py-12 bg-[var(--color-tt-surface-container-high)]"
      data-testid="related-products"
    >
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-5 lg:mb-6">
          <h3 className="text-base lg:text-lg font-bold tracking-[0.2em] uppercase text-[var(--color-tt-ink)]">
            You May Also Like
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 border border-[var(--color-tt-outline-variant)] flex items-center justify-center hover:bg-[var(--color-tt-surface-container)] transition-colors duration-150"
              data-testid="carousel-prev"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 border border-[var(--color-tt-outline-variant)] flex items-center justify-center hover:bg-[var(--color-tt-surface-container)] transition-colors duration-150"
              data-testid="carousel-next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
          data-testid="carousel-track"
        >
          {products.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 w-44 lg:w-52"
              data-testid={`related-product-${product.id}`}
            >
              <Link href={product.href} className="group block">
                <div className="relative aspect-[3/4] bg-[var(--color-tt-surface-container)] overflow-hidden rounded-sm mb-3">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 1024px) 224px, 256px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {product.badge && (
                    <span
                      className={`absolute top-3 left-3 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 ${BADGE_CLASSES[product.badgeVariant ?? 'gold']}`}
                    >
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-sm text-[var(--color-tt-ink)] text-xs font-bold tracking-widest uppercase py-3 text-center">
                      Quick View
                    </div>
                  </div>
                </div>
                <h4 className="text-[13px] font-semibold text-[var(--color-tt-ink)] mb-1 leading-snug">
                  {product.title}
                </h4>
                <p className="text-[12px] text-[var(--color-tt-outline)]">{product.price}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
