import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  notFound: vi.fn().mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/lib/payload', () => ({
  getPostBySlug: vi.fn(),
  getPosts: vi.fn(),
}))

vi.mock('@/components/journal/PostDetail', () => ({
  PostDetail: ({ post }: { post: { title: string } }) => (
    <div data-testid="post-detail">{post.title}</div>
  ),
}))

vi.mock('@/components/journal/RelatedPosts', () => ({
  RelatedPosts: ({ posts }: { posts: unknown[] }) => (
    <div data-testid="related-posts" data-count={posts.length} />
  ),
}))

vi.mock('@/components/ui/Breadcrumb', () => ({
  Breadcrumb: () => <nav data-testid="breadcrumb" />,
}))

import JournalPostPage from './page'
import { getPostBySlug } from '@/lib/payload'
import { notFound } from 'next/navigation'
import type { BlogPost } from '@TreasureTrove/types'

const mockPost: BlogPost = {
  id: 'post_01',
  title: 'The Art of Handcrafted Brass',
  slug: 'art-of-handcrafted-brass',
  excerpt: 'A deep dive into brass artisanship.',
  content: { root: { children: [] } },
  coverImage: 'https://cdn.example.com/brass.jpg',
  publishedAt: '2026-06-15T12:00:00.000Z',
  _status: 'published',
  relatedPosts: [],
  createdAt: '2026-06-15T12:00:00.000Z',
  updatedAt: '2026-06-15T12:00:00.000Z',
}

const params = (slug: string) => Promise.resolve({ slug })

describe('JournalPostPage — Post Not Found', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls notFound() when the post does not exist', async () => {
    vi.mocked(getPostBySlug).mockResolvedValueOnce(null)
    await expect(JournalPostPage({ params: params('missing-post') })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFound).toHaveBeenCalledOnce()
  })

  it('renders PostDetail with the post when found', async () => {
    vi.mocked(getPostBySlug).mockResolvedValueOnce(mockPost)
    const result = await JournalPostPage({ params: params('art-of-handcrafted-brass') })
    render(result)
    expect(screen.getByTestId('post-detail')).toBeInTheDocument()
    expect(screen.getByText('The Art of Handcrafted Brass')).toBeInTheDocument()
  })

  it('passes only fully-resolved BlogPost objects to RelatedPosts (filters out string IDs)', async () => {
    const relatedPost: BlogPost = { ...mockPost, id: 'post_02', slug: 'related-post' }
    vi.mocked(getPostBySlug).mockResolvedValueOnce({
      ...mockPost,
      relatedPosts: [relatedPost, 'string-id-only'],
    })
    const result = await JournalPostPage({ params: params('art-of-handcrafted-brass') })
    render(result)
    expect(screen.getByTestId('related-posts')).toHaveAttribute('data-count', '1')
  })
})
