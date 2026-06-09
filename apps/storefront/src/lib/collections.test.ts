import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Medusa JS SDK — medusa.ts instantiates it at module scope
vi.mock('@medusajs/js-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    store: { cart: {} },
  })),
}))

// Stub global fetch before tests run
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

import { getCollections, getCollectionByHandle, getProductsByCollection } from './medusa'

// ── Helpers ───────────────────────────────────────────────────────────────────

function okResponse(body: unknown): Response {
  return { ok: true, json: () => Promise.resolve(body) } as Response
}

function errorResponse(): Response {
  return { ok: false } as Response
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const rawCollection = {
  id: 'col_01',
  title: 'Living Room',
  handle: 'living-room',
  metadata: { featured: true },
}

const rawProduct = {
  id: 'prod_01',
  title: 'Ōkura Sofa',
  handle: 'okura-sofa',
  thumbnail: 'https://cdn.example.com/sofa.jpg',
  tags: [],
  variants: [],
}

// ── getCollections ─────────────────────────────────────────────────────────────

describe('getCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a mapped HomepageCollection for each API result', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [rawCollection] }))
    const result = await getCollections()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'col_01',
      title: 'Living Room',
      handle: 'living-room',
      imageUrl: null,
      href: '/collections/living-room',
      metadata: { featured: true },
    })
  })

  it('calls fetch with a URL that contains /store/collections', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [] }))
    await getCollections()
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/store/collections')
  })

  it('sets imageUrl to null for every collection', async () => {
    const second = { ...rawCollection, id: 'col_02', handle: 'bedroom', title: 'Bedroom' }
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [rawCollection, second] }))
    const result = await getCollections()
    expect(result).toHaveLength(2)
    expect(result.every((c) => c.imageUrl === null)).toBe(true)
  })

  it('builds the href from the collection handle', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [rawCollection] }))
    const [col] = await getCollections()
    expect(col!.href).toBe('/collections/living-room')
  })

  it('returns [] when the response status is not ok', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse())
    const result = await getCollections()
    expect(result).toEqual([])
  })

  it('returns [] when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'))
    const result = await getCollections()
    expect(result).toEqual([])
  })
})

// ── getCollectionByHandle ──────────────────────────────────────────────────────

describe('getCollectionByHandle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a CollectionDetail when the collection is found', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [rawCollection] }))
    const result = await getCollectionByHandle('living-room')
    expect(result).toEqual({
      id: 'col_01',
      title: 'Living Room',
      handle: 'living-room',
      metadata: { featured: true },
    })
  })

  it('calls fetch with the handle encoded in the query string', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [rawCollection] }))
    await getCollectionByHandle('living-room')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/store/collections')
    expect(url).toContain('handle=living-room')
  })

  it('URL-encodes handles that contain special characters', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [] }))
    await getCollectionByHandle('bed & bath')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain(encodeURIComponent('bed & bath'))
  })

  it('returns null when the collections array is empty (handle not found)', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [] }))
    const result = await getCollectionByHandle('non-existent')
    expect(result).toBeNull()
  })

  it('returns null when the response status is not ok', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse())
    const result = await getCollectionByHandle('living-room')
    expect(result).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('timeout'))
    const result = await getCollectionByHandle('living-room')
    expect(result).toBeNull()
  })

  it('sends the publishable API key header', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ collections: [rawCollection] }))
    await getCollectionByHandle('living-room')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['x-publishable-api-key']).toBeDefined()
  })
})

// ── getProductsByCollection ────────────────────────────────────────────────────

describe('getProductsByCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mapped products and count on success', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [rawProduct], count: 1 }))
    const result = await getProductsByCollection('col_01')
    expect(result.count).toBe(1)
    expect(result.products).toHaveLength(1)
    expect(result.products[0]!.id).toBe('prod_01')
    expect(result.products[0]!.href).toBe('/products/okura-sofa')
  })

  it('includes collection_id[] in the request URL', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('collection_id')
    expect(url).toContain('col_01')
  })

  it('uses default limit=12 and offset=0 when no filters are provided', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('limit=12')
    expect(url).toContain('offset=0')
  })

  it('applies limit and offset from the filters argument', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01', { limit: 24, offset: 48 })
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('limit=24')
    expect(url).toContain('offset=48')
  })

  it('appends the order param when provided', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01', { order: '-created_at' })
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('order=-created_at')
  })

  it('omits the order param when order is not provided', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).not.toContain('order=')
  })

  it('appends price_gte when provided', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01', { price_gte: 10000 })
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('price_gte=10000')
  })

  it('appends price_lte when provided', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01', { price_lte: 50000 })
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('price_lte=50000')
  })

  it('appends category_id[] when provided', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [], count: 0 }))
    await getProductsByCollection('col_01', { category_id: 'cat_01' })
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('cat_01')
  })

  it('returns { products: [], count: 0 } when the response status is not ok', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse())
    const result = await getProductsByCollection('col_01')
    expect(result).toEqual({ products: [], count: 0 })
  })

  it('returns { products: [], count: 0 } when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('timeout'))
    const result = await getProductsByCollection('col_01')
    expect(result).toEqual({ products: [], count: 0 })
  })

  it('maps thumbnail to imageUrl', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ products: [rawProduct], count: 1 }))
    const result = await getProductsByCollection('col_01')
    expect(result.products[0]!.imageUrl).toBe('https://cdn.example.com/sofa.jpg')
  })

  it('falls back to empty string when thumbnail is null', async () => {
    const noThumb = { ...rawProduct, thumbnail: null }
    fetchMock.mockResolvedValueOnce(okResponse({ products: [noThumb], count: 1 }))
    const result = await getProductsByCollection('col_01')
    expect(result.products[0]!.imageUrl).toBe('')
  })

  it('attaches a BESTSELLER badge to products tagged "bestseller"', async () => {
    const bestseller = { ...rawProduct, tags: [{ value: 'bestseller' }] }
    fetchMock.mockResolvedValueOnce(okResponse({ products: [bestseller], count: 1 }))
    const result = await getProductsByCollection('col_01')
    expect(result.products[0]!.badge).toBe('BESTSELLER')
    expect(result.products[0]!.badgeVariant).toBe('orange')
  })

  it('attaches a NEW badge to products tagged "new-arrival"', async () => {
    const newArrival = { ...rawProduct, tags: [{ value: 'new-arrival' }] }
    fetchMock.mockResolvedValueOnce(okResponse({ products: [newArrival], count: 1 }))
    const result = await getProductsByCollection('col_01')
    expect(result.products[0]!.badge).toBe('NEW')
    expect(result.products[0]!.badgeVariant).toBe('gold')
  })
})
