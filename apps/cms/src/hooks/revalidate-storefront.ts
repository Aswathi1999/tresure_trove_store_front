import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

type ContentType = 'blog' | 'material' | 'material-story' | 'homepage' | 'product'

type DocWithSlug = {
  slug?: string
}

// Returns a hook usable as afterChange, afterDelete (collections), or afterChange
// (globals). Deletions MUST revalidate too — otherwise a deleted document keeps
// showing on the storefront until its ISR cache TTL expires.
export function revalidateStorefront(
  type: ContentType,
): CollectionAfterChangeHook & CollectionAfterDeleteHook & GlobalAfterChangeHook {
  const hook = async ({ doc }: { doc?: DocWithSlug }) => {
    const storefrontUrl = process.env['STOREFRONT_URL'] ?? 'http://localhost:3000'
    const secret = process.env['REVALIDATE_SECRET'] ?? ''

    try {
      await fetch(`${storefrontUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ slug: doc?.slug ?? '', type }),
      })
    } catch {
      // Non-fatal — storefront may be offline during local dev
    }

    return doc
  }

  return hook as CollectionAfterChangeHook & CollectionAfterDeleteHook & GlobalAfterChangeHook
}
