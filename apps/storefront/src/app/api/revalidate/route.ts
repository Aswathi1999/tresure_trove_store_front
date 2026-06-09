import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import type { RevalidateWebhookPayload } from '@TreasureTrove/types'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env['REVALIDATE_SECRET']) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = (await request.json()) as RevalidateWebhookPayload

  const pathsMap: Record<RevalidateWebhookPayload['type'], string[]> = {
    blog: ['/journal', `/journal/${body.slug}`],
    material: ['/materials', `/materials/${body.slug}`],
    'material-story': ['/materials', `/materials/${body.slug}`],
    homepage: ['/'],
    // Products also appear on the homepage (Bestsellers / New Arrivals) and the
    // listing page, so revalidate '/' too — otherwise add/remove only shows on
    // the homepage after its TTL (up to an hour).
    product: ['/', '/products', `/products/${body.slug}`],
  }

  // Invalidate the underlying data-cache tags so EVERY fetch that uses this data
  // refreshes regardless of which page rendered it (homepage product rows,
  // collection/category product lists, related products, search…).
  const tagsMap: Record<RevalidateWebhookPayload['type'], string[]> = {
    blog: ['blog'],
    material: ['material-stories'],
    'material-story': ['material-stories'],
    homepage: ['homepage'],
    product: ['products'],
  }

  const paths = pathsMap[body.type] ?? []
  const tags = tagsMap[body.type] ?? []
  paths.forEach((path) => revalidatePath(path))
  tags.forEach((tag) => revalidateTag(tag))

  return NextResponse.json({ revalidated: true, paths, tags })
}
