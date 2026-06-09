import type { Metadata } from 'next'
import { SearchResults } from '@/components/search/SearchResults'
import { searchProducts, getCollections } from '@/lib/medusa'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q = '' } = await searchParams
  return {
    title: q ? `Results for "${q}" — Treasure Trove` : 'Search — Treasure Trove',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams
  // Fetch results and the real collections in parallel. The collections power
  // the "browse" shortcuts shown when a search returns nothing, so those
  // buttons link to actual, populated collection pages.
  const [initialProducts, collections] = await Promise.all([searchProducts(q), getCollections()])
  const browseLinks = collections.slice(0, 6).map((c) => ({ label: c.title, href: c.href }))
  return (
    <div className="pt-[92px] lg:pt-[112px]">
      <SearchResults query={q} initialProducts={initialProducts} browseLinks={browseLinks} />
    </div>
  )
}
