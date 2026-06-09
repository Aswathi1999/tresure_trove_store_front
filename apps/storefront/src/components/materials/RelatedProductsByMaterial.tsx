import Image from 'next/image'
import Link from 'next/link'
import type { HomepageProduct } from '@/lib/medusa'

interface RelatedProductsByMaterialProps {
  products: HomepageProduct[]
  materialName: string
}

export function RelatedProductsByMaterial({
  products,
  materialName,
}: RelatedProductsByMaterialProps) {
  if (products.length === 0) return null

  return (
    <section
      data-testid="related-products-by-material"
      className="py-16 px-4 lg:px-8"
      style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
    >
      <div className="max-w-[1280px] mx-auto">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--color-tt-gold)] mb-3 text-center">
          Made with {materialName}
        </p>
        <h2 className="text-2xl font-bold text-[var(--color-tt-ink)] mb-10 text-center">
          Featured Pieces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <article
              key={product.id}
              data-testid={`related-product-card-${product.id}`}
              className="group bg-[var(--color-tt-surface)] overflow-hidden"
            >
              <Link
                href={product.href}
                className="block overflow-hidden relative aspect-square"
                data-testid={`related-product-image-link-${product.id}`}
              >
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-4">
                <h3
                  data-testid={`related-product-name-${product.id}`}
                  className="text-sm font-semibold text-[var(--color-tt-ink)] mb-1"
                >
                  <Link
                    href={product.href}
                    className="hover:text-[var(--color-tt-orange)] transition-colors duration-200"
                  >
                    {product.title}
                  </Link>
                </h3>
                <p
                  data-testid={`related-product-price-${product.id}`}
                  className="text-[13px] text-[var(--color-tt-brown)] font-medium"
                >
                  {product.price}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
