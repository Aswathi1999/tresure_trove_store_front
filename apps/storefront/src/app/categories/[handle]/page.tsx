import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/products/Breadcrumb'
import { CollectionHero } from '@/components/collections/CollectionHero'
import { CollectionFilter } from '@/components/collections/CollectionFilter'
import { CollectionProductGrid } from '@/components/collections/CollectionProductGrid'
import type { MockProduct } from '@/lib/collections.mock'
import {
  getCategoryByHandle,
  getProductsByCategory,
  getProductFacets,
  type HomepageProduct,
} from '@/lib/medusa'

export const revalidate = 3600

function toMockProduct(p: HomepageProduct): MockProduct {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    priceValue: parseInt(p.price.replace(/[^0-9]/g, ''), 10) || 0,
    imageUrl: p.imageUrl,
    material: '',
    badge: p.badge,
    badgeVariant: p.badgeVariant,
    href: p.href,
    // Preserve the real stock status from Medusa (untracked inventory → in stock)
    // so the "Out of Stock" overlay reflects actual availability.
    inStock: p.inStock ?? true,
    originalPrice: p.originalPrice,
    tags: p.tags,
  }
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)
  if (!category) return { title: 'Category Not Found — Treasure Trove' }
  return {
    title: `${category.title} — Treasure Trove`,
    description: `Shop the ${category.title} category at Treasure Trove Atelier.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { handle } = await params

  const category = await getCategoryByHandle(handle)
  if (!category) notFound()

  const [{ products: apiProducts }, facets] = await Promise.all([
    getProductsByCategory(category.id, { limit: 50 }),
    getProductFacets({ categoryId: category.id }),
  ])
  const products: MockProduct[] = apiProducts.map(toMockProduct)

  const title = category.title
  const adminImage = category.metadata?.['image_url']
  const heroImageUrl =
    typeof adminImage === 'string' && adminImage.length > 0 ? adminImage : undefined

  return (
    <div data-testid="category-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/categories' },
            { label: title },
          ]}
        />
      </div>

      <CollectionHero title={title} subtitle="" imageUrl={heroImageUrl} />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="lg:flex lg:gap-12 lg:items-start">
          <Suspense fallback={null}>
            <CollectionFilter products={products} maxPriceCeiling={facets.maxPriceCeiling} />
          </Suspense>

          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <p
                data-testid="category-product-count"
                className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]"
              >
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} in this category
              </p>
            </div>

            <Suspense fallback={null}>
              <CollectionProductGrid
                products={products}
                collectionHandle={handle}
                maxPriceCeiling={facets.maxPriceCeiling}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
