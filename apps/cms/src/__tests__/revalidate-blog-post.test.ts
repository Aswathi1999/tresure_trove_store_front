/**
 * Unit tests for the revalidateBlogPost Payload afterChange hook.
 *
 * Verifies that the hook POSTs to the storefront revalidation endpoint only
 * when the document is published, reads env vars with correct fallbacks,
 * always sends type "blog", and swallows fetch errors so a downed storefront
 * never breaks a CMS save.
 */

import { revalidateBlogPost } from '../hooks/revalidate-blog-post'

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

type DocWithSlugAndStatus = { slug?: string; _status?: string }
type HookFn = (arg: { doc: DocWithSlugAndStatus }) => Promise<DocWithSlugAndStatus>

const hook = revalidateBlogPost as unknown as HookFn

describe('revalidateBlogPost', () => {
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

  // ─── Status guard ──────────────────────────────────────────────────────────

  describe('status guard', () => {
    it('does not call fetch when _status is "draft"', async () => {
      await hook({ doc: { _status: 'draft', slug: 'my-post' } })
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does not call fetch when _status is undefined', async () => {
      await hook({ doc: { slug: 'my-post' } })
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('calls fetch when _status is "published"', async () => {
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('returns the doc early without calling fetch for non-published status', async () => {
      const doc: DocWithSlugAndStatus = { _status: 'draft', slug: 'my-post' }
      const result = await hook({ doc })
      expect(result).toBe(doc)
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  // ─── Fetch URL ────────────────────────────────────────────────────────────

  describe('fetch URL', () => {
    it('POSTs to STOREFRONT_URL/api/revalidate', async () => {
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      expect(mockFetch).toHaveBeenCalledWith(
        'http://storefront.test/api/revalidate',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('falls back to http://localhost:3000 when STOREFRONT_URL is not set', async () => {
      delete process.env['STOREFRONT_URL']
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      const [url] = mockFetch.mock.calls[0] as [string]
      expect(url).toBe('http://localhost:3000/api/revalidate')
    })
  })

  // ─── Request headers ──────────────────────────────────────────────────────

  describe('request headers', () => {
    it('sets Content-Type to application/json', async () => {
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)?.['Content-Type']).toBe('application/json')
    })

    it('sends REVALIDATE_SECRET in x-revalidate-secret header', async () => {
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)?.['x-revalidate-secret']).toBe('test-secret')
    })

    it('sends an empty string secret when REVALIDATE_SECRET is not set', async () => {
      delete process.env['REVALIDATE_SECRET']
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)?.['x-revalidate-secret']).toBe('')
    })
  })

  // ─── Request body ─────────────────────────────────────────────────────────

  describe('request body', () => {
    it('sends type "blog" in the body', async () => {
      await hook({ doc: { _status: 'published', slug: 'my-post' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as { slug: string; type: string }
      expect(body.type).toBe('blog')
    })

    it('includes the document slug in the body', async () => {
      await hook({ doc: { _status: 'published', slug: 'why-we-use-teak' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as { slug: string; type: string }
      expect(body.slug).toBe('why-we-use-teak')
    })

    it('sends an empty string for slug when the document has no slug', async () => {
      await hook({ doc: { _status: 'published' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as { slug: string; type: string }
      expect(body.slug).toBe('')
    })

    it('body is valid JSON', async () => {
      await hook({ doc: { _status: 'published', slug: 'test-post' } })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(() => JSON.parse(init.body as string)).not.toThrow()
    })
  })

  // ─── Return value ─────────────────────────────────────────────────────────

  describe('return value', () => {
    it('returns the doc unchanged when published', async () => {
      const doc: DocWithSlugAndStatus = { _status: 'published', slug: 'my-post' }
      const result = await hook({ doc })
      expect(result).toBe(doc)
    })

    it('returns the doc unchanged when not published', async () => {
      const doc: DocWithSlugAndStatus = { _status: 'draft', slug: 'draft-post' }
      const result = await hook({ doc })
      expect(result).toBe(doc)
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────────

  describe('error handling', () => {
    it('does not throw when fetch rejects', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      await expect(hook({ doc: { _status: 'published', slug: 'my-post' } })).resolves.not.toThrow()
    })

    it('still returns the doc when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const doc: DocWithSlugAndStatus = { _status: 'published', slug: 'my-post' }
      const result = await hook({ doc })
      expect(result).toBe(doc)
    })
  })
})
