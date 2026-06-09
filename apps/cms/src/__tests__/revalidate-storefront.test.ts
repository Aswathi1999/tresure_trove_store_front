/**
 * Unit tests for the revalidateStorefront Payload afterChange hook factory.
 *
 * Verifies that the returned hook POSTs the correct payload to the storefront
 * revalidation endpoint, reads STOREFRONT_URL and REVALIDATE_SECRET from env,
 * and swallows fetch errors so a downed storefront never breaks a CMS save.
 */

import { revalidateStorefront } from '../hooks/revalidate-storefront'

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

// The hook only destructures `doc` — narrow the arg type for test ergonomics
type DocWithSlug = { slug?: string }
type HookFn = (arg: { doc: DocWithSlug }) => Promise<DocWithSlug>

describe('revalidateStorefront', () => {
  const ENV_BACKUP = process.env

  beforeEach(() => {
    process.env = {
      ...ENV_BACKUP,
      STOREFRONT_URL: 'http://storefront.test',
      REVALIDATE_SECRET: 'test-secret',
    }
    mockFetch.mockResolvedValue({ ok: true } as Response)
  })

  afterEach(() => {
    process.env = ENV_BACKUP
    jest.clearAllMocks()
  })

  // ─── Factory ──────────────────────────────────────────────────────────────

  it('returns a function', () => {
    expect(typeof revalidateStorefront('homepage')).toBe('function')
  })

  // ─── Fetch URL ────────────────────────────────────────────────────────────

  describe('fetch URL', () => {
    it('POSTs to STOREFRONT_URL/api/revalidate', async () => {
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      await hook({ doc: {} })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://storefront.test/api/revalidate',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('falls back to http://localhost:3000 when STOREFRONT_URL is not set', async () => {
      delete process.env['STOREFRONT_URL']
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      await hook({ doc: {} })

      const [url] = mockFetch.mock.calls[0] as [string]
      expect(url).toBe('http://localhost:3000/api/revalidate')
    })
  })

  // ─── Request headers ──────────────────────────────────────────────────────

  describe('request headers', () => {
    it('sets Content-Type to application/json', async () => {
      const hook = revalidateStorefront('blog') as unknown as HookFn
      await hook({ doc: {} })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)?.['Content-Type']).toBe('application/json')
    })

    it('sends REVALIDATE_SECRET in x-revalidate-secret header', async () => {
      const hook = revalidateStorefront('blog') as unknown as HookFn
      await hook({ doc: {} })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)?.['x-revalidate-secret']).toBe('test-secret')
    })

    it('sends an empty string secret when REVALIDATE_SECRET is not set', async () => {
      delete process.env['REVALIDATE_SECRET']
      const hook = revalidateStorefront('blog') as unknown as HookFn
      await hook({ doc: {} })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)?.['x-revalidate-secret']).toBe('')
    })
  })

  // ─── Request body ─────────────────────────────────────────────────────────

  describe('request body', () => {
    it('includes the document slug in the body', async () => {
      const hook = revalidateStorefront('blog') as unknown as HookFn
      await hook({ doc: { slug: 'my-blog-post' } })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as { slug: string; type: string }
      expect(body.slug).toBe('my-blog-post')
    })

    it('sends an empty string for slug when the document has no slug', async () => {
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      await hook({ doc: {} })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as { slug: string; type: string }
      expect(body.slug).toBe('')
    })

    it('includes the content type in the body', async () => {
      const hook = revalidateStorefront('material-story') as unknown as HookFn
      await hook({ doc: { slug: 'teak-wood' } })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as { slug: string; type: string }
      expect(body.type).toBe('material-story')
    })

    it('body is valid JSON', async () => {
      const hook = revalidateStorefront('product') as unknown as HookFn
      await hook({ doc: { slug: 'okura-chair' } })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(() => JSON.parse(init.body as string)).not.toThrow()
    })
  })

  // ─── Return value ─────────────────────────────────────────────────────────

  describe('return value', () => {
    it('returns the doc unchanged', async () => {
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      const doc: DocWithSlug = { slug: 'test' }
      const result = await hook({ doc })
      expect(result).toBe(doc)
    })

    it('returns the doc even when it has no slug', async () => {
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      const doc: DocWithSlug = {}
      const result = await hook({ doc })
      expect(result).toBe(doc)
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────────

  describe('error handling', () => {
    it('does not throw when fetch rejects', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      await expect(hook({ doc: {} })).resolves.not.toThrow()
    })

    it('still returns the doc when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const hook = revalidateStorefront('homepage') as unknown as HookFn
      const doc: DocWithSlug = { slug: '' }
      const result = await hook({ doc })
      expect(result).toBe(doc)
    })
  })

  // ─── Content types ────────────────────────────────────────────────────────

  describe('content types', () => {
    const types = ['blog', 'material-story', 'homepage', 'product'] as const

    for (const type of types) {
      it(`accepts content type "${type}"`, async () => {
        const hook = revalidateStorefront(type) as unknown as HookFn
        await hook({ doc: {} })

        const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
        const body = JSON.parse(init.body as string) as { type: string }
        expect(body.type).toBe(type)
        jest.clearAllMocks()
      })
    }
  })
})
