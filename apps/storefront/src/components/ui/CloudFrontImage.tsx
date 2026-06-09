import Image from 'next/image'
import { getCloudFrontUrl } from '@/lib/cloudfront'

export interface PayloadMediaDoc {
  id: string
  url: string
  filename: string
  alt: string
  width: number
  height: number
}

interface CloudFrontImageProps {
  media: PayloadMediaDoc
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
}

export function CloudFrontImage({
  media,
  sizes,
  priority = false,
  className,
  fill,
}: CloudFrontImageProps) {
  if (process.env.NODE_ENV !== 'production' && !media.alt) {
    // eslint-disable-next-line no-console
    console.warn(
      `CloudFrontImage: alt text is empty for media id="${media.id}". Alt text is required.`,
    )
  }

  const src = getCloudFrontUrl(media.url)

  if (fill) {
    return (
      <Image
        src={src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        data-testid="cloudfront-image"
        data-media-id={media.id}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={priority}
      className={className}
      data-testid="cloudfront-image"
      data-media-id={media.id}
    />
  )
}
