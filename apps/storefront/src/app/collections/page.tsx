import { Suspense } from 'react'
import { Breadcrumb } from '@/components/products/Breadcrumb'
import { CategoryHero } from '@/components/products/CategoryHero'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { SortToolbar } from '@/components/products/SortToolbar'
import { ProductCard } from '@/components/products/ProductCard'
import { Pagination } from '@/components/products/Pagination'
import { getProducts, getProductFacets } from '@/lib/medusa'

export const revalidate = 3600

export const metadata = {
  title: 'Collections — Treasure Trove',
  description: 'Explore all Treasure Trove Atelier collections.',
}

const LIMIT = 12

interface PageProps {
  searchParams: Promise<{
    page?: string
    sort?: string
    material?: string
    maxPrice?: string
    inStock?: string
  }>
}

export default async function CollectionsIndexPage({ searchParams }: PageProps) {
  const { page, sort, material, maxPrice, inStock } = await searchParams

  const currentPage = Math.max(1, Number(page ?? 1))
  const offset = (currentPage - 1) * LIMIT

  const [{ products, count }, facets] = await Promise.all([
    getProducts({
      limit: LIMIT,
      offset,
      order: sort ?? '',
      material,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === '1',
    }),
    getProductFacets(),
  ])

  const totalPages = Math.ceil(count / LIMIT)

  return (
    <div>
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />
      </div>

      <CategoryHero
        title="Collections"
        subtitle="Explore every piece in the Treasure Trove Atelier"
      />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="lg:flex lg:gap-12 lg:items-start">
          <Suspense>
            <FilterSidebar totalCount={count} maxPriceCeiling={facets.maxPriceCeiling} />
          </Suspense>

          <div className="flex-1 min-w-0">
            <Suspense>
              <SortToolbar total={count} offset={offset} limit={LIMIT} />
            </Suspense>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-[var(--color-tt-outline)]">
                <p className="text-sm tracking-widest uppercase font-bold">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
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
