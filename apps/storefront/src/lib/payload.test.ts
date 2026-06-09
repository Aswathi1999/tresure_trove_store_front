import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BlogPost, PaginatedResponse } from '@TreasureTrove/types'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

import { getPosts, getPostBySlug } from './payload'

// ── Helpers ───────────────────────────────────────────────────────────────────

function okResponse(body: unknown): Response {
  return { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve(body) } as Response
}

function errorResponse(status = 500, statusText = 'Internal Server Error'): Response {
  return { ok: false, status, statusText } as Response
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockPost: BlogPost = {
  id: 'post_01',
  title: 'Why we use teak',
  slug: 'why-we-use-teak',
  excerpt: 'An introduction to teak wood',
  content: {},
  coverImage: 'https://cdn.example.com/teak.jpg',
  publishedAt: '2026-01-01T00:00:00.000Z',
  _status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const pagedResponse: PaginatedResponse<BlogPost> = {
  docs: [mockPost],
  totalDocs: 1,
  page: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

// ── getPosts ──────────────────────────────────────────────────────────────────

describe('getPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetch with the correct blog-posts path and query parameters', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    await getPosts()
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/blog-posts')
    expect(url).toContain('where[status][equals]=published')
    expect(url).toContain('sort=-publishedAt')
    expect(url).toContain('page=1')
    expect(url).toContain('limit=10')
    expect(url).toContain('depth=1')
  })

  it('uses the supplied page number in the URL', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    await getPosts(3)
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('page=3')
  })

  it('passes revalidate: 1800 and tags: ["blog"] in the next option', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    await getPosts()
    const [, options] = fetchMock.mock.calls[0] as [
      string,
      { next: { revalidate: number; tags: string[] } },
    ]
    expect(options.next.revalidate).toBe(1800)
    expect(options.next.tags).toContain('blog')
  })

  it('returns the paginated response from Payload', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    const result = await getPosts()
    expect(result).toEqual(pagedResponse)
  })

  it('throws when Payload returns a non-OK response', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(500, 'Internal Server Error'))
    await expect(getPosts()).rejects.toThrow('Payload fetch failed: 500 Internal Server Error')
  })
})

// ── getPostBySlug ─────────────────────────────────────────────────────────────

describe('getPostBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetch with the encoded slug and required filter parameters', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    await getPostBySlug('why-we-use-teak')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/blog-posts')
    expect(url).toContain('where[slug][equals]=why-we-use-teak')
    expect(url).toContain('where[status][equals]=published')
    expect(url).toContain('depth=1')
    expect(url).toContain('limit=1')
  })

  it('URL-encodes slugs containing special characters', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ ...pagedResponse, docs: [] }))
    await getPostBySlug('hello world & more')
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain(encodeURIComponent('hello world & more'))
  })

  it('passes revalidate: 1800 and per-post cache tags in the next option', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    await getPostBySlug('why-we-use-teak')
    const [, options] = fetchMock.mock.calls[0] as [
      string,
      { next: { revalidate: number; tags: string[] } },
    ]
    expect(options.next.revalidate).toBe(1800)
    expect(options.next.tags).toContain('blog')
    expect(options.next.tags).toContain('blog-why-we-use-teak')
  })

  it('returns the first doc when a matching post is found', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(pagedResponse))
    const result = await getPostBySlug('why-we-use-teak')
    expect(result).toEqual(mockPost)
  })

  it('returns null when no posts match the slug', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ ...pagedResponse, docs: [] }))
    const result = await getPostBySlug('non-existent')
    expect(result).toBeNull()
  })

  it('returns null when Payload returns a non-OK response', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(404, 'Not Found'))
    const result = await getPostBySlug('missing')
    expect(result).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'))
    const result = await getPostBySlug('why-we-use-teak')
    expect(result).toBeNull()
  })
})
