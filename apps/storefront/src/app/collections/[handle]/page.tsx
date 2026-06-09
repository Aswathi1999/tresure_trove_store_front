import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/products/Breadcrumb'
import { CollectionHero } from '@/components/collections/CollectionHero'
import { CollectionFilter } from '@/components/collections/CollectionFilter'
import { CollectionProductGrid } from '@/components/collections/CollectionProductGrid'
import {
  getAllCollectionHandles,
  getCollectionMock,
  type MockProduct,
} from '@/lib/collections.mock'
import {
  getCollectionByHandle,
  getProductsByCollection,
  getProductsByTag,
  getNewArrivalsCollection,
  getProductFacets,
  type CollectionProductsResult,
  type HomepageProduct,
  type ProductFacets,
} from '@/lib/medusa'

export const revalidate = 3600

// Virtual collections are not Medusa collections — they're tag/order-driven
// views that the homepage and footer link to. Resolve them before the Medusa
// collection lookup so /collections/bestsellers and /collections/new-arrivals
// render instead of 404ing.
interface VirtualCollection {
  title: string
  subtitle: string
  fetch: () => Promise<CollectionProductsResult>
}

const VIRTUAL_COLLECTIONS: Record<string, VirtualCollection> = {
  bestsellers: {
    title: 'Bestsellers',
    subtitle: 'Our most-loved pieces, chosen by customers like you',
    fetch: () => getProductsByTag('bestseller', { limit: 50 }),
  },
  'new-arrivals': {
    title: 'New Arrivals',
    subtitle: 'Fresh pieces, just landed in our studio',
    fetch: () => getNewArrivalsCollection({ limit: 50 }),
  },
  sale: {
    title: 'Sale & Offers',
    subtitle: 'Limited-time prices on a curated selection of pieces',
    fetch: () => getProductsByTag('sale', { limit: 50 }),
  },
}

// Map a Medusa HomepageProduct to the MockProduct shape the components expect.
// priceValue is parsed from the formatted price string (e.g. "Rs. 48,999" → 48999).
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

export function generateStaticParams() {
  // Only pre-render the static (mock-backed) collection handles at build time.
  // Virtual collections (bestsellers/new-arrivals/sale) run heavy live Medusa
  // queries that can exceed Next's 60s per-page SSG budget and fail the build;
  // they're intentionally left to on-demand ISR (dynamicParams defaults to true)
  // so they render at request time and cache via `revalidate`.
  return getAllCollectionHandles().map((handle) => ({ handle }))
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const virtual = VIRTUAL_COLLECTIONS[handle]
  if (virtual) {
    return {
      title: `${virtual.title} — Treasure Trove`,
      description: `Shop ${virtual.title.toLowerCase()} at Treasure Trove Atelier. ${virtual.subtitle}`,
    }
  }
  const collection = getCollectionMock(handle)
  if (!collection) return { title: 'Collection Not Found — Treasure Trove' }
  return {
    title: `${collection.title} — Treasure Trove`,
    description: `Shop the ${collection.title} collection at Treasure Trove Atelier. ${collection.subtitle}`,
  }
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params

  const virtual = VIRTUAL_COLLECTIONS[handle]

  let products: MockProduct[]
  let facets: ProductFacets | null = null
  let title: string
  let subtitle: string
  let heroImageUrl: string | undefined

  if (virtual) {
    const { products: apiProducts } = await virtual.fetch()
    products = apiProducts.map(toMockProduct)
    title = virtual.title
    subtitle = virtual.subtitle
  } else {
    // Prefer live Medusa data; fall back to mock so the page works before collections are seeded.
    const [medusaCollection, mockCollection] = await Promise.all([
      getCollectionByHandle(handle),
      Promise.resolve(getCollectionMock(handle)),
    ])

    if (!medusaCollection && !mockCollection) notFound()

    if (medusaCollection) {
      const [{ products: apiProducts }, computedFacets] = await Promise.all([
        getProductsByCollection(medusaCollection.id, { limit: 50 }),
        getProductFacets({ collectionId: medusaCollection.id }),
      ])
      products =
        apiProducts.length > 0 ? apiProducts.map(toMockProduct) : (mockCollection?.products ?? [])
      facets = computedFacets
    } else {
      products = mockCollection?.products ?? []
    }

    title = medusaCollection?.title ?? mockCollection?.title ?? handle
    subtitle =
      (medusaCollection?.metadata?.subtitle as string | undefined) ?? mockCollection?.subtitle ?? ''
    const adminImage = medusaCollection?.metadata?.['image_url']
    heroImageUrl =
      typeof adminImage === 'string' && adminImage.length > 0
        ? adminImage
        : (mockCollection?.heroImageUrl ?? undefined)
  }

  return (
    <div data-testid="collection-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: title },
          ]}
        />
      </div>

      <CollectionHero title={title} subtitle={subtitle} imageUrl={heroImageUrl} />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="lg:flex lg:gap-12 lg:items-start">
          <Suspense fallback={null}>
            <CollectionFilter products={products} maxPriceCeiling={facets?.maxPriceCeiling} />
          </Suspense>

          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <p
                data-testid="collection-product-count"
                className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]"
              >
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} in this collection
              </p>
            </div>

            <Suspense fallback={null}>
              <CollectionProductGrid
                products={products}
                collectionHandle={handle}
                maxPriceCeiling={facets?.maxPriceCeiling}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
