import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MaterialDetail } from '@/components/materials/MaterialDetail'
import { RelatedProductsByMaterial } from '@/components/materials/RelatedProductsByMaterial'
import { getMaterialStoryBySlug, getAllMaterialStorySlugs } from '@/lib/payload'
import { getRelatedProductsByWoodType } from '@/lib/medusa'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllMaterialStorySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const material = await getMaterialStoryBySlug(slug)
  if (!material) return { title: 'Material Not Found — Treasure Trove' }
  return {
    title: `${material.title} — Our Materials — Treasure Trove`,
    description: material.shortDescription,
    openGraph: material.featuredImage.url
      ? { images: [{ url: material.featuredImage.url }] }
      : undefined,
  }
}

export default async function MaterialStoryPage({ params }: PageProps) {
  const { slug } = await params
  const [material, relatedProducts] = await Promise.all([
    getMaterialStoryBySlug(slug),
    getRelatedProductsByWoodType(slug),
  ])

  if (!material) notFound()

  return (
    <div data-testid="material-story-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb
          maxWidthClassName="max-w-[1280px]"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Materials', href: '/materials' },
            { label: material.title },
          ]}
        />
      </div>
      <MaterialDetail material={material} />
      <RelatedProductsByMaterial products={relatedProducts} materialName={material.title} />
    </div>
  )
}
