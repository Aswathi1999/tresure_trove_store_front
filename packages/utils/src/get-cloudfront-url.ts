/**
 * Returns a CloudFront CDN URL for a given S3 key or path.
 * Never expose raw S3 URLs — always use this function.
 */
export function getCloudFrontUrl(cloudfrontBaseUrl: string, path: string): string {
  const base = cloudfrontBaseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
