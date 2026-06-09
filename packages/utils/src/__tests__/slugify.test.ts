/**
 * Unit tests for the slugify utility.
 *
 * Verifies lowercasing, whitespace/hyphen normalisation, special-character
 * stripping, and trimming of leading/trailing hyphens.
 */

import { slugify } from '../slugify'

describe('slugify', () => {
  // ─── Basic transformations ────────────────────────────────────────────────

  it('lowercases the input', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('the quick brown fox')).toBe('the-quick-brown-fox')
  })

  it('trims leading and trailing whitespace before slugifying', () => {
    expect(slugify('  trimmed  ')).toBe('trimmed')
  })

  // ─── Special characters ───────────────────────────────────────────────────

  it('strips exclamation marks', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })

  it('strips non-ASCII characters (e.g. Ō in Ōkura)', () => {
    // \w matches ASCII only — Ō is stripped, leaving 'kura'
    expect(slugify('Ōkura Lounge Chair')).toBe('kura-lounge-chair')
  })

  it('strips punctuation but keeps ASCII alphanumerics', () => {
    expect(slugify('Oak & Teak — Side Table')).toBe('oak-teak-side-table')
  })

  // ─── Hyphen / underscore normalisation ───────────────────────────────────

  it('collapses multiple spaces into a single hyphen', () => {
    expect(slugify('foo   bar')).toBe('foo-bar')
  })

  it('collapses multiple consecutive hyphens into a single hyphen', () => {
    expect(slugify('foo---bar')).toBe('foo-bar')
  })

  it('collapses underscores into a single hyphen', () => {
    expect(slugify('foo_bar')).toBe('foo-bar')
  })

  it('removes leading hyphens', () => {
    expect(slugify('-foo')).toBe('foo')
  })

  it('removes trailing hyphens', () => {
    expect(slugify('foo-')).toBe('foo')
  })

  it('removes leading and trailing hyphens after normalisation', () => {
    expect(slugify('-leading and trailing-')).toBe('leading-and-trailing')
  })

  // ─── Edge cases ───────────────────────────────────────────────────────────

  it('returns an empty string for an empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('handles strings that are already valid slugs', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug')
  })

  it('handles a single word', () => {
    expect(slugify('Chair')).toBe('chair')
  })

  it('handles numeric strings', () => {
    expect(slugify('42')).toBe('42')
  })
})
