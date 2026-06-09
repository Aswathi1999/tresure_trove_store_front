import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { getMaterialStories } from '@/lib/payload'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Our Materials — Treasure Trove',
  description:
    'Discover the five sustainably sourced wood types at the heart of every Treasure Trove piece — Teak, Walnut, Oak, Mango, and Rosewood.',
}

export default async function MaterialsPage() {
  const materials = await getMaterialStories()

  return (
    <div data-testid="materials-listing-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Materials' }]} />
      </div>

      <div
        className="flex flex-col items-center justify-center h-[150px] lg:h-[200px] px-4 text-center"
        style={{ backgroundColor: 'var(--color-tt-ink)' }}
      >
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--color-tt-gold)] mb-3">
          Our Materials
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Made to Last</h1>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12">
        <div
          data-testid="materials-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </main>
    </div>
  )
}
