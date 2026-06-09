/**
 * Unit tests for the getCloudFrontUrl utility.
 *
 * Verifies that base URL trailing slashes and path leading slashes are
 * normalised correctly so the returned URL is always well-formed.
 */

import { getCloudFrontUrl } from '../get-cloudfront-url'

describe('getCloudFrontUrl', () => {
  // ─── Happy path ───────────────────────────────────────────────────────────

  it('combines base URL and path correctly', () => {
    expect(getCloudFrontUrl('https://cdn.example.com', '/image.jpg')).toBe(
      'https://cdn.example.com/image.jpg',
    )
  })

  // ─── Base URL normalisation ───────────────────────────────────────────────

  it('strips a trailing slash from the base URL', () => {
    expect(getCloudFrontUrl('https://cdn.example.com/', '/image.jpg')).toBe(
      'https://cdn.example.com/image.jpg',
    )
  })

  // ─── Path normalisation ───────────────────────────────────────────────────

  it('prepends a leading slash to the path when missing', () => {
    expect(getCloudFrontUrl('https://cdn.example.com', 'image.jpg')).toBe(
      'https://cdn.example.com/image.jpg',
    )
  })

  it('handles both trailing base slash and missing path slash', () => {
    expect(getCloudFrontUrl('https://cdn.example.com/', 'image.jpg')).toBe(
      'https://cdn.example.com/image.jpg',
    )
  })

  // ─── Nested paths ─────────────────────────────────────────────────────────

  it('preserves nested paths', () => {
    expect(getCloudFrontUrl('https://cdn.example.com', '/products/chairs/hero.webp')).toBe(
      'https://cdn.example.com/products/chairs/hero.webp',
    )
  })

  it('preserves nested path without leading slash', () => {
    expect(getCloudFrontUrl('https://cdn.example.com', 'products/chairs/hero.webp')).toBe(
      'https://cdn.example.com/products/chairs/hero.webp',
    )
  })

  // ─── Real-world CDN base ──────────────────────────────────────────────────

  it('works with the TreasureTrove CloudFront domain', () => {
    expect(getCloudFrontUrl('https://cdn.treasuretrove.in', '/media/sofa.webp')).toBe(
      'https://cdn.treasuretrove.in/media/sofa.webp',
    )
  })
})
