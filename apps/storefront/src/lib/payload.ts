import type { BlogPost, MaterialStory, Media, PaginatedResponse } from '@TreasureTrove/types'
import type { HeroSlide } from '@/components/home/HeroCarousel'

const PAYLOAD_URL = process.env['NEXT_PUBLIC_PAYLOAD_URL'] ?? 'http://localhost:3001'

type FetchOptions = {
  revalidate?: number
  tags?: string[]
}

export async function fetchPayload<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 60, tags } = options

  // Fail fast if Payload is unreachable (e.g. CMS not running during a build),
  // so callers fall back to defaults instead of hanging until the page-render
  // timeout — which previously broke `next build` on the /materials pages.
  const res = await fetch(`${PAYLOAD_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate, tags },
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    throw new Error(`Payload fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export function getHomepageContent<T>(): Promise<T> {
  return fetchPayload<T>('/globals/homepage-content', {
    revalidate: 60,
    tags: ['homepage'],
  })
}

export function getMaterialStory(material: string): Promise<PaginatedResponse<MaterialStory>> {
  return fetchPayload<PaginatedResponse<MaterialStory>>(
    `/material-stories?where[material][equals]=${encodeURIComponent(material)}&where[status][equals]=published`,
    { revalidate: 60, tags: ['material-story'] },
  )
}

// ── Homepage CMS types ────────────────────────────────────────────────────────

export interface HeroContent {
  headline: string
  subtext: string
  ctaText: string
  ctaHref: string
  imageUrl: string
  editorPickTitle: string
  editorPickHref: string
  editorPickImageUrl?: string
}

export interface TrustBadge {
  icon: 'truck' | 'returns' | 'lock' | 'cod'
  label: string
  sub: string
}

export interface PriceBucket {
  label: string
  href: string
  dark: boolean
}

export interface HomepageSectionCopy {
  bestsellersTitle: string
  bestsellersSubtitle: string
  bestsellersViewAllLabel: string
  bestsellersViewAllHref: string
  newArrivalsTitle: string
  newArrivalsSubtitle: string
  newArrivalsViewAllLabel: string
  newArrivalsViewAllHref: string
  collectionsHeading: string
  collectionsSubtitle: string
  categoryEyebrow: string
  categoryHeading: string
  categorySubtitle: string
  journalEyebrow: string
  journalHeading: string
  journalSubtitle: string
}

export interface BlogPreviewItem {
  id: string
  title: string
  excerpt: string
  coverImageUrl: string
  publishDate: string
  slug: string
}

export interface BrandPhilosophyContent {
  eyebrow: string
  headline: string
  body: string
  ctaText: string
  ctaHref: string
  imageUrl: string
}

export interface OfferCardItem {
  badge: string
  title: string
  link: string
  href: string
  image: string
}

// ── Internal: raw shape returned by Payload for the homepage global ───────────

interface HomepageGlobalDoc {
  heroHeadline: string
  heroSubtext: string | null
  heroCtaLabel: string | null
  heroCtaLink: string | null
  heroBackgroundImage: { url: string } | string | null
  heroEditorPickTitle: string | null
  heroEditorPickLink: string | null
  heroEditorPickImage: { url: string } | string | null
  heroSlides: Array<{
    badge: string
    title: string
    subtitle: string | null
    ctaLabel: string | null
    ctaHref: string | null
    image: { url: string } | string | null
    order: number | null
    id: string
  }> | null
  marqueeItems: Array<{ text: string; order: number | null; id: string }> | null
  offerCards: Array<{
    badge: string
    title: string
    linkLabel: string
    linkHref: string
    image: { url: string } | string | null
    order: number | null
    enabled: boolean | null
    id: string
  }> | null
  trustBadges: Array<{
    icon: 'truck' | 'returns' | 'lock' | 'cod'
    label: string
    sub: string | null
    order: number | null
    id: string
  }> | null
  shopByPriceHeading: string | null
  priceBuckets: Array<{
    label: string
    href: string
    dark: boolean | null
    order: number | null
    id: string
  }> | null
  bestsellersTitle: string | null
  bestsellersSubtitle: string | null
  bestsellersViewAllLabel: string | null
  bestsellersViewAllHref: string | null
  newArrivalsTitle: string | null
  newArrivalsSubtitle: string | null
  newArrivalsViewAllLabel: string | null
  newArrivalsViewAllHref: string | null
  collectionsHeading: string | null
  collectionsSubtitle: string | null
  categoryEyebrow: string | null
  categoryHeading: string | null
  categorySubtitle: string | null
  journalEyebrow: string | null
  journalHeading: string | null
  journalSubtitle: string | null
  brandPhilosophyEyebrow: string | null
  brandPhilosophyHeading: string | null
  brandPhilosophyBody: string | null
  brandPhilosophyImage: { url: string } | string | null
  brandPhilosophyCtaText: string | null
  brandPhilosophyCtaLink: string | null
}

function resolveMediaUrl(field: { url: string } | string | null | undefined): string {
  if (!field) return ''
  return typeof field === 'string' ? field : field.url
}

const HOMEPAGE_FETCH_OPTS: FetchOptions = { revalidate: 3600, tags: ['homepage'] }
const HOMEPAGE_PATH = '/globals/homepage-content?depth=1'

// ── Homepage Payload fetchers ─────────────────────────────────────────────────

export async function getHeroContent(): Promise<HeroContent | null> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    return {
      headline: doc.heroHeadline,
      subtext: doc.heroSubtext ?? '',
      ctaText: doc.heroCtaLabel ?? 'SHOP NEW ARRIVALS',
      ctaHref: doc.heroCtaLink ?? '/products',
      imageUrl: resolveMediaUrl(doc.heroBackgroundImage),
      editorPickTitle: doc.heroEditorPickTitle ?? 'The Lighting Edit',
      editorPickHref: doc.heroEditorPickLink ?? '/collections/lighting',
      editorPickImageUrl: resolveMediaUrl(doc.heroEditorPickImage),
    }
  } catch {
    return null
  }
}

// Hero carousel slides authored in the CMS. Returns null when none are
// configured so the storefront falls back to HeroCarousel's built-in slides.
export async function getHeroSlides(): Promise<HeroSlide[] | null> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    if (!doc.heroSlides?.length) return null
    const slides = [...doc.heroSlides]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => ({
        badge: s.badge,
        title: s.title,
        subtitle: s.subtitle ?? undefined,
        cta: s.ctaLabel ?? 'SHOP NOW',
        href: s.ctaHref ?? '/products',
        image: resolveMediaUrl(s.image),
      }))
      .filter((s) => s.image.length > 0)
    return slides.length > 0 ? slides : null
  } catch {
    return null
  }
}

// Default trust-strip badges — shown when the CMS has none configured.
const DEFAULT_TRUST_BADGES: readonly TrustBadge[] = [
  { icon: 'truck', label: 'Free Shipping', sub: 'On orders over Rs. 999' },
  { icon: 'returns', label: '7-Day Returns', sub: 'Hassle-free returns' },
  { icon: 'lock', label: 'Secure Payments', sub: 'SSL encrypted checkout' },
  { icon: 'cod', label: 'COD Available', sub: 'Pay cash on delivery' },
]

export async function getTrustBadges(): Promise<TrustBadge[]> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    if (!doc.trustBadges?.length) return [...DEFAULT_TRUST_BADGES]
    return [...doc.trustBadges]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((b) => ({ icon: b.icon, label: b.label, sub: b.sub ?? '' }))
  } catch {
    return [...DEFAULT_TRUST_BADGES]
  }
}

// Default "Shop by Price" heading + buckets — shown when the CMS has none.
const DEFAULT_SHOP_BY_PRICE_HEADING = 'Shop by Price'
const DEFAULT_PRICE_BUCKETS: readonly PriceBucket[] = [
  { label: 'Under Rs. 999', href: '/products?maxPrice=999', dark: false },
  { label: 'Under Rs. 2,499', href: '/products?maxPrice=2499', dark: false },
  { label: 'Under Rs. 4,999', href: '/products?maxPrice=4999', dark: false },
  { label: 'Rs. 5,000+', href: '/products?minPrice=5000', dark: true },
]

export async function getShopByPrice(): Promise<{ heading: string; buckets: PriceBucket[] }> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    const heading = doc.shopByPriceHeading?.trim() || DEFAULT_SHOP_BY_PRICE_HEADING
    if (!doc.priceBuckets?.length) return { heading, buckets: [...DEFAULT_PRICE_BUCKETS] }
    const buckets = [...doc.priceBuckets]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((p) => ({ label: p.label, href: p.href, dark: p.dark ?? false }))
    return { heading, buckets }
  } catch {
    return { heading: DEFAULT_SHOP_BY_PRICE_HEADING, buckets: [...DEFAULT_PRICE_BUCKETS] }
  }
}

// Default editorial copy for the section headings/eyebrows — preserves the
// storefront's original static text when the CMS leaves a field blank.
const DEFAULT_SECTION_COPY: HomepageSectionCopy = {
  bestsellersTitle: 'Bestsellers',
  bestsellersSubtitle: 'Our most-loved pieces, chosen by customers like you',
  bestsellersViewAllLabel: 'VIEW ALL BESTSELLERS',
  bestsellersViewAllHref: '/collections/bestsellers',
  newArrivalsTitle: 'New Arrivals',
  newArrivalsSubtitle: 'Fresh pieces, just landed in our studio',
  newArrivalsViewAllLabel: 'VIEW ALL NEW ARRIVALS',
  newArrivalsViewAllHref: '/collections/new-arrivals',
  collectionsHeading: 'Our Collections',
  collectionsSubtitle: 'Thoughtfully curated for every space',
  categoryEyebrow: 'Browse',
  categoryHeading: 'Shop by Category',
  categorySubtitle: 'Explore our curated collections for every corner of your home',
  journalEyebrow: 'Journal',
  journalHeading: 'From Our Journal',
  journalSubtitle: 'Stories, tips, and inspiration for a beautiful home',
}

export async function getHomepageSectionCopy(): Promise<HomepageSectionCopy> {
  const pick = (val: string | null | undefined, fallback: string): string =>
    val && val.trim().length > 0 ? val : fallback
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    return {
      bestsellersTitle: pick(doc.bestsellersTitle, DEFAULT_SECTION_COPY.bestsellersTitle),
      bestsellersSubtitle: pick(doc.bestsellersSubtitle, DEFAULT_SECTION_COPY.bestsellersSubtitle),
      bestsellersViewAllLabel: pick(
        doc.bestsellersViewAllLabel,
        DEFAULT_SECTION_COPY.bestsellersViewAllLabel,
      ),
      bestsellersViewAllHref: pick(
        doc.bestsellersViewAllHref,
        DEFAULT_SECTION_COPY.bestsellersViewAllHref,
      ),
      newArrivalsTitle: pick(doc.newArrivalsTitle, DEFAULT_SECTION_COPY.newArrivalsTitle),
      newArrivalsSubtitle: pick(doc.newArrivalsSubtitle, DEFAULT_SECTION_COPY.newArrivalsSubtitle),
      newArrivalsViewAllLabel: pick(
        doc.newArrivalsViewAllLabel,
        DEFAULT_SECTION_COPY.newArrivalsViewAllLabel,
      ),
      newArrivalsViewAllHref: pick(
        doc.newArrivalsViewAllHref,
        DEFAULT_SECTION_COPY.newArrivalsViewAllHref,
      ),
      collectionsHeading: pick(doc.collectionsHeading, DEFAULT_SECTION_COPY.collectionsHeading),
      collectionsSubtitle: pick(doc.collectionsSubtitle, DEFAULT_SECTION_COPY.collectionsSubtitle),
      categoryEyebrow: pick(doc.categoryEyebrow, DEFAULT_SECTION_COPY.categoryEyebrow),
      categoryHeading: pick(doc.categoryHeading, DEFAULT_SECTION_COPY.categoryHeading),
      categorySubtitle: pick(doc.categorySubtitle, DEFAULT_SECTION_COPY.categorySubtitle),
      journalEyebrow: pick(doc.journalEyebrow, DEFAULT_SECTION_COPY.journalEyebrow),
      journalHeading: pick(doc.journalHeading, DEFAULT_SECTION_COPY.journalHeading),
      journalSubtitle: pick(doc.journalSubtitle, DEFAULT_SECTION_COPY.journalSubtitle),
    }
  } catch {
    return { ...DEFAULT_SECTION_COPY }
  }
}

// Default announcement strip shown when Payload is unreachable or has no marqueeItems
// configured. Keeps the homepage MarqueeBar visually present for QA / TC-002 step 6.
const DEFAULT_MARQUEE_ITEMS: readonly string[] = [
  'HANDCRAFTED IN INDIA',
  'FREE SHIPPING OVER RS. 999',
  '7-DAY RETURNS',
  'SECURE PAYMENTS',
  'NEW ARRIVALS EVERY WEEK',
  'ARTISAN QUALITY',
  'COD AVAILABLE',
]

export async function getMarqueeText(): Promise<string[]> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    if (!doc.marqueeItems?.length) return [...DEFAULT_MARQUEE_ITEMS]
    return [...doc.marqueeItems]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => item.text)
  } catch {
    return [...DEFAULT_MARQUEE_ITEMS]
  }
}

export async function getBlogPreviews(): Promise<BlogPreviewItem[]> {
  try {
    const data = await fetchPayload<
      PaginatedResponse<{
        id: string
        title: string
        slug: string
        excerpt: string
        coverImage: { url: string } | string
        publishedAt: string | null
      }>
    >('/blog-posts?where[_status][equals]=published&sort=-publishedAt&limit=3&depth=1', {
      revalidate: 3600,
      tags: ['blog'],
    })
    return data.docs.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      coverImageUrl: resolveMediaUrl(post.coverImage),
      publishDate: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '',
      slug: post.slug,
    }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getBlogPreviews] Payload fetch failed:', error)
    return []
  }
}

export async function getOfferCards(): Promise<OfferCardItem[]> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    if (!doc.offerCards?.length) return []
    return [...doc.offerCards]
      .filter((c) => c.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({
        badge: c.badge,
        title: c.title,
        link: c.linkLabel,
        href: c.linkHref,
        image: resolveMediaUrl(c.image),
      }))
      .filter((c) => c.image.length > 0)
  } catch {
    return []
  }
}

// Default editorial copy shown when Payload is unreachable or the global has no
// brand-philosophy fields populated. Keeps the homepage section visually present
// for QA / TC-002 step 14.
const DEFAULT_BRAND_PHILOSOPHY: BrandPhilosophyContent = {
  eyebrow: 'OUR PHILOSOPHY',
  headline: 'Modern Heirlooms, Handcrafted in India',
  body: 'Every piece in our collection is shaped by hand in artisan workshops across India — built from materials chosen to age beautifully and designed to be passed down, not thrown away.',
  ctaText: 'DISCOVER OUR CRAFT',
  ctaHref: '/about',
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
}

export async function getBrandPhilosophy(): Promise<BrandPhilosophyContent | null> {
  try {
    const doc = await fetchPayload<HomepageGlobalDoc>(HOMEPAGE_PATH, HOMEPAGE_FETCH_OPTS)
    if (!doc.brandPhilosophyHeading) return DEFAULT_BRAND_PHILOSOPHY
    return {
      eyebrow: doc.brandPhilosophyEyebrow ?? '',
      headline: doc.brandPhilosophyHeading,
      body: doc.brandPhilosophyBody ?? '',
      ctaText: doc.brandPhilosophyCtaText ?? 'EXPLORE',
      ctaHref: doc.brandPhilosophyCtaLink ?? '/collections',
      imageUrl: resolveMediaUrl(doc.brandPhilosophyImage),
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getBrandPhilosophy] Payload fetch failed:', error)
    return DEFAULT_BRAND_PHILOSOPHY
  }
}

// ── Material Stories types & helpers ─────────────────────────────────────────

export type WoodType = 'teak' | 'walnut' | 'oak' | 'mango' | 'rosewood'

export interface StorefrontMaterialStory {
  id: string
  title: string
  slug: string
  woodType: WoodType
  origin: string
  sustainabilityRating: number
  shortDescription: string
  description: string[]
  featuredImage: { url: string; alt: string }
}

interface PayloadMaterialStoryDoc {
  id: string
  woodType: WoodType
  slug: string
  sustainabilityRating: number
  origin: string
  description: unknown
  featuredImage:
    | { id: string; url: string; alt: string; width?: number; height?: number }
    | string
    | null
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface LexicalChild {
  type: string
  text?: string
  children?: LexicalChild[]
}

function extractTextFromChildren(children: LexicalChild[]): string {
  return children
    .map((c) =>
      c.type === 'text' ? (c.text ?? '') : c.children ? extractTextFromChildren(c.children) : '',
    )
    .join('')
}

function extractParagraphTexts(description: unknown): string[] {
  if (!description || typeof description !== 'object') return []
  const doc = description as {
    root?: { children?: Array<{ type: string; children?: LexicalChild[] }> }
  }
  const paragraphs: string[] = []
  for (const node of doc.root?.children ?? []) {
    if (node.type === 'paragraph' && node.children) {
      const text = extractTextFromChildren(node.children).trim()
      if (text) paragraphs.push(text)
    }
  }
  return paragraphs
}

function resolveFeaturedImage(
  img: PayloadMaterialStoryDoc['featuredImage'],
  fallbackAlt: string,
): { url: string; alt: string } {
  if (!img) return { url: '', alt: fallbackAlt }
  if (typeof img === 'string') return { url: img, alt: fallbackAlt }
  return { url: img.url, alt: img.alt || fallbackAlt }
}

function adaptMaterialStoryDoc(doc: PayloadMaterialStoryDoc): StorefrontMaterialStory {
  const paragraphs = extractParagraphTexts(doc.description)
  return {
    id: doc.id,
    title: doc.woodType.charAt(0).toUpperCase() + doc.woodType.slice(1),
    slug: doc.slug,
    woodType: doc.woodType,
    origin: doc.origin,
    sustainabilityRating: doc.sustainabilityRating,
    shortDescription: paragraphs[0] ?? '',
    description: paragraphs,
    featuredImage: resolveFeaturedImage(doc.featuredImage, doc.woodType),
  }
}

// Built-in material stories — shown when Payload is unreachable (e.g. CMS not
// running during a build) or has no material-stories published yet, so the
// /materials pages always render complete, meaningful content instead of a
// blank grid. Mirrors the DEFAULT_* fallbacks used for the homepage globals.
// Editorial copy is kept in sync with apps/storefront/src/lib/materials.mock.ts.
const DEFAULT_MATERIAL_STORIES: readonly StorefrontMaterialStory[] = [
  {
    id: 'mat-default-teak',
    title: 'Teak',
    slug: 'teak',
    woodType: 'teak',
    origin: 'Kerala, India',
    sustainabilityRating: 5,
    shortDescription:
      'The gold standard of Indian hardwoods — weather-resistant, naturally oiled, and built for generations.',
    description: [
      'Tectona grandis — teak — has been the preferred wood of Indian craftsmen for over a thousand years. Its natural oil content makes it resistant to moisture, termites, and warping without chemical treatment, earning it a permanent place in heirloom furniture.',
      'We source exclusively from FSC-certified forest cooperatives in Kerala and Karnataka. Every log is tracked from felling permit to finished piece, and one tree is planted for every item sold. Kiln-dried to 8–12% moisture content, our teak arrives at the workshop in perfect condition for joinery.',
      'The craftsmen in Mysore orient the grain intentionally — bookmatching table tops, matching figure across drawer fronts — so the wood itself becomes the design.',
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
      alt: 'Teak wood grain',
    },
  },
  {
    id: 'mat-default-walnut',
    title: 'Walnut',
    slug: 'walnut',
    woodType: 'walnut',
    origin: 'Himachal Pradesh, India',
    sustainabilityRating: 4,
    shortDescription:
      'Dark, dense, and deeply beautiful — Himalayan walnut brings a rich warmth to every space.',
    description: [
      'Juglans regia — Himalayan walnut — grows at elevations above 1,800 metres in the valleys of Himachal Pradesh and Jammu & Kashmir. Its tight, chocolate-dark grain and natural lustre have made it the prestige wood of Kashmiri artisans for centuries.',
      'Our walnut is selectively harvested from privately managed orchards whose owners replant at a 3:1 ratio. This ensures long-term canopy health while providing livelihoods to mountain farming communities.',
      'Walnut takes fine carving and joinery exceptionally well. The craftsmen in Srinagar who work it bring generations of knowledge — you will see this in the precision of mortise-and-tenon joints and the delicate patterning on drawer faces.',
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
      alt: 'Walnut wood grain',
    },
  },
  {
    id: 'mat-default-oak',
    title: 'Oak',
    slug: 'oak',
    woodType: 'oak',
    origin: 'Uttarakhand, India',
    sustainabilityRating: 4,
    shortDescription:
      'Hardy and light-toned, Indian oak brings an understated elegance to contemporary interiors.',
    description: [
      'Quercus leucotrichophora — Himalayan oak — grows in the temperate forests of Uttarakhand and Himachal Pradesh. Lighter in tone than walnut with a more open grain, it is the wood of choice when a space calls for brightness and restraint.',
      'Our oak is sourced from van panchayat — village forest councils — who manage their woodlands under a community governance model that has sustained these forests for generations.',
      "Oak's open grain accepts oil finishes beautifully, developing a rich honey-gold patina over decades. Our craftsmen in Dehradun pair it with hand-forged iron hardware for a look that balances natural material with architectural precision.",
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
      alt: 'Oak wood grain',
    },
  },
  {
    id: 'mat-default-mango',
    title: 'Mango',
    slug: 'mango',
    woodType: 'mango',
    origin: 'Rajasthan, India',
    sustainabilityRating: 5,
    shortDescription:
      "India's most sustainable hardwood — mango trees are replanted after each harvest cycle, giving you furniture with a clear conscience.",
    description: [
      "Mangifera indica — the mango tree — is India's most abundant hardwood by volume. Once a tree stops bearing fruit after 40–50 years, it is harvested and a new sapling planted in its place. This natural lifecycle makes mango one of the most sustainable furniture woods on the planet.",
      'Our mango comes from orchards in Rajasthan and Uttar Pradesh where the harvest cycle has operated sustainably for generations. No virgin forests are cleared; every piece of mango furniture comes from a tree that lived a full, productive life.',
      "Mango's bold, interlocking grain — often showing dramatic waves and figure — makes each piece genuinely unique. Our craftsmen in Jodhpur sand and oil it to a fine finish that highlights the natural variation rather than concealing it.",
    ],
    featuredImage: {
      // The original aida-public asset for mango 404s; use a stable wood-tone
      // photo so the card/detail hero never renders blank.
      url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80',
      alt: 'Mango wood grain',
    },
  },
  {
    id: 'mat-default-rosewood',
    title: 'Rosewood',
    slug: 'rosewood',
    woodType: 'rosewood',
    origin: 'Karnataka, India',
    sustainabilityRating: 3,
    shortDescription:
      "India's most prized cabinet wood — dense, fragrant, and the material behind India's greatest furniture heritage.",
    description: [
      'Dalbergia latifolia — Indian rosewood or shīsham — is among the densest and most beautiful woods in the world. Its deep purple-brown heartwood, interlocked grain, and natural fragrance have made it the wood of maharajas and master craftsmen alike.',
      'We source only from government-licensed timber depots holding CITES-compliant documentation. All our rosewood is reclaimed or from FSC-certified plantation growth — we do not source from old-growth forests. This is why rosewood carries our only rating below 4.',
      "Rosewood's extreme density means it takes years to properly season. Our craftsmen in Mysore — some of the finest rosewood workers remaining in India — shape it with hand tools and finish it with shellac and natural oils that deepen its already extraordinary colour.",
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
      alt: 'Rosewood wood grain',
    },
  },
]

export async function getMaterialStories(): Promise<StorefrontMaterialStory[]> {
  try {
    const data = await fetchPayload<PaginatedResponse<PayloadMaterialStoryDoc>>(
      '/material-stories?where[_status][equals]=published&sort=woodType&limit=10&depth=1',
      { revalidate: 86400, tags: ['material-stories'] },
    )
    if (!data.docs.length) return DEFAULT_MATERIAL_STORIES.map((m) => ({ ...m }))
    return data.docs.map(adaptMaterialStoryDoc)
  } catch {
    return DEFAULT_MATERIAL_STORIES.map((m) => ({ ...m }))
  }
}

export async function getMaterialStoryBySlug(
  slug: string,
): Promise<StorefrontMaterialStory | null> {
  const fallback = (): StorefrontMaterialStory | null => {
    const match = DEFAULT_MATERIAL_STORIES.find((m) => m.slug === slug)
    return match ? { ...match } : null
  }
  try {
    const data = await fetchPayload<PaginatedResponse<PayloadMaterialStoryDoc>>(
      `/material-stories?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=1&limit=1`,
      { revalidate: 86400, tags: ['material-stories', `material-story-${slug}`] },
    )
    const doc = data.docs[0]
    return doc ? adaptMaterialStoryDoc(doc) : fallback()
  } catch {
    return fallback()
  }
}

export async function getAllMaterialStorySlugs(): Promise<string[]> {
  try {
    const data = await fetchPayload<PaginatedResponse<PayloadMaterialStoryDoc>>(
      '/material-stories?where[_status][equals]=published&limit=10&depth=0',
      { revalidate: 86400, tags: ['material-stories'] },
    )
    if (!data.docs.length) return DEFAULT_MATERIAL_STORIES.map((m) => m.slug)
    return data.docs.map((d) => d.slug)
  } catch {
    return DEFAULT_MATERIAL_STORIES.map((m) => m.slug)
  }
}

// ── Journal (Blog) fetchers ───────────────────────────────────────────────────

export function getPosts(page = 1): Promise<PaginatedResponse<BlogPost>> {
  return fetchPayload<PaginatedResponse<BlogPost>>(
    `/blog-posts?where[_status][equals]=published&sort=-publishedAt&page=${page}&limit=10&depth=1`,
    { revalidate: 1800, tags: ['blog'] },
  )
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const data = await fetchPayload<PaginatedResponse<BlogPost>>(
      `/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=1&limit=1`,
      { revalidate: 1800, tags: ['blog', `blog-${slug}`] },
    )
    return data.docs[0] ?? null
  } catch {
    return null
  }
}

// ── Media fetchers ────────────────────────────────────────────────────────────

export async function getMediaDoc(id: string): Promise<Media | null> {
  try {
    return await fetchPayload<Media>(`/media/${id}`, {
      revalidate: 3600,
      tags: ['media', `media-${id}`],
    })
  } catch {
    return null
  }
}

export async function getMediaDocs(limit = 10): Promise<Media[]> {
  try {
    const data = await fetchPayload<PaginatedResponse<Media>>(`/media?limit=${limit}&depth=0`, {
      revalidate: 3600,
      tags: ['media'],
    })
    return data.docs
  } catch {
    return []
  }
}
