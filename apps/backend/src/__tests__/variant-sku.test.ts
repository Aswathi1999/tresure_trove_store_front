/**
 * Unit tests for src/lib/variant-sku.ts — the shared SKU generation helpers
 * used by the admin auto-SKU middleware (and the backstop subscriber).
 */
import {
  slug,
  randomSuffix,
  buildVariantSku,
  hasBlankSku,
  optionValuesOf,
} from '../lib/variant-sku'

describe('slug', () => {
  it('uppercases and hyphenates', () => {
    expect(slug('White Wood')).toBe('WHITE-WOOD')
  })
  it('strips leading/trailing separators and collapses runs', () => {
    expect(slug('  -Oak / Matte-  ')).toBe('OAK-MATTE')
  })
  it('returns empty string for nullish input', () => {
    expect(slug(null)).toBe('')
    expect(slug(undefined)).toBe('')
    expect(slug('')).toBe('')
  })
  it('caps length at 24 characters', () => {
    expect(slug('a'.repeat(40)).length).toBe(24)
  })
})

describe('randomSuffix', () => {
  it('returns the requested length of uppercase hex', () => {
    const s = randomSuffix(5)
    expect(s).toHaveLength(5)
    expect(s).toMatch(/^[0-9A-F]+$/)
  })
  it('is highly unlikely to collide across calls', () => {
    const set = new Set(Array.from({ length: 200 }, () => randomSuffix()))
    expect(set.size).toBeGreaterThan(195)
  })
})

describe('buildVariantSku', () => {
  it('joins handle, option values and suffix', () => {
    expect(buildVariantSku('sunappi', ['White', 'Wood'], 'AB12C')).toBe('SUNAPPI-WHITE-WOOD-AB12C')
  })
  it('omits empty option values', () => {
    expect(buildVariantSku('sofa', [], 'Z9')).toBe('SOFA-Z9')
  })
})

describe('hasBlankSku', () => {
  it('is true for null, undefined, empty and whitespace', () => {
    expect(hasBlankSku({ sku: null })).toBe(true)
    expect(hasBlankSku({})).toBe(true)
    expect(hasBlankSku({ sku: '   ' })).toBe(true)
    expect(hasBlankSku(null)).toBe(true)
  })
  it('is false when a real SKU is present', () => {
    expect(hasBlankSku({ sku: 'ABC-123' })).toBe(false)
  })
})

describe('optionValuesOf', () => {
  it('reads a record-shaped options object', () => {
    expect(optionValuesOf({ options: { Material: 'Oak', Finish: 'Matte' } })).toEqual([
      'Oak',
      'Matte',
    ])
  })
  it('reads an array-shaped options relation', () => {
    expect(optionValuesOf({ options: [{ value: 'Oak' }, { value: 'Matte' }] })).toEqual([
      'Oak',
      'Matte',
    ])
  })
  it('returns empty array when no options', () => {
    expect(optionValuesOf({})).toEqual([])
    expect(optionValuesOf(null)).toEqual([])
  })
})
