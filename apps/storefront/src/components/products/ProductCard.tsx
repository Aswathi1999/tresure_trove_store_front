import Image from 'next/image'
import Link from 'next/link'
import type { HomepageProduct } from '@/lib/medusa'
import { WishlistButton } from './WishlistButton'

const badgeClasses: Record<string, string> = {
  orange: 'bg-[var(--color-tt-orange)] text-white',
  brown: 'bg-[var(--color-tt-brown)] text-white',
  gold: 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]',
}

interface ProductCardProps {
  product: HomepageProduct
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  // Build the wishlist item from the card's already-loaded data so we don't
  // have to re-fetch product details on toggle.
  const wishlistItem = {
    id: product.id,
    title: product.title,
    handle: product.href.replace(/^\/products\//, ''),
    price: parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0,
    imageUrl: product.imageUrl,
    ...(product.originalPrice
      ? { originalPrice: parseInt(product.originalPrice.replace(/[^0-9]/g, ''), 10) || 0 }
      : {}),
  }

  return (
    <Link href={product.href} className="group block" data-testid={`product-card-${product.id}`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-5 bg-[var(--color-tt-surface-container-high)]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-tt-outline)] text-[10px] tracking-widest uppercase">
            No Image
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 ${badgeClasses[product.badgeVariant ?? 'gold']}`}
          >
            {product.badge}
          </span>
        )}

        <WishlistButton
          item={wishlistItem}
          size={16}
          stopPropagation
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full"
        />

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-sm text-[var(--color-tt-ink)] text-xs font-bold tracking-widest uppercase py-3 text-center">
            Quick View
          </div>
        </div>
      </div>

      <h4 className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-1 leading-snug">
        {product.title}
      </h4>
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-medium tracking-wider text-[var(--color-tt-outline)]">
          {product.price}
        </p>
        {product.originalPrice && (
          <p className="text-[10px] text-[var(--color-tt-outline)] line-through">
            {product.originalPrice}
          </p>
        )}
      </div>
    </Link>
  )
}
