import { HeroSection } from '@/components/home/HeroSection'
import { TrustStrip } from '@/components/home/TrustStrip'
import { MarqueeBar } from '@/components/home/MarqueeBar'
import { CategorySection } from '@/components/home/CategorySection'
import { CollectionsGrid } from '@/components/home/CollectionsGrid'
import { OfferCarousel } from '@/components/home/OfferCarousel'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ShopByPrice } from '@/components/home/ShopByPrice'
import { BlogPreview } from '@/components/home/BlogPreview'
import { BrandPhilosophy } from '@/components/home/BrandPhilosophy'
import {
  getHeroContent,
  getHeroSlides,
  getMarqueeText,
  getBlogPreviews,
  getBrandPhilosophy,
  getOfferCards,
  getTrustBadges,
  getShopByPrice,
  getHomepageSectionCopy,
} from '@/lib/payload'
import { getFeaturedProducts, getNewArrivals, getCollections, getCategories } from '@/lib/medusa'

export const revalidate = 3600

export default async function HomePage(): Promise<React.JSX.Element> {
  const [
    heroContent,
    heroSlides,
    marqueeItems,
    blogPosts,
    brandPhilosophy,
    collections,
    categoryDocs,
    offerCards,
    newArrivals,
    trustBadges,
    shopByPrice,
    sectionCopy,
  ] = await Promise.all([
    getHeroContent(),
    getHeroSlides(),
    getMarqueeText(),
    getBlogPreviews(),
    getBrandPhilosophy(),
    getCollections(),
    getCategories(),
    getOfferCards(),
    getNewArrivals(),
    getTrustBadges(),
    getShopByPrice(),
    getHomepageSectionCopy(),
  ])

  const categories = categoryDocs.map((c) => ({
    id: c.id,
    label: c.title,
    imageUrl: c.imageUrl,
    href: c.href,
  }))

  // Handle error state for featured products gracefully — empty array renders empty-state UI
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  try {
    featuredProducts = await getFeaturedProducts()
  } catch {
    featuredProducts = []
  }

  return (
    <div className="pt-[88px] lg:pt-[106px]">
      <HeroSection content={heroContent} slides={heroSlides ?? undefined} />

      {/* Mobile: categories appear immediately after the hero for quick access */}
      <div className="lg:hidden">
        <CategorySection
          categories={categories}
          eyebrow={sectionCopy.categoryEyebrow}
          heading={sectionCopy.categoryHeading}
          subtitle={sectionCopy.categorySubtitle}
        />
      </div>

      <TrustStrip badges={trustBadges} />
      <MarqueeBar items={marqueeItems} />

      {/* Desktop: categories in their original position below the marquee */}
      <div className="hidden lg:block">
        <CategorySection
          categories={categories}
          eyebrow={sectionCopy.categoryEyebrow}
          heading={sectionCopy.categoryHeading}
          subtitle={sectionCopy.categorySubtitle}
        />
      </div>
      <CollectionsGrid
        collections={collections}
        heading={sectionCopy.collectionsHeading}
        subtitle={sectionCopy.collectionsSubtitle}
      />
      {offerCards.length > 0 && (
        <section className="max-w-[1280px] mx-auto mb-10 lg:mb-24 mt-8 lg:mt-0 px-4">
          <OfferCarousel cards={offerCards} />
        </section>
      )}
      <FeaturedProducts
        products={featuredProducts}
        title={sectionCopy.bestsellersTitle}
        subtitle={sectionCopy.bestsellersSubtitle}
        viewAllHref={sectionCopy.bestsellersViewAllHref}
        viewAllLabel={sectionCopy.bestsellersViewAllLabel}
      />
      <ShopByPrice heading={shopByPrice.heading} buckets={shopByPrice.buckets} />
      <FeaturedProducts
        products={newArrivals}
        title={sectionCopy.newArrivalsTitle}
        subtitle={sectionCopy.newArrivalsSubtitle}
        viewAllHref={sectionCopy.newArrivalsViewAllHref}
        viewAllLabel={sectionCopy.newArrivalsViewAllLabel}
      />
      <BlogPreview
        posts={blogPosts}
        eyebrow={sectionCopy.journalEyebrow}
        heading={sectionCopy.journalHeading}
        subtitle={sectionCopy.journalSubtitle}
      />
      <BrandPhilosophy content={brandPhilosophy} />
    </div>
  )
}
