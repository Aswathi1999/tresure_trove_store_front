/**
 * Unit tests for the MaterialStories Payload CMS collection config.
 *
 * Validates slug, admin config, field definitions, required constraints,
 * default values, and that the ISR revalidation hook is registered for
 * the "material" type. All Payload and hook dependencies are mocked.
 */

import type { CollectionConfig } from 'payload'

const mockRevalidateStorefront = jest.fn(() => jest.fn())

jest.mock('../hooks/revalidate-storefront', () => ({
  revalidateStorefront: mockRevalidateStorefront,
}))

type SelectOption = { label: string; value: string }

type NamedField = {
  name: string
  type: string
  required?: boolean
  unique?: boolean
  min?: number
  max?: number
  defaultValue?: unknown
  relationTo?: string
  options?: (string | SelectOption)[]
  editor?: unknown
  admin?: { position?: string; readOnly?: boolean; hidden?: boolean }
}

describe('MaterialStories collection config', () => {
  let config: CollectionConfig
  let revalidateCalledWith: string | undefined

  beforeAll(() => {
    config = // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('../collections/material-stories') as { MaterialStories: CollectionConfig })
        .MaterialStories
    const firstCall = mockRevalidateStorefront.mock.calls[0] as unknown as [string] | undefined
    revalidateCalledWith = firstCall?.[0]
  })

  function field(name: string): NamedField | undefined {
    return config.fields.find((f) => 'name' in f && (f as NamedField).name === name) as
      | NamedField
      | undefined
  }

  // ─── Collection slug ───────────────────────────────────────────────────────

  it('has slug "material-stories"', () => {
    expect(config.slug).toBe('material-stories')
  })

  // ─── Admin config ──────────────────────────────────────────────────────────

  describe('admin config', () => {
    it('uses woodType as the display title field', () => {
      expect(config.admin?.useAsTitle).toBe('woodType')
    })

    it('sets default columns to woodType, slug, origin, sustainabilityRating, publishedAt', () => {
      expect(config.admin?.defaultColumns).toEqual([
        'woodType',
        'slug',
        'origin',
        'sustainabilityRating',
        'publishedAt',
      ])
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

    it('creates the ISR hook for the "material" content type', () => {
      expect(revalidateCalledWith).toBe('material')
    })
  })

  // ─── woodType field ───────────────────────────────────────────────────────

  describe('woodType field', () => {
    it('is a select field', () => {
      expect(field('woodType')?.type).toBe('select')
    })

    it('is required', () => {
      expect(field('woodType')?.required).toBe(true)
    })

    it('is unique', () => {
      expect(field('woodType')?.unique).toBe(true)
    })

    it('has exactly 5 options', () => {
      expect(field('woodType')?.options).toHaveLength(5)
    })

    it.each(['teak', 'walnut', 'oak', 'mango', 'rosewood'])(
      'has "%s" as a valid option',
      (value) => {
        const options = field('woodType')?.options as SelectOption[] | undefined
        expect(options?.some((o) => o.value === value)).toBe(true)
      },
    )
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

  // ─── sustainabilityRating field ───────────────────────────────────────────

  describe('sustainabilityRating field', () => {
    it('is a number field', () => {
      expect(field('sustainabilityRating')?.type).toBe('number')
    })

    it('is required', () => {
      expect(field('sustainabilityRating')?.required).toBe(true)
    })

    it('has min value of 1', () => {
      expect(field('sustainabilityRating')?.min).toBe(1)
    })

    it('has max value of 5', () => {
      expect(field('sustainabilityRating')?.max).toBe(5)
    })

    it('appears in the sidebar', () => {
      expect(field('sustainabilityRating')?.admin?.position).toBe('sidebar')
    })
  })

  // ─── origin field ─────────────────────────────────────────────────────────

  describe('origin field', () => {
    it('is a text field', () => {
      expect(field('origin')?.type).toBe('text')
    })

    it('is required', () => {
      expect(field('origin')?.required).toBe(true)
    })
  })

  // ─── description field ────────────────────────────────────────────────────

  describe('description field', () => {
    it('is a richText field', () => {
      expect(field('description')?.type).toBe('richText')
    })

    it('is required', () => {
      expect(field('description')?.required).toBe(true)
    })

    it('has an editor configured', () => {
      expect(field('description')?.editor).toBeDefined()
    })
  })

  // ─── featuredImage field ──────────────────────────────────────────────────

  describe('featuredImage field', () => {
    it('is an upload field', () => {
      expect(field('featuredImage')?.type).toBe('upload')
    })

    it('is required', () => {
      expect(field('featuredImage')?.required).toBe(true)
    })

    it('relates to the media collection', () => {
      expect(field('featuredImage')?.relationTo).toBe('media')
    })
  })

  // ─── publishedAt field ────────────────────────────────────────────────────

  describe('publishedAt field', () => {
    it('is a date field', () => {
      expect(field('publishedAt')?.type).toBe('date')
    })

    it('has a defaultValue function', () => {
      expect(typeof field('publishedAt')?.defaultValue).toBe('function')
    })

    it('defaultValue returns a Date', () => {
      const dv = field('publishedAt')?.defaultValue
      expect(typeof dv === 'function' ? dv() : dv).toBeInstanceOf(Date)
    })

    it('is not hidden in admin', () => {
      expect(field('publishedAt')?.admin?.hidden).toBe(false)
    })

    it('appears in the sidebar', () => {
      expect(field('publishedAt')?.admin?.position).toBe('sidebar')
    })
  })

  // ─── Required fields coverage ─────────────────────────────────────────────

  describe('required fields', () => {
    const requiredFields = [
      'woodType',
      'sustainabilityRating',
      'origin',
      'description',
      'featuredImage',
    ]

    for (const name of requiredFields) {
      it(`"${name}" is marked required`, () => {
        expect(field(name)?.required).toBe(true)
      })
    }
  })

  // ─── Total field count ────────────────────────────────────────────────────

  it('defines exactly 7 fields', () => {
    expect(config.fields).toHaveLength(7)
  })
})
