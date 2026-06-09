/**
 * Unit tests for the BlogPosts Payload CMS collection config.
 *
 * Validates the collection slug, draft versioning, admin config, field
 * definitions and their constraints, the ISR afterChange hook registration,
 * and the inline slug auto-generation beforeChange hook. All Payload and
 * hook dependencies are mocked.
 */

import type { CollectionConfig } from 'payload'

const mockRevalidateBlogPost = jest.fn()

jest.mock('../hooks/revalidate-blog-post', () => ({
  revalidateBlogPost: mockRevalidateBlogPost,
}))

type NamedField = {
  name: string
  type: string
  required?: boolean
  unique?: boolean
  hasMany?: boolean
  maxRows?: number
  relationTo?: string
  editor?: unknown
  admin?: { position?: string; readOnly?: boolean }
}

type SlugHookFn = (arg: {
  data: Record<string, unknown>
  operation: string
}) => Record<string, unknown>

describe('BlogPosts collection config', () => {
  let config: CollectionConfig

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    config = (require('../collections/blog-posts') as { BlogPosts: CollectionConfig }).BlogPosts
  })

  function field(name: string): NamedField | undefined {
    return config.fields.find((f) => 'name' in f && (f as NamedField).name === name) as
      | NamedField
      | undefined
  }

  // ─── Collection slug ───────────────────────────────────────────────────────

  it('has slug "blog-posts"', () => {
    expect(config.slug).toBe('blog-posts')
  })

  // ─── Versions / drafts ────────────────────────────────────────────────────

  describe('versions', () => {
    it('enables draft versioning', () => {
      expect(config.versions).toMatchObject({ drafts: true })
    })
  })

  // ─── Admin config ──────────────────────────────────────────────────────────

  describe('admin config', () => {
    it('uses title as the display title field', () => {
      expect(config.admin?.useAsTitle).toBe('title')
    })

    it('sets default columns to title, slug, _status, publishedAt', () => {
      expect(config.admin?.defaultColumns).toEqual(['title', 'slug', '_status', 'publishedAt'])
    })
  })

  // ─── Hooks ─────────────────────────────────────────────────────────────────

  describe('hooks', () => {
    it('registers exactly one beforeChange hook', () => {
      expect(config.hooks?.beforeChange).toHaveLength(1)
    })

    it('registers exactly one afterChange hook', () => {
      expect(config.hooks?.afterChange).toHaveLength(1)
    })

    it('registers revalidateBlogPost as the afterChange hook', () => {
      expect(config.hooks?.afterChange?.[0]).toBe(mockRevalidateBlogPost)
    })
  })

  // ─── Slug auto-generation (generateSlugFromTitle) ─────────────────────────

  describe('generateSlugFromTitle beforeChange hook', () => {
    let slugHook: SlugHookFn

    beforeAll(() => {
      slugHook = config.hooks?.beforeChange?.[0] as unknown as SlugHookFn
    })

    it('auto-generates slug from title on create when slug is not provided', () => {
      const result = slugHook({ data: { title: 'Hello World' }, operation: 'create' })
      expect((result as Record<string, unknown>).slug).toBe('hello-world')
    })

    it('lowercases the generated slug', () => {
      const result = slugHook({ data: { title: 'TEAK WOOD STORY' }, operation: 'create' })
      expect((result as Record<string, unknown>).slug).toBe('teak-wood-story')
    })

    it('replaces spaces with hyphens', () => {
      const result = slugHook({ data: { title: 'why we use teak' }, operation: 'create' })
      expect((result as Record<string, unknown>).slug).toBe('why-we-use-teak')
    })

    it('removes special characters', () => {
      const result = slugHook({ data: { title: 'Oak! #1 Choice' }, operation: 'create' })
      expect((result as Record<string, unknown>).slug).toBe('oak-1-choice')
    })

    it('does not overwrite an existing slug on create', () => {
      const result = slugHook({
        data: { title: 'Hello World', slug: 'existing-slug' },
        operation: 'create',
      })
      expect((result as Record<string, unknown>).slug).toBe('existing-slug')
    })

    it('does not generate a slug on update', () => {
      const result = slugHook({ data: { title: 'Hello World' }, operation: 'update' })
      expect((result as Record<string, unknown>).slug).toBeUndefined()
    })

    it('does not generate a slug when title is absent', () => {
      const result = slugHook({ data: {}, operation: 'create' })
      expect((result as Record<string, unknown>).slug).toBeUndefined()
    })

    it('returns the original data object when an existing slug is present', () => {
      const data = { title: 'Hello World', slug: 'existing-slug' }
      const result = slugHook({ data, operation: 'create' })
      expect(result).toBe(data)
    })
  })

  // ─── title field ──────────────────────────────────────────────────────────

  describe('title field', () => {
    it('is a text field', () => {
      expect(field('title')?.type).toBe('text')
    })

    it('is required', () => {
      expect(field('title')?.required).toBe(true)
    })
  })

  // ─── slug field ───────────────────────────────────────────────────────────

  describe('slug field', () => {
    it('is a text field', () => {
      expect(field('slug')?.type).toBe('text')
    })

    it('is unique', () => {
      expect(field('slug')?.unique).toBe(true)
    })

    it('is read-only in admin', () => {
      expect(field('slug')?.admin?.readOnly).toBe(true)
    })

    it('appears in the sidebar', () => {
      expect(field('slug')?.admin?.position).toBe('sidebar')
    })
  })

  // ─── excerpt field ────────────────────────────────────────────────────────

  describe('excerpt field', () => {
    it('is a textarea field', () => {
      expect(field('excerpt')?.type).toBe('textarea')
    })

    it('is required', () => {
      expect(field('excerpt')?.required).toBe(true)
    })
  })

  // ─── content field ────────────────────────────────────────────────────────

  describe('content field', () => {
    it('is a richText field', () => {
      expect(field('content')?.type).toBe('richText')
    })

    it('is required', () => {
      expect(field('content')?.required).toBe(true)
    })

    it('has an editor configured', () => {
      expect(field('content')?.editor).toBeDefined()
    })
  })

  // ─── coverImage field ─────────────────────────────────────────────────────

  describe('coverImage field', () => {
    it('is an upload field', () => {
      expect(field('coverImage')?.type).toBe('upload')
    })

    it('is required', () => {
      expect(field('coverImage')?.required).toBe(true)
    })

    it('relates to the media collection', () => {
      expect(field('coverImage')?.relationTo).toBe('media')
    })
  })

  // ─── tags field ───────────────────────────────────────────────────────────

  describe('tags field', () => {
    it('is an array field', () => {
      expect(field('tags')?.type).toBe('array')
    })
  })

  // ─── author field ─────────────────────────────────────────────────────────

  describe('author field', () => {
    it('is a text field', () => {
      expect(field('author')?.type).toBe('text')
    })
  })

  // ─── relatedPosts field ───────────────────────────────────────────────────

  describe('relatedPosts field', () => {
    it('is a relationship field', () => {
      expect(field('relatedPosts')?.type).toBe('relationship')
    })

    it('relates to the blog-posts collection', () => {
      expect(field('relatedPosts')?.relationTo).toBe('blog-posts')
    })

    it('allows multiple related posts', () => {
      expect(field('relatedPosts')?.hasMany).toBe(true)
    })

    it('allows at most 3 related posts', () => {
      expect(field('relatedPosts')?.maxRows).toBe(3)
    })

    it('appears in the sidebar', () => {
      expect(field('relatedPosts')?.admin?.position).toBe('sidebar')
    })
  })

  // ─── publishedAt field ────────────────────────────────────────────────────

  describe('publishedAt field', () => {
    it('is a date field', () => {
      expect(field('publishedAt')?.type).toBe('date')
    })

    it('appears in the sidebar', () => {
      expect(field('publishedAt')?.admin?.position).toBe('sidebar')
    })
  })

  // ─── Required fields coverage ─────────────────────────────────────────────

  describe('required fields', () => {
    const requiredFields = ['title', 'excerpt', 'content', 'coverImage']

    for (const name of requiredFields) {
      it(`"${name}" is marked required`, () => {
        expect(field(name)?.required).toBe(true)
      })
    }
  })

  // ─── Total field count ────────────────────────────────────────────────────

  it('defines exactly 9 fields', () => {
    expect(config.fields).toHaveLength(9)
  })
})
