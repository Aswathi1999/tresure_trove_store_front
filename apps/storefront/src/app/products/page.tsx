import { Suspense } from 'react'
import { Breadcrumb } from '@/components/products/Breadcrumb'
import { CategoryHero } from '@/components/products/CategoryHero'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { SortToolbar } from '@/components/products/SortToolbar'
import { ProductCard } from '@/components/products/ProductCard'
import { Pagination } from '@/components/products/Pagination'
import { getProducts, getProductFacets, getCollections } from '@/lib/medusa'

export const revalidate = 300

export const metadata = {
  title: 'All Products — Treasure Trove',
  description: 'Browse the full Treasure Trove Atelier collection.',
}

const LIMIT = 12

interface PageProps {
  searchParams: Promise<{
    page?: string
    sort?: string
    material?: string
    collection?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page, sort, material, collection, minPrice, maxPrice, inStock } = await searchParams

  const currentPage = Math.max(1, Number(page ?? 1))
  const offset = (currentPage - 1) * LIMIT

  const [{ products, count }, facets, collections] = await Promise.all([
    getProducts({
      limit: LIMIT,
      offset,
      order: sort ?? '',
      material,
      collection,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === '1',
    }),
    getProductFacets(),
    getCollections(),
  ])

  const totalPages = Math.ceil(count / LIMIT)

  return (
    <div>
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'All Products' }]} />
      </div>

      <CategoryHero title="All Products" subtitle="The complete Treasure Trove collection" />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="lg:flex lg:gap-12 lg:items-start">
          <Suspense>
            <FilterSidebar
              totalCount={count}
              collections={collections.map((c) => ({ handle: c.handle, title: c.title }))}
              maxPriceCeiling={facets.maxPriceCeiling}
            />
          </Suspense>

          <div className="flex-1 min-w-0">
            <Suspense>
              <SortToolbar total={count} offset={offset} limit={LIMIT} />
            </Suspense>

            {products.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-32 text-[var(--color-tt-outline)]"
                data-testid="no-products-message"
              >
                <p className="text-sm tracking-widest uppercase font-bold">No products found</p>
                <p className="text-xs mt-2 tracking-wider">Try adjusting your filters</p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
                data-testid="products-grid"
              >
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
          </div>
        </div>
      </div>
    </div>
  )
}
