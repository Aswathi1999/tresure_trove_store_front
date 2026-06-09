/**
 * Unit tests for the HomepageContent Payload CMS global schema.
 *
 * Validates slug, field definitions, required constraints, default values,
 * and that the ISR revalidation hook is registered for the "homepage" type.
 * All Payload CMS and lexical editor dependencies are mocked in-process.
 */

import type { GlobalConfig } from 'payload'

const mockRevalidateStorefront = jest.fn(() => jest.fn())

jest.mock('@payloadcms/richtext-lexical', () => ({
  lexicalEditor: jest.fn(() => ({ type: 'lexical' })),
}))

jest.mock('../hooks/revalidate-storefront', () => ({
  revalidateStorefront: mockRevalidateStorefront,
}))

type NamedField = {
  name: string
  type: string
  required?: boolean
  defaultValue?: unknown
  relationTo?: string
  fields?: NamedField[]
}

describe('HomepageContent global config', () => {
  let config: GlobalConfig
  // Capture mock call info before clearMocks (set in jest config) wipes it
  let revalidateCalledWith: string | undefined

  beforeAll(() => {
    config = // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('../globals/HomepageContent') as { HomepageContent: GlobalConfig }).HomepageContent
    const firstCall = mockRevalidateStorefront.mock.calls[0] as unknown as [string] | undefined
    revalidateCalledWith = firstCall?.[0]
  })

  function field(name: string): NamedField | undefined {
    return config.fields.find((f) => 'name' in f && (f as NamedField).name === name) as
      | NamedField
      | undefined
  }

  // ─── Slug ─────────────────────────────────────────────────────────────────

  it('has slug "homepage-content"', () => {
    expect(config.slug).toBe('homepage-content')
  })

  // ─── Hooks ────────────────────────────────────────────────────────────────

  describe('hooks', () => {
    it('registers exactly one afterChange hook', () => {
      expect(config.hooks?.afterChange).toHaveLength(1)
    })

    it('creates the ISR hook for the "homepage" content type', () => {
      expect(revalidateCalledWith).toBe('homepage')
    })
  })

  // ─── Access control ───────────────────────────────────────────────────────

  describe('access control', () => {
    type ReadFn = (args: Record<string, unknown>) => boolean
    type WriteFn = (args: { req: { user: unknown } }) => boolean

    it('read is open to the public', () => {
      const readFn = config.access?.read as ReadFn | undefined
      expect(readFn?.({})).toBe(true)
    })

    it('update returns true for an authenticated user', () => {
      const writeFn = config.access?.update as WriteFn | undefined
      expect(writeFn?.({ req: { user: { id: 'usr_1' } } })).toBe(true)
    })

    it('update returns false when user is null', () => {
      const writeFn = config.access?.update as WriteFn | undefined
      expect(writeFn?.({ req: { user: null } })).toBe(false)
    })
  })

  // ─── Hero section ─────────────────────────────────────────────────────────

  describe('hero fields', () => {
    it('heroHeadline is a required text field', () => {
      expect(field('heroHeadline')?.type).toBe('text')
      expect(field('heroHeadline')?.required).toBe(true)
    })

    it('heroHeadline defaults to "Crafted for Living"', () => {
      expect(field('heroHeadline')?.defaultValue).toBe('Crafted for Living')
    })

    it('heroSubtext is an optional text field', () => {
      expect(field('heroSubtext')?.type).toBe('text')
      expect(field('heroSubtext')?.required).toBeUndefined()
    })

    it('heroCtaLabel is an optional text field', () => {
      expect(field('heroCtaLabel')?.type).toBe('text')
      expect(field('heroCtaLabel')?.required).toBeUndefined()
    })

    it('heroCtaLink is an optional text field', () => {
      expect(field('heroCtaLink')?.type).toBe('text')
      expect(field('heroCtaLink')?.required).toBeUndefined()
    })

    it('heroBackgroundImage is an upload field related to the media collection', () => {
      expect(field('heroBackgroundImage')?.type).toBe('upload')
      expect(field('heroBackgroundImage')?.relationTo).toBe('media')
    })

    it('heroEditorPickTitle is an optional text field', () => {
      expect(field('heroEditorPickTitle')?.type).toBe('text')
      expect(field('heroEditorPickTitle')?.required).toBeUndefined()
    })

    it('heroEditorPickLink is an optional text field', () => {
      expect(field('heroEditorPickLink')?.type).toBe('text')
      expect(field('heroEditorPickLink')?.required).toBeUndefined()
    })
  })

  // ─── Marquee section ──────────────────────────────────────────────────────

  describe('marquee fields', () => {
    it('marqueeItems is an array field', () => {
      expect(field('marqueeItems')?.type).toBe('array')
    })

    it('marqueeItems.text sub-field is required', () => {
      const textField = field('marqueeItems')?.fields?.find((f) => f.name === 'text')
      expect(textField?.required).toBe(true)
    })

    it('marqueeItems.text is a text type', () => {
      const textField = field('marqueeItems')?.fields?.find((f) => f.name === 'text')
      expect(textField?.type).toBe('text')
    })

    it('marqueeItems.order is a number sub-field', () => {
      const orderField = field('marqueeItems')?.fields?.find((f) => f.name === 'order')
      expect(orderField?.type).toBe('number')
    })

    it('marqueeItems.order is optional', () => {
      const orderField = field('marqueeItems')?.fields?.find((f) => f.name === 'order')
      expect(orderField?.required).toBeUndefined()
    })
  })

  // ─── Featured collection section ──────────────────────────────────────────

  describe('featured collection fields', () => {
    it('featuredCollectionTitle is an optional text field', () => {
      expect(field('featuredCollectionTitle')?.type).toBe('text')
      expect(field('featuredCollectionTitle')?.required).toBeUndefined()
    })

    it('featuredCollectionHandle is an optional text field', () => {
      expect(field('featuredCollectionHandle')?.type).toBe('text')
      expect(field('featuredCollectionHandle')?.required).toBeUndefined()
    })
  })

  // ─── Brand philosophy section ─────────────────────────────────────────────

  describe('brand philosophy fields', () => {
    it('brandPhilosophyEyebrow is an optional text field', () => {
      expect(field('brandPhilosophyEyebrow')?.type).toBe('text')
      expect(field('brandPhilosophyEyebrow')?.required).toBeUndefined()
    })

    it('brandPhilosophyHeading is a text field', () => {
      expect(field('brandPhilosophyHeading')?.type).toBe('text')
    })

    it('brandPhilosophyBody is a richText field', () => {
      expect(field('brandPhilosophyBody')?.type).toBe('richText')
    })

    it('brandPhilosophyBody editor is set to the return value of lexicalEditor', () => {
      // The mock returns { type: 'lexical' } — check the field carries it
      const f = field('brandPhilosophyBody') as { editor?: Record<string, unknown> }
      expect(f?.editor).toBeDefined()
      expect(f?.editor?.['type']).toBe('lexical')
    })

    it('brandPhilosophyImage is an upload field related to the media collection', () => {
      expect(field('brandPhilosophyImage')?.type).toBe('upload')
      expect(field('brandPhilosophyImage')?.relationTo).toBe('media')
    })

    it('brandPhilosophyCtaText is an optional text field', () => {
      expect(field('brandPhilosophyCtaText')?.type).toBe('text')
      expect(field('brandPhilosophyCtaText')?.required).toBeUndefined()
    })

    it('brandPhilosophyCtaLink is an optional text field', () => {
      expect(field('brandPhilosophyCtaLink')?.type).toBe('text')
      expect(field('brandPhilosophyCtaLink')?.required).toBeUndefined()
    })
  })
})
