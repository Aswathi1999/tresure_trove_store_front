import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHomepage: GlobalAfterChangeHook = async ({ doc }) => {
  const storefrontUrl = process.env['STOREFRONT_URL'] ?? 'http://localhost:3000'
  const secret = process.env['REVALIDATE_SECRET'] ?? ''

  try {
    await fetch(`${storefrontUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ type: 'homepage', slug: '' }),
    })
  } catch {
    // Non-fatal — storefront may be offline during local dev
  }

  return doc
}
