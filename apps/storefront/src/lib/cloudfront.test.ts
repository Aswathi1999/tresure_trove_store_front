import { describe, it, expect, afterEach } from 'vitest'
import { getCloudFrontUrl } from './cloudfront'

const DEFAULT_CDN = 'https://cdn.treasuretrove.in'

afterEach(() => {
  delete process.env['NEXT_PUBLIC_CLOUDFRONT_URL']
})

describe('getCloudFrontUrl — relative paths', () => {
  it('prepends the env var to a path with a leading slash', () => {
    process.env['NEXT_PUBLIC_CLOUDFRONT_URL'] = 'https://cdn.test.com'
    expect(getCloudFrontUrl('/image.jpg')).toBe('https://cdn.test.com/image.jpg')
  })

  it('prepends the env var to a path without a leading slash', () => {
    process.env['NEXT_PUBLIC_CLOUDFRONT_URL'] = 'https://cdn.test.com'
    expect(getCloudFrontUrl('image.jpg')).toBe('https://cdn.test.com/image.jpg')
  })

  it('falls back to the default CDN when env var is not set', () => {
    expect(getCloudFrontUrl('/media/chair.jpg')).toBe(`${DEFAULT_CDN}/media/chair.jpg`)
  })

  it('handles nested paths correctly', () => {
    process.env['NEXT_PUBLIC_CLOUDFRONT_URL'] = 'https://cdn.test.com'
    expect(getCloudFrontUrl('/media/2026/05/chair.jpg')).toBe(
      'https://cdn.test.com/media/2026/05/chair.jpg',
    )
  })

  it('does not produce an S3 URL for any relative path', () => {
    const result = getCloudFrontUrl('/uploads/product.jpg')
    expect(result).not.toContain('s3.amazonaws.com')
    expect(result).not.toContain('s3.ap-south-1.amazonaws.com')
  })
})

describe('getCloudFrontUrl — full URLs (pass-through)', () => {
  it('returns an https:// URL unchanged', () => {
    const full = 'https://cdn.treasuretrove.in/media/chair.jpg'
    expect(getCloudFrontUrl(full)).toBe(full)
  })

  it('returns an http:// URL unchanged (local dev scenario)', () => {
    const full = 'http://localhost:3001/media/chair.jpg'
    expect(getCloudFrontUrl(full)).toBe(full)
  })

  it('does not double-prefix a CloudFront URL', () => {
    process.env['NEXT_PUBLIC_CLOUDFRONT_URL'] = 'https://cdn.test.com'
    const full = 'https://cdn.treasuretrove.in/media/chair.jpg'
    expect(getCloudFrontUrl(full)).toBe(full)
  })

  it('does not produce an S3 URL when given a CloudFront URL', () => {
    const full = 'https://cdn.treasuretrove.in/media/chair.jpg'
    expect(getCloudFrontUrl(full)).not.toContain('s3.amazonaws.com')
  })
})
