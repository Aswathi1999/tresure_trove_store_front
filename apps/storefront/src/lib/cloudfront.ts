export function getCloudFrontUrl(path: string): string {
  // Already a full URL (real Payload media docs contain the full CloudFront URL) — pass through
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const base = process.env['NEXT_PUBLIC_CLOUDFRONT_URL'] ?? 'https://cdn.treasuretrove.in'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
