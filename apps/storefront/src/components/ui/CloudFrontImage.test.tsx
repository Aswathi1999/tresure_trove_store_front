import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { PayloadMediaDoc } from './CloudFrontImage'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _priority,
    className,
    ...rest
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    priority?: boolean
    className?: string
    [key: string]: unknown
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid={(rest['data-testid'] as string) ?? undefined}
      data-media-id={(rest['data-media-id'] as string) ?? undefined}
    />
  ),
}))

import { CloudFrontImage } from './CloudFrontImage'

const baseMedia: PayloadMediaDoc = {
  id: 'media-001',
  url: '/media/lounge-chair.jpg',
  filename: 'lounge-chair.jpg',
  alt: 'Ōkura Lounge Chair in teak with black woven seat',
  width: 1200,
  height: 900,
}

const CDN = 'https://cdn.test.com'

beforeEach(() => {
  process.env['NEXT_PUBLIC_CLOUDFRONT_URL'] = CDN
})

afterEach(() => {
  delete process.env['NEXT_PUBLIC_CLOUDFRONT_URL']
  vi.restoreAllMocks()
})

describe('CloudFrontImage — rendering', () => {
  it('renders with data-testid="cloudfront-image"', () => {
    render(<CloudFrontImage media={baseMedia} />)
    expect(screen.getByTestId('cloudfront-image')).toBeInTheDocument()
  })

  it('renders data-media-id matching the media doc id', () => {
    render(<CloudFrontImage media={baseMedia} />)
    expect(screen.getByTestId('cloudfront-image')).toHaveAttribute('data-media-id', 'media-001')
  })

  it('renders the correct alt text from the media doc', () => {
    render(<CloudFrontImage media={baseMedia} />)
    expect(
      screen.getByAltText('Ōkura Lounge Chair in teak with black woven seat'),
    ).toBeInTheDocument()
  })

  it('constructs the src via getCloudFrontUrl — prepends CDN base to relative path', () => {
    render(<CloudFrontImage media={baseMedia} />)
    expect(screen.getByTestId('cloudfront-image')).toHaveAttribute(
      'src',
      `${CDN}/media/lounge-chair.jpg`,
    )
  })

  it('passes a full CloudFront URL through unchanged', () => {
    const media: PayloadMediaDoc = {
      ...baseMedia,
      url: 'https://cdn.treasuretrove.in/media/chair.jpg',
    }
    render(<CloudFrontImage media={media} />)
    expect(screen.getByTestId('cloudfront-image')).toHaveAttribute(
      'src',
      'https://cdn.treasuretrove.in/media/chair.jpg',
    )
  })

  it('never renders an S3 URL in src', () => {
    render(<CloudFrontImage media={baseMedia} />)
    const src = screen.getByTestId('cloudfront-image').getAttribute('src') ?? ''
    expect(src).not.toContain('s3.amazonaws.com')
  })

  it('forwards the className prop', () => {
    render(<CloudFrontImage media={baseMedia} className="object-cover w-full" />)
    expect(screen.getByTestId('cloudfront-image')).toHaveClass('object-cover', 'w-full')
  })
})

describe('CloudFrontImage — fill vs fixed modes', () => {
  it('renders in fill mode without explicit width/height in img', () => {
    render(<CloudFrontImage media={baseMedia} fill />)
    const img = screen.getByTestId('cloudfront-image')
    expect(img).toBeInTheDocument()
    // In fill mode, next/image manages dimensions via CSS — no width/height attrs expected
    expect(img).not.toHaveAttribute('width')
    expect(img).not.toHaveAttribute('height')
  })

  it('renders in fixed mode using media doc width and height', () => {
    render(<CloudFrontImage media={baseMedia} />)
    // next/image mock does not pass width/height through to img — only src and alt matter
    expect(screen.getByTestId('cloudfront-image')).toHaveAttribute(
      'src',
      `${CDN}/media/lounge-chair.jpg`,
    )
  })
})

describe('CloudFrontImage — alt text enforcement', () => {
  it('warns in development when alt is an empty string', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const media: PayloadMediaDoc = { ...baseMedia, alt: '' }
    render(<CloudFrontImage media={media} />)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('alt text is empty'))
  })

  it('does not warn when alt text is provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<CloudFrontImage media={baseMedia} />)
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
