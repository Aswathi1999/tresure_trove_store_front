import Medusa from '@medusajs/js-sdk'
import type { HttpTypes } from '@medusajs/types'
import { formatPrice } from '@TreasureTrove/utils'

const MEDUSA_BASE_URL = process.env['NEXT_PUBLIC_MEDUSA_BACKEND_URL'] ?? 'http://localhost:9000'
const MEDUSA_PUB_KEY = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? ''

export const medusa = new Medusa({
  baseUrl: MEDUSA_BASE_URL,
  publishableKey: MEDUSA_PUB_KEY,
})

// ── Homepage types ────────────────────────────────────────────────────────────

export interface HomepageProduct {
  id: string
  title: string
  price: string
  originalPrice?: string
  imageUrl: string
  badge?: string
  badgeVariant?: 'orange' | 'brown' | 'gold'
  href: string
  /** Lowercase Medusa product tags — used by client-side filters to match material chips. */
  tags?: string[]
  /** First variant's id. Only safe for a direct "quick add" when the product has exactly one variant. */
  defaultVariantId?: string
  /** Total purchasable variants. >1 means the shopper must choose options on the PDP before adding. */
  variantCount?: number
  /** True when at least one variant is purchasable. Untracked inventory counts as in stock. */
  inStock?: boolean
}

export interface HomepageCollection {
  id: string
  title: string
  handle: string
  imageUrl: string | null
  href: string
  metadata?: Record<string, unknown> | null
}

// ── Internal Medusa response shapes ──────────────────────────────────────────

interface MedusaProduct {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  images?: Array<{ id: string; url: string }> | null
  tags: Array<{ value: string }>
  collection?: { id: string; handle: string; title: string } | null
  options?: Array<{ title?: string | null; values?: Array<{ value: string }> | null }> | null
  variants: Array<{
    id: string
    prices?: Array<{ amount: number; currency_code: string; rules_count?: number }>
    inventory_quantity?: number | null
    calculated_price?: { calculated_amount?: number | null; currency_code?: string | null } | null
  }>
  metadata?: Record<string, unknown> | null
}

// Collects the material values declared on a product's "Material" option.
// Empty array when the product has no Material option.
function getMaterialOptionValues(p: MedusaProduct): string[] {
  const opt = (p.options ?? []).find((o) => (o.title ?? '').toLowerCase() === 'material')
  return (opt?.values ?? []).map((v) => v.value).filter(Boolean)
}

interface MedusaCollection {
  id: string
  title: string
  handle: string
  metadata?: Record<string, unknown> | null
}

// ── Internal helpers ──────────────────────────────────────────────────────────

// Cap every storefront→Medusa fetch so a slow or unreachable backend can never
// hang a request — or, critically, a `next build` static-generation worker,
// which Next aborts after 60s per page. On timeout the fetch rejects and the
// caller's try/catch returns its empty/mock fallback, so the build still
// completes and the page revalidates (ISR) once the backend recovers.
const MEDUSA_FETCH_TIMEOUT_MS = 20_000

function fetchTimeoutSignal(): AbortSignal {
  return AbortSignal.timeout(MEDUSA_FETCH_TIMEOUT_MS)
}

async function fetchMedusaHomepage<T>(path: string): Promise<T> {
  const res = await fetch(`${MEDUSA_BASE_URL}${path}`, {
    headers: { 'x-publishable-api-key': MEDUSA_PUB_KEY },
    next: { revalidate: 60, tags: ['homepage', 'products', 'collections'] } as RequestInit['next'],
    signal: fetchTimeoutSignal(),
  })
  if (!res.ok) {
    // Surface  the server's error body so we can diagnose 400 / 401 quickly.
    const body = await res.text().catch(() => '<no body>')
    throw new Error(
      `Medusa fetch failed: ${res.status} ${res.statusText} — ${body} (path: ${path})`,
    )
  }
  return res.json() as Promise<T>
}

// Pick the base price (rules_count === 0) for a currency, falling back to the first match
function getBasePrice(
  prices: Array<{ amount: number; currency_code: string; rules_count?: number }>,
  currency: string,
): number | undefined {
  const matches = prices.filter((p) => p.currency_code === currency)
  if (matches.length === 0) return undefined
  // Prefer the price with no rules (the admin-set base price)
  return (matches.find((p) => (p.rules_count ?? 0) === 0) ?? matches[0])!.amount
}

function mapMedusaProduct(p: MedusaProduct): HomepageProduct {
  // Price resolution — try in order:
  //   1. Variant's pre-calculated INR price (when region/currency is set up)
  //   2. Base INR price on the variant's `prices` array
  //   3. Any first non-zero price (fallback so admin-uploaded products don't show empty)
  const firstVariant = p.variants[0]
  const prices = firstVariant?.prices ?? []
  const calc = firstVariant?.calculated_price
  const calcInr =
    calc &&
    calc.currency_code?.toLowerCase() === 'inr' &&
    typeof calc.calculated_amount === 'number'
      ? calc.calculated_amount
      : undefined
  const inrAmount = calcInr ?? getBasePrice(prices, 'inr')
  let price = inrAmount !== undefined ? formatPrice(inrAmount, 'INR') : ''
  if (!price && prices.length > 0 && prices[0]) {
    price = formatPrice(prices[0].amount, prices[0].currency_code.toUpperCase())
  }

  // Image resolution — Medusa admin lets you upload to either `thumbnail` or `images[]`.
  // Fall back to the first gallery image so products that lack an explicit thumbnail
  // (but DO have images uploaded) still render.
  const imageUrl = p.thumbnail || p.images?.[0]?.url || ''

  const tagValues = p.tags.map((t) => t.value.toLowerCase())
  let badge: string | undefined
  let badgeVariant: HomepageProduct['badgeVariant']

  if (tagValues.includes('bestseller')) {
    badge = 'BESTSELLER'
    badgeVariant = 'orange'
  } else if (tagValues.some((v) => v === 'new' || v === 'new-arrival')) {
    badge = 'NEW'
    badgeVariant = 'gold'
  }

  return {
    id: p.id,
    title: p.title,
    price,
    imageUrl,
    badge,
    badgeVariant,
    href: `/products/${p.handle}`,
    tags: tagValues,
    defaultVariantId: firstVariant?.id,
    variantCount: p.variants.length,
    // A variant with untracked inventory (null/undefined) is treated as available;
    // out of stock only when every variant is explicitly at zero.
    inStock: p.variants.some((v) => (v.inventory_quantity ?? 1) > 0),
  }
}

// ── Homepage Medusa fetchers ───────────────────────────────────────────────────

export async function getFeaturedProducts(): Promise<HomepageProduct[]> {
  try {
    const { products } = await fetchMedusaHomepage<{ products: MedusaProduct[] }>(
      `/store/products?limit=4&fields=${encodeURIComponent(PRODUCT_LIST_FIELDS)}`,
    )
    return products.map(mapMedusaProduct)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getFeaturedProducts] Medusa fetch failed:', error)
    return []
  }
}

export async function getNewArrivals(): Promise<HomepageProduct[]> {
  try {
    const { products } = await fetchMedusaHomepage<{ products: MedusaProduct[] }>(
      `/store/products?limit=4&order=-created_at&fields=${encodeURIComponent(PRODUCT_LIST_FIELDS)}`,
    )
    return products.map(mapMedusaProduct)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getNewArrivals] Medusa fetch failed:', error)
    return []
  }
}

function readImageUrl(metadata: Record<string, unknown> | null | undefined): string | null {
  const raw = metadata?.['image_url']
  return typeof raw === 'string' && raw.length > 0 ? raw : null
}

export async function getCollections(): Promise<HomepageCollection[]> {
  try {
    const { collections } = await fetchMedusaHomepage<{ collections: MedusaCollection[] }>(
      '/store/collections?fields=id,title,handle,metadata&limit=100',
    )
    return collections.map((c) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      imageUrl: readImageUrl(c.metadata),
      href: `/collections/${encodeURIComponent(c.handle)}`,
      metadata: c.metadata ?? null,
    }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getCollections] Medusa fetch failed:', error)
    return []
  }
}

export async function getCategories(): Promise<HomepageCollection[]> {
  try {
    const { product_categories } = await fetchMedusaHomepage<{
      product_categories: Array<{
        id: string
        name: string
        handle: string
        rank?: number | null
        metadata?: Record<string, unknown> | null
      }>
    }>('/store/product-categories?fields=id,name,handle,rank,metadata&limit=100')
    return product_categories
      .slice()
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((c) => ({
        id: c.id,
        title: c.name,
        handle: c.handle,
        imageUrl: readImageUrl(c.metadata),
        href: `/categories/${encodeURIComponent(c.handle)}`,
        metadata: c.metadata ?? null,
      }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getCategories] Medusa fetch failed:', error)
    return []
  }
}

// ── Product & Collection Detail types ────────────────────────────────────────

export interface ProductOption {
  id: string
  title: string
  values: string[]
}

export interface ProductVariantDetail {
  id: string
  title: string
  sku?: string | null
  inventory_quantity?: number | null
  prices: Array<{ amount: number; currency_code: string; rules_count?: number }>
  options: Array<{ option_id: string; value: string }>
  metadata?: Record<string, unknown> | null
  /** Native Medusa variant↔image associations (admin "associate image to variant"). */
  images?: Array<{ url: string }>
}

export interface ProductDetail {
  id: string
  handle: string
  title: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  images: Array<{ id: string; url: string }>
  collection?: { id: string; handle: string; title: string } | null
  tags: Array<{ value: string }>
  options: ProductOption[]
  variants: ProductVariantDetail[]
  metadata?: Record<string, unknown> | null
  // Native Medusa physical / customs attributes
  height?: number | null
  width?: number | null
  length?: number | null
  weight?: number | null
  originCountry?: string | null
  hsCode?: string | null
  midCode?: string | null
}

export interface CollectionDetail {
  id: string
  handle: string
  title: string
  metadata?: Record<string, unknown> | null
}

export interface CollectionProductsResult {
  products: HomepageProduct[]
  count: number
}

// ── Internal Medusa product detail response shape ─────────────────────────────

interface MedusaProductDetail {
  id: string
  title: string
  handle: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  images?: Array<{ id: string; url: string }>
  collection?: { id: string; handle: string; title: string } | null
  tags?: Array<{ value: string }>
  options?: Array<{
    id: string
    title: string
    values?: Array<{ value: string }>
  }>
  variants?: Array<{
    id: string
    title: string
    sku?: string | null
    inventory_quantity?: number | null
    prices?: Array<{ amount: number; currency_code: string; rules_count?: number }>
    options?: Array<{ option_id: string; value: string }>
    metadata?: Record<string, unknown> | null
    images?: Array<{ url: string }>
  }>
  metadata?: Record<string, unknown> | null
  height?: number | null
  width?: number | null
  length?: number | null
  weight?: number | null
  origin_country?: string | null
  hs_code?: string | null
  mid_code?: string | null
}

// ── Shared fetch helper ───────────────────────────────────────────────────────

function buildFetchInit(tags: string[], revalidate = 0): RequestInit {
  return {
    headers: { 'x-publishable-api-key': MEDUSA_PUB_KEY },
    next: { revalidate, tags } as RequestInit['next'],
    // Fail fast on a slow/unreachable backend so build-time SSG (60s cap per
    // page) and runtime requests fall back gracefully instead of hanging.
    signal: fetchTimeoutSignal(),
  }
}

// ── Product & Collection fetchers ─────────────────────────────────────────────

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  try {
    // Listing a bare scalar field (e.g. metadata) makes Medusa return ONLY the
    // explicit scalars, so the needed top-level fields must be listed too.
    const fields =
      'title,subtitle,description,handle,thumbnail,metadata,height,width,length,weight,origin_country,hs_code,mid_code,*variants,*variants.inventory_quantity,*variants.prices,*variants.options,*variants.metadata,*variants.images,*images,*collection,*options,*options.values,*tags'
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?handle=${encodeURIComponent(handle)}&fields=${encodeURIComponent(fields)}`,
      buildFetchInit(['products', `product-${handle}`]),
    )
    if (!res.ok) return null
    const json = (await res.json()) as { products: MedusaProductDetail[] }
    const { products } = json
    const p = products[0]
    if (!p) return null

    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      thumbnail: p.thumbnail,
      images: p.images ?? [],
      collection: p.collection ?? null,
      tags: p.tags ?? [],
      options: (p.options ?? []).map((o) => ({
        id: o.id,
        title: o.title,
        values: (o.values ?? []).map((v) => v.value),
      })),
      variants: (p.variants ?? []).map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        inventory_quantity: v.inventory_quantity,
        prices: v.prices ?? [],
        options: v.options ?? [],
        metadata: v.metadata,
        images: v.images ?? [],
      })),
      metadata: p.metadata,
      height: p.height,
      width: p.width,
      length: p.length,
      weight: p.weight,
      originCountry: p.origin_country,
      hsCode: p.hs_code,
      midCode: p.mid_code,
    }
  } catch {
    return null
  }
}

export async function getCategoryByHandle(handle: string): Promise<CollectionDetail | null> {
  try {
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/product-categories?handle=${encodeURIComponent(handle)}&fields=id,name,handle,metadata`,
      buildFetchInit(['categories', `category-${handle}`]),
    )
    if (!res.ok) return null
    const { product_categories } = (await res.json()) as {
      product_categories: Array<{
        id: string
        handle: string
        name: string
        metadata?: Record<string, unknown> | null
      }>
    }
    const c = product_categories[0]
    if (!c) return null
    return { id: c.id, handle: c.handle, title: c.name, metadata: c.metadata }
  } catch {
    return null
  }
}

export async function getProductsByCategory(
  categoryId: string,
  filters?: CollectionProductFilters,
): Promise<CollectionProductsResult> {
  try {
    const limit = filters?.limit ?? 12
    const offset = filters?.offset ?? 0
    const order = filters?.order ?? ''

    const qs = new URLSearchParams({
      [`category_id[]`]: categoryId,
      limit: String(limit),
      offset: String(offset),
      fields: PRODUCT_LIST_FIELDS,
    })
    if (order) qs.set('order', order)
    if (filters?.price_gte !== undefined) qs.set('price_gte', String(filters.price_gte))
    if (filters?.price_lte !== undefined) qs.set('price_lte', String(filters.price_lte))

    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?${qs.toString()}`,
      buildFetchInit(['products', `category-products-${categoryId}`]),
    )
    if (!res.ok) return { products: [], count: 0 }
    const data = (await res.json()) as { products: MedusaProduct[]; count: number }
    return { products: data.products.map(mapMedusaProduct), count: data.count }
  } catch {
    return { products: [], count: 0 }
  }
}

export async function getCollectionByHandle(handle: string): Promise<CollectionDetail | null> {
  try {
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/collections?handle=${encodeURIComponent(handle)}&fields=id,title,handle,metadata`,
      buildFetchInit(['collections', `collection-${handle}`]),
    )
    if (!res.ok) return null
    const { collections } = (await res.json()) as {
      collections: Array<{
        id: string
        handle: string
        title: string
        metadata?: Record<string, unknown> | null
      }>
    }
    const c = collections[0]
    if (!c) return null
    return { id: c.id, handle: c.handle, title: c.title, metadata: c.metadata }
  } catch {
    return null
  }
}

// Fields that the grid/card components rely on. Medusa v2's default response
// for /store/products does NOT include variants.prices — without this, every
// product's priceValue parses to 0 (bypassing the maxPrice filter) and the
// card shows no price. Keep in sync with what mapMedusaProduct expects.
const PRODUCT_LIST_FIELDS =
  'title,handle,thumbnail,*images,*variants,*variants.prices,*variants.inventory_quantity,*tags,*collection,*options,*options.values'

export interface CollectionProductFilters {
  limit?: number
  offset?: number
  order?: string
  price_gte?: number
  price_lte?: number
  category_id?: string
}

export async function getProductsByCollection(
  collectionId: string,
  filters?: CollectionProductFilters,
): Promise<CollectionProductsResult> {
  try {
    const limit = filters?.limit ?? 12
    const offset = filters?.offset ?? 0
    const order = filters?.order ?? ''

    const qs = new URLSearchParams({
      [`collection_id[]`]: collectionId,
      limit: String(limit),
      offset: String(offset),
      fields: PRODUCT_LIST_FIELDS,
    })
    if (order) qs.set('order', order)
    if (filters?.price_gte !== undefined) qs.set('price_gte', String(filters.price_gte))
    if (filters?.price_lte !== undefined) qs.set('price_lte', String(filters.price_lte))
    if (filters?.category_id) qs.set('category_id[]', filters.category_id)

    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?${qs.toString()}`,
      buildFetchInit(['products', `collection-products-${collectionId}`]),
    )
    if (!res.ok) return { products: [], count: 0 }
    const data = (await res.json()) as { products: MedusaProduct[]; count: number }
    return { products: data.products.map(mapMedusaProduct), count: data.count }
  } catch {
    return { products: [], count: 0 }
  }
}

export async function getProductsByTag(
  tag: string,
  filters?: CollectionProductFilters,
): Promise<CollectionProductsResult> {
  try {
    const limit = filters?.limit ?? 12
    const offset = filters?.offset ?? 0
    const order = filters?.order ?? ''

    // Medusa's /store/products endpoint doesn't filter by tag value, only tag_id.
    // Fetch a wide batch and filter client-side; tag-driven virtual collections
    // (bestsellers, new-arrivals) are small enough that this is fine.
    const qs = new URLSearchParams({
      limit: '200',
      fields: PRODUCT_LIST_FIELDS,
    })
    if (order) qs.set('order', order)
    if (filters?.price_gte !== undefined) qs.set('price_gte', String(filters.price_gte))
    if (filters?.price_lte !== undefined) qs.set('price_lte', String(filters.price_lte))

    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?${qs.toString()}`,
      buildFetchInit(['products', `tag-products-${tag}`], 3600),
    )
    if (!res.ok) return { products: [], count: 0 }
    const { products } = (await res.json()) as { products: MedusaProduct[]; count: number }

    const tagLc = tag.toLowerCase()
    const matched = products.filter((p) => p.tags.some((t) => t.value.toLowerCase() === tagLc))

    return {
      products: matched.slice(offset, offset + limit).map(mapMedusaProduct),
      count: matched.length,
    }
  } catch {
    return { products: [], count: 0 }
  }
}

export async function getNewArrivalsCollection(
  filters?: CollectionProductFilters,
): Promise<CollectionProductsResult> {
  try {
    const limit = filters?.limit ?? 12
    const offset = filters?.offset ?? 0

    const qs = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      order: '-created_at',
      fields: PRODUCT_LIST_FIELDS,
    })
    if (filters?.price_gte !== undefined) qs.set('price_gte', String(filters.price_gte))
    if (filters?.price_lte !== undefined) qs.set('price_lte', String(filters.price_lte))

    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?${qs.toString()}`,
      buildFetchInit(['products', 'new-arrivals'], 3600),
    )
    if (!res.ok) return { products: [], count: 0 }
    const data = (await res.json()) as { products: MedusaProduct[]; count: number }
    return { products: data.products.map(mapMedusaProduct), count: data.count }
  } catch {
    return { products: [], count: 0 }
  }
}

export async function getRelatedProducts(
  collectionId: string,
  excludeProductId: string,
): Promise<HomepageProduct[]> {
  try {
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?collection_id=${encodeURIComponent(collectionId)}&limit=5&fields=${encodeURIComponent(PRODUCT_LIST_FIELDS)}`,
      buildFetchInit(['products']),
    )
    if (!res.ok) return []
    const { products } = (await res.json()) as { products: MedusaProduct[] }
    return products
      .filter((p) => p.id !== excludeProductId)
      .slice(0, 4)
      .map(mapMedusaProduct)
  } catch {
    return []
  }
}

export async function getRelatedProductsByWoodType(woodType: string): Promise<HomepageProduct[]> {
  try {
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?limit=50`,
      buildFetchInit(['products', `material-${woodType}`], 3600),
    )
    if (!res.ok) return []
    const { products } = (await res.json()) as { products: MedusaProduct[] }
    return products
      .filter((p) => {
        const wt = p.metadata?.['wood_type']
        return typeof wt === 'string' && wt.toLowerCase() === woodType.toLowerCase()
      })
      .slice(0, 3)
      .map(mapMedusaProduct)
  } catch {
    return []
  }
}

export interface ProductsResult {
  products: HomepageProduct[]
  count: number
}

export interface ProductFacets {
  materials: string[] // Display-cased unique tag values (e.g. "Brass", "Wood")
  maxPriceCeiling: number // Highest INR price across the catalogue, rounded up to nearest 5k
}

// Computes filter facets from the catalogue (or a subset scoped to a
// collection / category) so the sidebar reflects what's actually purchasable
// in that view. Pass collectionId or categoryId to scope; pass nothing for the
// whole catalogue.
export async function getProductFacets(scope?: {
  collectionId?: string
  categoryId?: string
}): Promise<ProductFacets> {
  const fallback: ProductFacets = { materials: [], maxPriceCeiling: 50000 }
  try {
    const qs = new URLSearchParams({
      limit: '200',
      fields: 'tags.value,*variants.prices,*options,*options.values',
    })
    if (scope?.collectionId) qs.set('collection_id[]', scope.collectionId)
    if (scope?.categoryId) qs.set('category_id[]', scope.categoryId)

    const cacheTag = scope?.collectionId
      ? `facets-collection-${scope.collectionId}`
      : scope?.categoryId
        ? `facets-category-${scope.categoryId}`
        : 'facets'

    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?${qs.toString()}`,
      buildFetchInit(['products', cacheTag], 3600),
    )
    if (!res.ok) return fallback
    const { products } = (await res.json()) as { products: MedusaProduct[] }

    // Collect material names from both Tags and the Material variant option,
    // so admin-set "Material: Wood" surfaces as a filter chip even without a tag.
    const materialSet = new Set<string>()
    let maxPrice = 0
    for (const p of products) {
      for (const t of p.tags ?? []) {
        if (t?.value) materialSet.add(t.value)
      }
      for (const v of getMaterialOptionValues(p)) materialSet.add(v)
      // Scan every variant — a product's priciest variant defines how high the
      // slider must reach, otherwise pricier variants get filtered out of view.
      for (const variant of p.variants) {
        const price = getBasePrice(variant.prices ?? [], 'inr')
        if (price !== undefined && price > maxPrice) maxPrice = price
      }
    }

    const materials = [...materialSet]
      .map((v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase())
      .sort()

    // Round up to the nearest 5,000, with a 5,000 floor so the slider isn't stuck at 0.
    const maxPriceCeiling = Math.max(5000, Math.ceil(maxPrice / 5000) * 5000)

    return { materials, maxPriceCeiling }
  } catch {
    return fallback
  }
}

export async function getProducts(params?: {
  limit?: number
  offset?: number
  order?: string
  material?: string
  collection?: string // collection handle, e.g. "living-room"
  minPrice?: number // INR rupees, e.g. 5000
  maxPrice?: number // INR rupees, e.g. 25000
  inStock?: boolean
}): Promise<ProductsResult> {
  try {
    const limit = params?.limit ?? 12
    const offset = params?.offset ?? 0
    const order = params?.order ?? ''
    // Medusa v2 can't order products by nested variant price, so price sorting
    // is done in JS below. Other orders (e.g. -created_at) are forwarded as-is.
    const isPriceSort = order === 'variants.prices.amount' || order === '-variants.prices.amount'
    const priceDescending = order === '-variants.prices.amount'
    const hasClientFilters = !!(
      params?.material ||
      params?.collection ||
      params?.minPrice !== undefined ||
      params?.maxPrice !== undefined ||
      params?.inStock
    )
    // Both client filters and price sorting need the full set before paginating.
    const needsFullFetch = hasClientFilters || isPriceSort

    const fetchLimit = needsFullFetch ? 200 : limit
    const fetchOffset = needsFullFetch ? 0 : offset

    let url = `${MEDUSA_BASE_URL}/store/products?limit=${fetchLimit}&offset=${fetchOffset}&fields=${encodeURIComponent(PRODUCT_LIST_FIELDS)}`
    if (order && !isPriceSort) url += `&order=${encodeURIComponent(order)}`

    const res = await fetch(url, buildFetchInit(['products'], 3600))
    if (!res.ok) return { products: [], count: 0 }
    const data = (await res.json()) as { products: MedusaProduct[]; count: number }

    let filtered = data.products

    if (params?.material) {
      const mats = params.material
        .split(',')
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean)
      if (mats.length > 0) {
        filtered = filtered.filter((p) => {
          const tagHit = p.tags.some((t) => mats.includes(t.value.toLowerCase()))
          if (tagHit) return true
          const optionHit = getMaterialOptionValues(p).some((v) => mats.includes(v.toLowerCase()))
          return optionHit
        })
      }
    }

    if (params?.collection) {
      const handles = params.collection
        .split(',')
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean)
      if (handles.length > 0) {
        filtered = filtered.filter((p) => {
          const h = p.collection?.handle?.toLowerCase()
          return h !== undefined && handles.includes(h)
        })
      }
    }

    if (params?.minPrice !== undefined) {
      // A "₹5000+" filter should surface only priced products at/above the floor;
      // price-on-request items (no resolvable INR price) are excluded.
      filtered = filtered.filter((p) => {
        const prices = p.variants[0]?.prices ?? []
        const amount = getBasePrice(prices, 'inr')
        return amount !== undefined && amount >= params.minPrice!
      })
    }

    if (params?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => {
        const prices = p.variants[0]?.prices ?? []
        const amount = getBasePrice(prices, 'inr')
        return amount !== undefined ? amount <= params.maxPrice! : true
      })
    }

    if (params?.inStock) {
      filtered = filtered.filter((p) => p.variants.some((v) => (v.inventory_quantity ?? 1) > 0))
    }

    if (isPriceSort) {
      filtered = [...filtered].sort((a, b) => {
        const pa = getBasePrice(a.variants[0]?.prices ?? [], 'inr') ?? 0
        const pb = getBasePrice(b.variants[0]?.prices ?? [], 'inr') ?? 0
        return priceDescending ? pb - pa : pa - pb
      })
    }

    const count = needsFullFetch ? filtered.length : data.count
    const page = needsFullFetch ? filtered.slice(offset, offset + limit) : filtered

    return { products: page.map(mapMedusaProduct), count }
  } catch {
    return { products: [], count: 0 }
  }
}

// ── Search types and fetchers ─────────────────────────────────────────────────

export interface SearchProduct extends HomepageProduct {
  priceAmount: number
  category?: string
  material?: string
}

function mapSearchProduct(p: MedusaProduct): SearchProduct {
  const base = mapMedusaProduct(p)
  const prices = p.variants[0]?.prices ?? []
  const priceAmount = getBasePrice(prices, 'inr') ?? 0
  // Category comes from the product's collection; material from its "Material"
  // option (the same explicit source the listing facets use). Either may be
  // undefined, in which case that filter section simply doesn't render. Both
  // rely on *collection / *options being in PRODUCT_LIST_FIELDS (they are).
  const category = p.collection?.title || undefined
  const material = getMaterialOptionValues(p)[0]
  return { ...base, priceAmount, category, material }
}

export async function searchProducts(query: string, limit = 12): Promise<SearchProduct[]> {
  if (!query.trim()) return []
  try {
    // Must request PRODUCT_LIST_FIELDS (incl. *variants.prices) — otherwise the
    // default /store/products response omits prices, every result gets
    // priceAmount 0, and the price filter on the search page has no effect.
    const qs = new URLSearchParams({ q: query, limit: String(limit), fields: PRODUCT_LIST_FIELDS })
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products?${qs.toString()}`,
      buildFetchInit(['products', 'search'], 0),
    )
    if (!res.ok) return []
    const { products } = (await res.json()) as { products: MedusaProduct[] }
    return products.map(mapSearchProduct)
  } catch {
    return []
  }
}

export async function getSearchSuggestions(query: string): Promise<SearchProduct[]> {
  if (!query.trim()) return []
  try {
    const qs = new URLSearchParams({ q: query, limit: '5', fields: PRODUCT_LIST_FIELDS })
    const res = await fetch(`${MEDUSA_BASE_URL}/store/products?${qs.toString()}`, {
      headers: { 'x-publishable-api-key': MEDUSA_PUB_KEY },
    })
    if (!res.ok) return []
    const { products } = (await res.json()) as { products: MedusaProduct[] }
    return products.map(mapSearchProduct)
  } catch {
    return []
  }
}

// ─── Cart SDK wrappers ────────────────────────────────────────────────────────

export async function createCart(
  regionId: string,
  headers?: { authorization: string },
): Promise<HttpTypes.StoreCart> {
  // When the customer's auth header is supplied, Medusa sets cart.customer_id at
  // creation time, so the completed order belongs to the logged-in (registered)
  // customer and appears under My Orders — rather than a guest customer Medusa
  // would otherwise create from the cart email. For guests, headers is omitted
  // and the cart stays anonymous (callers associate it later if the user is
  // authenticated). This is belt-and-suspenders with associateCartWithCustomer.
  const { cart } = headers
    ? await medusa.store.cart.create({ region_id: regionId }, {}, headers)
    : await medusa.store.cart.create({ region_id: regionId })
  return cart
}

export async function getCart(cartId: string): Promise<HttpTypes.StoreCart> {
  const { cart } = await medusa.store.cart.retrieve(cartId, {
    fields:
      'id,region_id,currency_code,subtotal,tax_total,total,*items,*items.variant,*items.variant.product',
  })
  return cart
}

// The line-item mutation responses below return the cart with DEFAULT fields,
// which omit the `*items.variant.product` expansion — so the line items would
// lack the product thumbnail/title/collection. Re-fetch via getCart() so the
// cart drawer shows the product image immediately after add/update/remove.
export async function addCartItem(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<HttpTypes.StoreCart> {
  await medusa.store.cart.createLineItem(cartId, {
    variant_id: variantId,
    quantity,
  })
  return getCart(cartId)
}

export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  quantity: number,
): Promise<HttpTypes.StoreCart> {
  await medusa.store.cart.updateLineItem(cartId, lineItemId, { quantity })
  return getCart(cartId)
}

export async function removeCartItem(
  cartId: string,
  lineItemId: string,
): Promise<HttpTypes.StoreCart> {
  await medusa.store.cart.deleteLineItem(cartId, lineItemId)
  return getCart(cartId)
}

export async function getDefaultRegion(): Promise<HttpTypes.StoreRegion> {
  const { regions } = await medusa.store.region.list()
  if (!regions.length) throw new Error('No regions configured in Medusa')
  return regions[0]!
}

// ─── Checkout SDK wrappers ────────────────────────────────────────────────────

type MedusaCartAddress = {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  country_code: string
  province: string
  postal_code: string
  phone: string
}

export async function updateCartAddress(
  cartId: string,
  email: string,
  shippingAddress: MedusaCartAddress,
  billingAddress?: MedusaCartAddress,
): Promise<HttpTypes.StoreCart> {
  const { cart } = await medusa.store.cart.update(cartId, {
    email,
    shipping_address: shippingAddress,
    // Billing defaults to the shipping address (single-address checkout);
    // a distinct billing address is used when the customer provides one.
    // Without this, the order's billing address comes through empty.
    billing_address: billingAddress ?? shippingAddress,
  })
  return cart
}

export async function listCartShippingOptions(
  cartId: string,
): Promise<HttpTypes.StoreCartShippingOption[]> {
  // The JS SDK v2 does not expose cart.listShippingOptions; use the REST endpoint directly.
  const baseUrl = process.env['NEXT_PUBLIC_MEDUSA_BACKEND_URL'] ?? 'http://localhost:9000'
  const pubKey = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? ''
  const res = await fetch(`${baseUrl}/store/shipping-options?cart_id=${cartId}`, {
    headers: { 'x-publishable-api-key': pubKey },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Failed to list shipping options: ${res.status}`)
  const data = (await res.json()) as { shipping_options: HttpTypes.StoreCartShippingOption[] }
  return data.shipping_options
}

export async function addCartShippingMethod(
  cartId: string,
  optionId: string,
): Promise<HttpTypes.StoreCart> {
  const { cart } = await medusa.store.cart.addShippingMethod(cartId, { option_id: optionId })
  return cart
}

// ── Promotions ────────────────────────────────────────────────────────────────
// The JS SDK v2 does not expose cart promotion mutations, so use the REST
// endpoints directly (same approach as listCartShippingOptions above).

const CART_PROMO_FIELDS =
  'id,currency_code,subtotal,discount_total,discount_subtotal,shipping_subtotal,shipping_total,shipping_tax_total,total,*promotions'

export interface AppliedPromotions {
  // Tax-inclusive discount (what Medusa subtracts from the tax-inclusive total).
  discountTotal: number
  // Pre-tax discount — equals the promotion's face value (e.g. ₹100 "each").
  // Use this for the storefront's GST-exclusive breakdown so the Discount line
  // matches the admin promo and GST can be charged on the discounted base.
  discountSubtotal: number
  // Pre-tax portion of the discount that applies to SHIPPING (e.g. a "free
  // shipping" promo). The item portion is `discountSubtotal - shippingDiscount`.
  shippingDiscount: number
  total: number
  subtotal: number
  codes: string[]
}

function readAppliedPromotions(cart: HttpTypes.StoreCart): AppliedPromotions {
  const promotions = (cart.promotions ?? []) as Array<{ code?: string | null }>
  // These totals are returned by the Store API but missing from the SDK's
  // StoreCart type, so read them through a narrow cast.
  const t = cart as {
    discount_subtotal?: number
    shipping_subtotal?: number
    shipping_total?: number
    shipping_tax_total?: number
  }
  const shippingSubtotal = t.shipping_subtotal ?? 0
  const shippingTotal = t.shipping_total ?? 0
  const shippingTax = t.shipping_tax_total ?? 0
  // Pre-tax shipping charged = shipping_total − its tax. The pre-tax shipping
  // discount is therefore the pre-tax shipping minus what's still charged.
  const shippingDiscount = Math.max(0, shippingSubtotal - (shippingTotal - shippingTax))
  return {
    discountTotal: cart.discount_total ?? 0,
    discountSubtotal: t.discount_subtotal ?? 0,
    shippingDiscount,
    total: cart.total ?? 0,
    subtotal: cart.subtotal ?? 0,
    codes: promotions.map((p) => p.code ?? '').filter((c) => c.length > 0),
  }
}

export async function getCartPromotions(cartId: string): Promise<AppliedPromotions> {
  const { cart } = await medusa.store.cart.retrieve(cartId, { fields: CART_PROMO_FIELDS })
  return readAppliedPromotions(cart)
}

async function mutateCartPromotions(
  cartId: string,
  codes: string[],
  method: 'POST' | 'DELETE',
): Promise<AppliedPromotions> {
  const res = await fetch(`${MEDUSA_BASE_URL}/store/carts/${cartId}/promotions`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': MEDUSA_PUB_KEY },
    body: JSON.stringify({ promo_codes: codes }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `Promotion request failed (${res.status})`)
  }
  // The mutation response may not expand promotions/discount_total — re-fetch
  // with the totals fields so callers get consistent applied-code + discount data.
  return getCartPromotions(cartId)
}

export function applyCartPromotions(cartId: string, codes: string[]): Promise<AppliedPromotions> {
  return mutateCartPromotions(cartId, codes, 'POST')
}

export function removeCartPromotions(cartId: string, codes: string[]): Promise<AppliedPromotions> {
  return mutateCartPromotions(cartId, codes, 'DELETE')
}

export async function initiateCartPaymentSession(
  cart: HttpTypes.StoreCart,
  providerId: string,
): Promise<HttpTypes.StorePaymentCollection> {
  const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart, {
    provider_id: providerId,
  })
  return payment_collection
}

export async function completeCart(
  cartId: string,
): Promise<
  { type: 'order'; order: HttpTypes.StoreOrder } | { type: 'cart'; cart: HttpTypes.StoreCart }
> {
  const result = await medusa.store.cart.complete(cartId)
  return result as
    | { type: 'order'; order: HttpTypes.StoreOrder }
    | { type: 'cart'; cart: HttpTypes.StoreCart }
}

export interface RazorpayCallbackTokens {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

// Push the Razorpay modal callback tokens onto the cart's payment session and
// authorize it (HMAC verified server-side by the backend provider). Uses the
// custom /store/carts/:id/payment-authorize route — Medusa v2 has no built-in
// store route for this. Only the publishable key is sent; no secret is exposed.
export async function authorizeRazorpaySession(
  cartId: string,
  tokens: RazorpayCallbackTokens,
): Promise<void> {
  const res = await fetch(`${MEDUSA_BASE_URL}/store/carts/${cartId}/payment-authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': MEDUSA_PUB_KEY },
    body: JSON.stringify(tokens),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? 'Payment could not be verified. Please try again.')
  }
}

// Associate the cart with the authenticated customer so the completed order
// belongs to them and appears under My Orders. This MUST hit the dedicated
// `/store/carts/:id/customer` route: that route runs Medusa's
// transferCartCustomerWorkflow with `customer_id` taken from the auth context
// (the Bearer token), which actually sets cart.customer_id. The resulting order
// then carries that customer_id and shows up under My Orders.
//
// The plain `/store/carts/:id` update route does NOT do this — it only runs
// updateCartWorkflow on the request body and ignores the auth context, so an
// empty update left every order as a guest order (customer_id = null) and
// nothing appeared in the account.
export async function associateCartWithCustomer(
  cartId: string,
  headers: { authorization: string },
): Promise<void> {
  const res = await fetch(`${MEDUSA_BASE_URL}/store/carts/${cartId}/customer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': MEDUSA_PUB_KEY,
      ...headers,
    },
    body: JSON.stringify({}),
    cache: 'no-store',
  })
  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn(`Could not associate cart ${cartId} with customer:`, res.status)
  }
}
