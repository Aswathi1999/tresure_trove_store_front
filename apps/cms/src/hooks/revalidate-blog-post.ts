import type { CollectionAfterChangeHook } from 'payload'

type DocWithSlugAndStatus = {
  slug?: string
  _status?: string
}

export const revalidateBlogPost: CollectionAfterChangeHook = async ({
  doc,
}: {
  doc: DocWithSlugAndStatus
}) => {
  if (doc._status !== 'published') return doc

  const storefrontUrl = process.env['STOREFRONT_URL'] ?? 'http://localhost:3000'
  const secret = process.env['REVALIDATE_SECRET'] ?? ''

  try {
    await fetch(`${storefrontUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ slug: doc.slug ?? '', type: 'blog' }),
    })
  } catch {
    // Non-fatal — storefront may be offline during local dev
  }

  return doc
}
