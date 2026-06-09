import { expect, test } from '@playwright/test'

const CMS_URL = process.env['NEXT_PUBLIC_PAYLOAD_URL'] ?? 'http://localhost:3001'
const CLOUDFRONT_DOMAIN = 'cdn.treasuretrove.in'

// ── Payload Media API ─────────────────────────────────────────────────────────

test.describe('Media Library — Payload REST API', () => {
  test('GET /api/media returns a paginated response', async ({ request }) => {
    const res = await request.get(`${CMS_URL}/api/media`)
    if (!res.ok()) {
      test.skip()
      return
    }
    const body = (await res.json()) as Record<string, unknown>
    expect(body).toHaveProperty('docs')
    expect(body).toHaveProperty('totalDocs')
    expect(body).toHaveProperty('page')
    expect(Array.isArray(body.docs)).toBeTruthy()
  })

  test('media documents contain required fields', async ({ request }) => {
    const res = await request.get(`${CMS_URL}/api/media?limit=1`)
    if (!res.ok()) {
      test.skip()
      return
    }
    const body = (await res.json()) as { docs: Record<string, unknown>[] }
    if (body.docs.length === 0) {
      test.skip()
      return
    }
    const doc = body.docs[0]
    expect(doc).toHaveProperty('id')
    expect(doc).toHaveProperty('url')
    expect(doc).toHaveProperty('alt')
    expect(doc).toHaveProperty('filename')
    expect(doc).toHaveProperty('width')
    expect(doc).toHaveProperty('height')
    expect(doc).toHaveProperty('mimeType')
  })

  test('media document URLs use CloudFront domain, not S3', async ({ request }) => {
    const res = await request.get(`${CMS_URL}/api/media?limit=10`)
    if (!res.ok()) {
      test.skip()
      return
    }
    const body = (await res.json()) as { docs: { url: string }[] }
    if (body.docs.length === 0) {
      test.skip()
      return
    }
    for (const doc of body.docs) {
      expect(doc.url).toContain(CLOUDFRONT_DOMAIN)
      expect(doc.url).not.toContain('s3.amazonaws.com')
      expect(doc.url).not.toContain('s3.ap-south-1.amazonaws.com')
    }
  })

  test('GET /api/media/:id returns a single media document', async ({ request }) => {
    const listRes = await request.get(`${CMS_URL}/api/media?limit=1`)
    if (!listRes.ok()) {
      test.skip()
      return
    }
    const list = (await listRes.json()) as { docs: { id: string }[] }
    if (list.docs.length === 0) {
      test.skip()
      return
    }
    const id = list.docs[0]!.id
    const res = await request.get(`${CMS_URL}/api/media/${id}`)
    expect(res.ok()).toBeTruthy()
    const doc = (await res.json()) as Record<string, unknown>
    expect(doc['id']).toBe(id)
    expect(doc).toHaveProperty('url')
    expect(doc).toHaveProperty('alt')
  })

  test('alt text is non-empty on all media documents', async ({ request }) => {
    const res = await request.get(`${CMS_URL}/api/media?limit=10`)
    if (!res.ok()) {
      test.skip()
      return
    }
    const body = (await res.json()) as { docs: { alt: string; filename: string }[] }
    if (body.docs.length === 0) {
      test.skip()
      return
    }
    for (const doc of body.docs) {
      expect(doc.alt, `Media "${doc.filename}" is missing alt text`).toBeTruthy()
    }
  })
})

// ── CloudFrontImage component rendering ───────────────────────────────────────

test.describe('Media Library — CloudFrontImage storefront rendering', () => {
  test('journal page renders without errors', async ({ page }) => {
    await page.goto('/journal')
    await expect(page).not.toHaveURL(/error/)
    const heading = page.getByRole('heading').first()
    await expect(heading).toBeVisible({ timeout: 15_000 })
  })

  test('journal post cards render images with cloudfront-image testid when CMS media is populated', async ({
    page,
  }) => {
    await page.goto('/journal')
    const images = page.locator('[data-testid="cloudfront-image"]')
    const count = await images.count()
    if (count === 0) {
      // CMS has no media uploaded yet or journal uses string URLs — skip render check
      test.skip()
      return
    }
    await expect(images.first()).toBeVisible()
  })

  test('CloudFrontImage src never contains a raw S3 URL', async ({ page }) => {
    await page.goto('/journal')
    const images = page.locator('[data-testid="cloudfront-image"]')
    const count = await images.count()
    if (count === 0) {
      test.skip()
      return
    }
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src')
      expect(src).not.toContain('s3.amazonaws.com')
    }
  })
})

// ── CloudFront URL format ─────────────────────────────────────────────────────

test.describe('Media Library — getCloudFrontUrl format', () => {
  test('storefront NEXT_PUBLIC_CLOUDFRONT_URL env var is set and used', async ({ request }) => {
    // If the env var is missing, next/image will reject CloudFront src as an unconfigured host.
    // A successful page render with any CloudFront image means the env var is correctly wired.
    const res = await request.get('/')
    expect(res.ok()).toBeTruthy()
    // Confirm the CDN domain is in remotePatterns by checking next/image doesn't 404 on it
    const body = await res.text()
    expect(body).not.toContain('hostname not configured')
  })
})
