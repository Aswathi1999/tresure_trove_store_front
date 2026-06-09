import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Star, Shield, Truck, RefreshCw, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getProductByHandle, getRelatedProducts } from '@/lib/medusa'
import { getMaterialStory } from '@/lib/payload'
import { getProductReviews } from '@/lib/reviews'
import { ImageGallery } from '@/components/pdp/ImageGallery'
import { PdpImageProvider } from '@/components/pdp/PdpImageContext'
import { VariantSelector } from '@/components/pdp/VariantSelector'
import { MaterialStoryLink } from '@/components/pdp/MaterialStoryLink'
import { RelatedProducts } from '@/components/pdp/RelatedProducts'
import { ReviewSection } from '@/components/pdp/ReviewSection'
import { WishlistButton } from '@/components/products/WishlistButton'

export const revalidate = 0

// Medusa stores origin_country as an ISO-3166 code (e.g. "dz"); convert it to a
// readable country name, falling back to the raw value if it isn't a code.
function countryName(code?: string | null): string {
  if (!code) return ''
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return { title: 'Product Not Found — Treasure Trove' }
  return {
    title: `${product.title} — Treasure Trove`,
    description: product.description ?? undefined,
    openGraph: { images: [{ url: product.images[0]?.url ?? '' }] },
  }
}

export default async function ProductPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  // ── Option mapping ────────────────────────────────────────────────────────
  const optionById = Object.fromEntries(product.options.map((o) => [o.id, o]))

  // Accept common admin names. "finish" / "color" / "colour" all map to the
  // swatch axis on the buy box; "size" and "material" are the other two axes.
  const FINISH_ALIASES = new Set(['finish', 'color', 'colour'])
  const MATERIAL_ALIASES = new Set(['material'])
  // The finish/colour option (if any) is rendered as colour swatches; every
  // other option renders as a generic pill axis (see `axes` below).
  const finishOption = product.options.find((o) => FINISH_ALIASES.has(o.title.toLowerCase()))
  const materialOption = product.options.find((o) => MATERIAL_ALIASES.has(o.title.toLowerCase()))

  const pdpVariants = product.variants.map((v) => {
    // Key each variant's selected values by the option's DISPLAY title, so any
    // admin-defined option (Colour, Size, Weight, Pattern, …) is preserved and
    // can be rendered as its own switchable axis.
    const optionValues: Record<string, string> = {}
    for (const opt of v.options) {
      const def = optionById[opt.option_id]
      if (!def) continue
      optionValues[def.title] = opt.value
    }
    // Use lowest price (Medusa applies the lowest eligible price in cart)
    const inrPrices = v.prices.filter((p) => p.currency_code === 'inr')
    const lowestPrice =
      inrPrices.length > 0
        ? inrPrices.reduce((lowest, p) => (p.amount < lowest.amount ? p : lowest))
        : { amount: 0 }
    const inventory = v.inventory_quantity ?? 0
    // Per-variant image resolution, highest priority first:
    //   1. variant metadata `imageUrl` row (explicit manual override)
    //   2. native Medusa variant↔image association (admin "associate image to
    //      variant") — exposed via variant.images. This is what makes BOTH the
    //      finish AND the size switch the gallery to that exact variant's photo.
    // `swatchColor` still comes from variant metadata.
    const variantMeta = (v.metadata ?? {}) as Record<string, unknown>
    const metaImageUrl =
      typeof variantMeta['imageUrl'] === 'string' ? (variantMeta['imageUrl'] as string) : undefined
    const imageUrl = metaImageUrl ?? v.images?.[0]?.url
    const swatchColor =
      typeof variantMeta['swatchColor'] === 'string'
        ? (variantMeta['swatchColor'] as string)
        : undefined
    return {
      id: v.id,
      title: v.title,
      options: optionValues,
      price: lowestPrice.amount,
      inventory,
      available: inventory > 0,
      sku: v.sku ?? '',
      imageUrl,
      swatchColor,
    }
  })

  // Accept BOTH nested maps and flat metadata rows so admins can either paste
  // JSON (advanced) or add individual rows in the admin metadata widget.
  // Flat rows look like:
  //   finishColor_Red   = #b91c1c
  //   finishImage_Red   = https://cdn.../red.webp
  const rawMeta = (product.metadata ?? {}) as Record<string, unknown>
  const finishColors: Record<string, string> = {
    ...((rawMeta['finishColors'] as Record<string, string> | undefined) ?? {}),
  }
  const finishImages: Record<string, string> = {
    ...((rawMeta['finishImages'] as Record<string, string> | undefined) ?? {}),
  }
  for (const [key, value] of Object.entries(rawMeta)) {
    if (typeof value !== 'string') continue
    if (key.startsWith('finishColor_')) {
      const finish = key.slice('finishColor_'.length)
      if (finish && !finishColors[finish]) finishColors[finish] = value
    } else if (key.startsWith('finishImage_')) {
      const finish = key.slice('finishImage_'.length)
      if (finish && !finishImages[finish]) finishImages[finish] = value
    }
  }

  // Build one switchable axis for EVERY product option, so any admin-defined
  // option renders on the buy box — not just size/material/colour. The
  // finish/colour option (if present) becomes the colour-swatch axis; all
  // others render as pill buttons labelled with their admin option name.
  const swatchTitle = finishOption?.title
  const axes = product.options.map((o) => ({
    title: o.title,
    values: o.values,
    isSwatch: o.title === swatchTitle,
  }))

  // ── Metadata-driven content ───────────────────────────────────────────────
  const meta: Record<string, unknown> = product.metadata ?? {}
  const baseSpecs = (meta['specifications'] as Array<{ label: string; value: string }> | null) ?? []

  // Build spec rows from the admin "Product Details" widget (custom metadata)
  // and Medusa's native product attributes.
  const detailSpecs: Array<{ label: string; value: string }> = []

  const metaMaterial = typeof meta['material'] === 'string' ? meta['material'] : ''
  const material = metaMaterial || (materialOption?.values.join(', ') ?? '')
  if (material) detailSpecs.push({ label: 'Material', value: material })

  const metaFinish = typeof meta['finish'] === 'string' ? meta['finish'] : ''
  const finish = metaFinish || (finishOption?.values.join(', ') ?? '')
  if (finish) detailSpecs.push({ label: finishOption?.title ?? 'Finish', value: finish })

  const woodType = typeof meta['wood_type'] === 'string' ? meta['wood_type'] : ''
  if (woodType) detailSpecs.push({ label: 'Wood Type', value: woodType })

  // Dimensions — prefer native height/width/length, else the custom-metadata ones.
  const nativeDims = [
    product.height ? `H ${product.height}` : '',
    product.width ? `W ${product.width}` : '',
    product.length ? `L ${product.length}` : '',
  ].filter(Boolean)
  if (nativeDims.length > 0) {
    detailSpecs.push({ label: 'Dimensions', value: `${nativeDims.join(' × ')} cm` })
  } else {
    const dims = meta['dimensions'] as
      | { width?: string; depth?: string; height?: string; unit?: string }
      | undefined
    if (dims && (dims.width || dims.depth || dims.height)) {
      const unit = dims.unit || 'cm'
      const size = [dims.width, dims.depth, dims.height].filter(Boolean).join(' × ')
      detailSpecs.push({ label: 'Dimensions (W × D × H)', value: `${size} ${unit}` })
    }
  }

  if (product.weight) detailSpecs.push({ label: 'Weight', value: `${product.weight} g` })

  const origin = countryName(product.originCountry)
  if (origin) detailSpecs.push({ label: 'Country of Origin', value: origin })

  const warranty = typeof meta['warranty'] === 'string' ? meta['warranty'] : ''
  if (warranty) detailSpecs.push({ label: 'Warranty', value: warranty })

  const specifications = [...detailSpecs, ...baseSpecs]
  const careInstructions = (meta['careInstructions'] as string[] | null) ?? []
  const detailText = (meta['detailText'] as string | null) ?? ''

  // ── Live reviews (preferred over metadata fallback) ───────────────────────
  const reviewsData = await getProductReviews(product.id)
  const metadataRating = Number(product.metadata?.rating ?? 0)
  const metadataReviewCount = Number(product.metadata?.reviewCount ?? 0)
  const rating = reviewsData.aggregate.total > 0 ? reviewsData.aggregate.average : metadataRating
  const reviewCount =
    reviewsData.aggregate.total > 0 ? reviewsData.aggregate.total : metadataReviewCount

  // ── Badge from tags ───────────────────────────────────────────────────────
  const tagValues = product.tags.map((t) => t.value.toLowerCase())
  let badge: string | undefined
  if (tagValues.includes('bestseller')) badge = 'Bestseller'
  else if (tagValues.some((t) => t === 'new' || t === 'new-arrival')) badge = 'New Arrival'

  // ── Material story from Payload ───────────────────────────────────────────
  let storyLink: { title: string; excerpt: string; href: string } | null = null
  try {
    const materialName = product.metadata?.material as string | undefined
    if (materialName) {
      const storyData = await getMaterialStory(materialName)
      const story = storyData.docs[0]
      if (story) {
        storyLink = { title: story.title, excerpt: story.excerpt, href: `/stories/${story.slug}` }
      }
    }
  } catch {
    // Payload unavailable — no story link shown
  }

  // ── Related products ──────────────────────────────────────────────────────
  const relatedProducts = product.collection?.id
    ? await getRelatedProducts(product.collection.id, product.id)
    : []

  // ── Image list (Medusa images have no alt field) ──────────────────────────
  const images = product.images.map((img) => ({ id: img.id, url: img.url, alt: product.title }))

  const firstImage = images[0]
  const firstVariant = pdpVariants[0]

  const category = product.collection?.title ?? ''
  const categorySlug = product.collection?.handle ?? ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.map((img) => img.url),
    brand: { '@type': 'Brand', name: 'Treasure Trove' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (firstVariant?.price ?? 0).toFixed(2),
      availability:
        (firstVariant?.inventory ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://treasuretrove.in/products/${product.handle}`,
    },
    ...(rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount,
      },
    }),
  }

  const starFill = (pos: number) => (pos <= Math.floor(rating) ? 1 : 0)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* Breadcrumb */}
        <div className="w-full pt-[92px] lg:pt-[112px] pb-3.5 bg-[var(--color-tt-surface-container)]">
          <nav
            className="max-w-screen-2xl mx-auto px-4 lg:px-8 flex flex-wrap items-center gap-2.5 text-[13px] tracking-[0.15em] font-medium uppercase text-[var(--color-tt-outline)] pt-3.5"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[var(--color-tt-gold)] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-[var(--color-tt-gold)] transition-colors">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight size={14} />
                <Link
                  href={`/collections/${categorySlug}`}
                  className="hover:text-[var(--color-tt-gold)] transition-colors"
                >
                  {category}
                </Link>
              </>
            )}
            <ChevronRight size={14} />
            <span className="text-[var(--color-tt-ink)]">{product.title}</span>
          </nav>
        </div>

        {/* Main fold */}
        <PdpImageProvider>
          <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-12 lg:py-16 lg:grid lg:grid-cols-12 lg:gap-16">
            {/* Gallery — 7 cols */}
            <div className="lg:col-span-7 mb-10 lg:mb-0">
              <ImageGallery images={images} title={product.title} />
            </div>

            {/* Buy box — 5 cols */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Category + badge */}
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-brown)] mb-2">
                  {category}
                  {badge && <span className="ml-3 text-[var(--color-tt-orange)]">• {badge}</span>}
                </p>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-tt-ink)] leading-tight mb-1">
                    {product.title}
                  </h1>
                  <WishlistButton
                    item={{
                      id: product.id,
                      title: product.title,
                      handle: product.handle,
                      price: firstVariant?.price ?? 0,
                      imageUrl: firstImage?.url ?? '',
                    }}
                    size={22}
                    className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-tt-surface-container)]"
                  />
                </div>
                {product.subtitle && (
                  <p className="text-base text-[var(--color-tt-outline)] font-light">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-3" data-testid="product-rating">
                  <div className="flex text-[var(--color-tt-gold)]">
                    {[1, 2, 3, 4, 5].map((pos) => (
                      <Star
                        key={pos}
                        size={15}
                        fill={starFill(pos) ? 'currentColor' : 'none'}
                        strokeWidth={starFill(pos) ? 0 : 1.5}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-tt-ink)]">{rating}</span>
                  <span className="w-px h-4 bg-[var(--color-tt-outline-variant)]" />
                  <span className="text-sm text-[var(--color-tt-outline)]">
                    {reviewCount} reviews
                  </span>
                </div>
              )}

              {/* Variant selector (interactive: price, options, stock, add-to-cart) */}
              <VariantSelector
                variants={pdpVariants}
                axes={axes}
                swatchColors={finishColors}
                swatchImages={finishImages}
                productTitle={product.title}
                imageUrl={firstImage?.url ?? ''}
              />

              {/* Trust row */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { icon: <Shield size={18} />, label: 'Genuine Quality' },
                  { icon: <Truck size={18} />, label: 'Insured Shipping' },
                  { icon: <RefreshCw size={18} />, label: 'Easy Returns' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span className="text-[var(--color-tt-brown)]">{icon}</span>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-tt-ink)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Material story link */}
              <MaterialStoryLink story={storyLink} />
            </div>
          </main>
        </PdpImageProvider>

        {/* Description + Specifications — side by side on desktop. Uses the same
            max-w-screen-2xl container as the hero/buy-box above so "About This
            Piece" starts on the same vertical line as the hero image. */}
        <section id="description" className="bg-white py-10 lg:py-12">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
            <div
              className={`grid gap-6 lg:gap-8 items-start ${
                specifications.length > 0 ? 'lg:grid-cols-2' : ''
              }`}
            >
              {/* About This Piece — left */}
              <div className="space-y-6">
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-tt-ink)]">
                  About This Piece
                </h2>
                <p className="text-[var(--color-tt-outline)] leading-relaxed text-base lg:text-lg">
                  {product.description}
                </p>
                {detailText && (
                  <p className="text-[var(--color-tt-outline)] leading-relaxed text-base lg:text-lg">
                    {detailText}
                  </p>
                )}
              </div>

              {/* Technical Specifications — right */}
              {specifications.length > 0 && (
                <div id="specifications">
                  <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-4 text-[var(--color-tt-ink)]">
                    Specifications
                  </h2>
                  <div className="border-t border-[var(--color-tt-outline-variant)]">
                    {specifications.map((spec) => (
                      <div
                        key={spec.label}
                        className="py-2.5 flex justify-between gap-4 border-b border-[var(--color-tt-outline-variant)]"
                      >
                        <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]">
                          {spec.label}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-tt-ink)] text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Care */}
        {careInstructions.length > 0 && (
          <section id="care" className="bg-[var(--color-tt-bg)] py-20 lg:py-24">
            <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
              <div className="bg-[var(--color-tt-surface-container-high)] p-10 lg:p-16 rounded-sm">
                <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-8 text-[var(--color-tt-ink)]">
                  Preserving the Heirloom
                </h2>
                <ul className="space-y-5 lg:w-2/3">
                  {careInstructions.map((instruction, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tt-gold)] mt-2 shrink-0" />
                      <p className="text-[var(--color-tt-outline)] text-sm leading-relaxed">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        <ReviewSection
          productId={product.id}
          initialReviews={reviewsData.reviews}
          initialAggregate={reviewsData.aggregate}
        />

        {/* Related products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </>
  )
}
