import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const revalidatePathMock = vi.hoisted(() => vi.fn())
const revalidateTagMock = vi.hoisted(() => vi.fn())
const nextResponseJsonMock = vi.hoisted(() =>
  vi.fn((data: unknown, init?: { status?: number }) => ({ data, status: init?.status ?? 200 })),
)

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}))
vi.mock('next/server', () => ({ NextResponse: { json: nextResponseJsonMock } }))

import { POST } from './route'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: object, secret?: string) {
  return {
    headers: {
      get: (name: string) => (name === 'x-revalidate-secret' ? (secret ?? null) : null),
    },
    json: async () => body,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('REVALIDATE_SECRET', 'test-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ─── Secret validation ─────────────────────────────────────────────────────

  it('returns 401 when the x-revalidate-secret header is absent', async () => {
    await POST(makeRequest({ type: 'blog', slug: 'test' }) as never)
    expect(nextResponseJsonMock).toHaveBeenCalledWith(
      { message: 'Invalid secret' },
      { status: 401 },
    )
  })

  it('returns 401 when the x-revalidate-secret header value is wrong', async () => {
    await POST(makeRequest({ type: 'blog', slug: 'test' }, 'bad-secret') as never)
    expect(nextResponseJsonMock).toHaveBeenCalledWith(
      { message: 'Invalid secret' },
      { status: 401 },
    )
  })

  it('does not call revalidatePath or revalidateTag when the secret is invalid', async () => {
    await POST(makeRequest({ type: 'blog', slug: 'test' }, 'bad-secret') as never)
    expect(revalidatePathMock).not.toHaveBeenCalled()
    expect(revalidateTagMock).not.toHaveBeenCalled()
  })

  // ─── type: "blog" ──────────────────────────────────────────────────────────

  describe('type: "blog"', () => {
    it('revalidates the journal paths and the blog tag', async () => {
      await POST(makeRequest({ type: 'blog', slug: 'my-post' }, 'test-secret') as never)
      expect(revalidatePathMock).toHaveBeenCalledWith('/journal')
      expect(revalidatePathMock).toHaveBeenCalledWith('/journal/my-post')
      expect(revalidatePathMock).toHaveBeenCalledTimes(2)
      expect(revalidateTagMock).toHaveBeenCalledWith('blog')
    })

    it('returns revalidated: true with the blog paths and tags', async () => {
      await POST(makeRequest({ type: 'blog', slug: 'my-post' }, 'test-secret') as never)
      expect(nextResponseJsonMock).toHaveBeenCalledWith({
        revalidated: true,
        paths: ['/journal', '/journal/my-post'],
        tags: ['blog'],
      })
    })
  })

  // ─── type: "material-story" ────────────────────────────────────────────────

  describe('type: "material-story"', () => {
    it('revalidates the materials paths and the material-stories tag', async () => {
      await POST(makeRequest({ type: 'material-story', slug: 'oak' }, 'test-secret') as never)
      expect(revalidatePathMock).toHaveBeenCalledWith('/materials')
      expect(revalidatePathMock).toHaveBeenCalledWith('/materials/oak')
      expect(revalidatePathMock).toHaveBeenCalledTimes(2)
      expect(revalidateTagMock).toHaveBeenCalledWith('material-stories')
    })

    it('returns revalidated: true with the material paths and tags', async () => {
      await POST(makeRequest({ type: 'material-story', slug: 'oak' }, 'test-secret') as never)
      expect(nextResponseJsonMock).toHaveBeenCalledWith({
        revalidated: true,
        paths: ['/materials', '/materials/oak'],
        tags: ['material-stories'],
      })
    })
  })

  // ─── type: "homepage" ──────────────────────────────────────────────────────

  describe('type: "homepage"', () => {
    it('revalidates / and the homepage tag', async () => {
      await POST(makeRequest({ type: 'homepage', slug: '' }, 'test-secret') as never)
      expect(revalidatePathMock).toHaveBeenCalledWith('/')
      expect(revalidatePathMock).toHaveBeenCalledTimes(1)
      expect(revalidateTagMock).toHaveBeenCalledWith('homepage')
    })

    it('returns revalidated: true with the homepage path and tag', async () => {
      await POST(makeRequest({ type: 'homepage', slug: '' }, 'test-secret') as never)
      expect(nextResponseJsonMock).toHaveBeenCalledWith({
        revalidated: true,
        paths: ['/'],
        tags: ['homepage'],
      })
    })
  })

  // ─── type: "product" ───────────────────────────────────────────────────────

  describe('type: "product"', () => {
    it('revalidates the homepage, listing, PDP paths and the products tag', async () => {
      await POST(makeRequest({ type: 'product', slug: 'okura-chair' }, 'test-secret') as never)
      expect(revalidatePathMock).toHaveBeenCalledWith('/')
      expect(revalidatePathMock).toHaveBeenCalledWith('/products')
      expect(revalidatePathMock).toHaveBeenCalledWith('/products/okura-chair')
      expect(revalidatePathMock).toHaveBeenCalledTimes(3)
      expect(revalidateTagMock).toHaveBeenCalledWith('products')
    })

    it('returns revalidated: true with the product paths and tags', async () => {
      await POST(makeRequest({ type: 'product', slug: 'okura-chair' }, 'test-secret') as never)
      expect(nextResponseJsonMock).toHaveBeenCalledWith({
        revalidated: true,
        paths: ['/', '/products', '/products/okura-chair'],
        tags: ['products'],
      })
    })
  })
})
