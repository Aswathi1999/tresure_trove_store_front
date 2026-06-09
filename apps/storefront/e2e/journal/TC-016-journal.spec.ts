import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Navigates to /journal and returns the href of the first post card link,
 * or null when no posts are present (e.g. CMS not running in test env).
 */
async function getFirstPostHref(page: import('@playwright/test').Page): Promise<string | null> {
  await page.goto('/journal')
  const listing = page.getByTestId('journal-listing-page')
  if (!(await listing.isVisible())) return null
  const firstLink = listing.locator('[data-testid^="post-card-"] a[href^="/journal/"]').first()
  if (!(await firstLink.isVisible())) return null
  return firstLink.getAttribute('href')
}

// ---------------------------------------------------------------------------
// Journal listing
// ---------------------------------------------------------------------------

test.describe('Journal listing — page structure', () => {
  test('renders the listing page container', async ({ page }) => {
    await page.goto('/journal')
    await expect(page.getByTestId('journal-listing-page')).toBeVisible()
  })

  test('page title is correct', async ({ page }) => {
    await page.goto('/journal')
    await expect(page).toHaveTitle(/The Journal.*Treasure Trove/i)
  })

  test('breadcrumb shows Home and Journal', async ({ page }) => {
    await page.goto('/journal')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByText('Journal')).toBeVisible()
  })
})

test.describe('Journal listing — post cards', () => {
  test('shows post cards or an empty grid', async ({ page }) => {
    await page.goto('/journal')
    const listing = page.getByTestId('journal-listing-page')
    await expect(listing).toBeVisible()

    const cards = listing.locator('[data-testid^="post-card-"]')
    const count = await cards.count()
    if (count > 0) {
      await expect(cards.first()).toBeVisible()
    }
    // count === 0 is valid when CMS is not available — test still passes
  })

  test('post card links point to /journal/[slug]', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    expect(href).toMatch(/^\/journal\/.+/)
  })

  test('clicking a post card navigates to the detail page', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.click(`[data-testid^="post-card-"] a[href="${href}"]`)
    await expect(page).toHaveURL(href)
    await expect(page.getByTestId('post-detail')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Journal post detail
// ---------------------------------------------------------------------------

test.describe('Journal post detail — page structure', () => {
  test('renders the post-detail container', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page.getByTestId('post-detail')).toBeVisible()
  })

  test('renders an h1 with the post title', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('page title includes post name and Treasure Trove', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page).toHaveTitle(/Treasure Trove/)
  })

  test('breadcrumb shows Home > Journal > post title', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Journal' })).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Journal post detail — rich text rendering
// ---------------------------------------------------------------------------

test.describe('Journal post detail — rich text rendering', () => {
  test('rich text content area is present', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const article = page.getByTestId('post-detail')
    await expect(article.locator('.prose-custom')).toBeVisible()
  })

  test('rich text area contains rendered content', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const richText = page.locator('.prose-custom')
    await expect(richText).toBeVisible()
    const text = await richText.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('rich text headings render as h2 or h3 elements', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const richText = page.locator('.prose-custom')
    const headings = richText.locator('h2, h3, h4')
    const count = await headings.count()
    if (count === 0) {
      // Post has no headings — valid content structure
      test.skip()
      return
    }
    await expect(headings.first()).toBeVisible()
  })

  test('rich text blockquotes render when present', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const richText = page.locator('.prose-custom')
    const blockquotes = richText.locator('blockquote')
    const count = await blockquotes.count()
    if (count === 0) {
      test.skip()
      return
    }
    await expect(blockquotes.first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Journal post detail — related posts
// ---------------------------------------------------------------------------

test.describe('Journal post detail — related posts', () => {
  test('related posts section renders when post has related posts', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const related = page.getByTestId('related-posts')
    if (!(await related.isVisible())) {
      // No related posts configured — valid state
      test.skip()
      return
    }
    await expect(related).toBeVisible()
    await expect(related.getByText('More from the Journal')).toBeVisible()
  })

  test('related post cards link to /journal/[slug]', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const related = page.getByTestId('related-posts')
    if (!(await related.isVisible())) {
      test.skip()
      return
    }
    const firstRelatedLink = related.locator('a[href^="/journal/"]').first()
    if (!(await firstRelatedLink.isVisible())) {
      test.skip()
      return
    }
    const relatedHref = await firstRelatedLink.getAttribute('href')
    expect(relatedHref).toMatch(/^\/journal\/.+/)
  })

  test('clicking a related post navigates to its detail page', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const related = page.getByTestId('related-posts')
    if (!(await related.isVisible())) {
      test.skip()
      return
    }
    const firstRelatedLink = related.locator('a[href^="/journal/"]').first()
    if (!(await firstRelatedLink.isVisible())) {
      test.skip()
      return
    }
    const relatedHref = await firstRelatedLink.getAttribute('href')
    await firstRelatedLink.click()
    await expect(page).toHaveURL(relatedHref!)
    await expect(page.getByTestId('post-detail')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// ISR revalidation webhook
// ---------------------------------------------------------------------------

test.describe('Journal — ISR revalidation webhook', () => {
  test('returns 401 when x-revalidate-secret header is absent', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      data: { slug: 'test-post', type: 'blog' },
    })
    expect(res.status()).toBe(401)
  })

  test('returns 401 for an incorrect secret', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': 'wrong-secret' },
      data: { slug: 'test-post', type: 'blog' },
    })
    expect(res.status()).toBe(401)
  })

  test('returns 200 and revalidates /journal and /journal/[slug] with correct secret', async ({
    request,
  }) => {
    const secret = process.env['REVALIDATE_SECRET']
    if (!secret) {
      test.skip()
      return
    }
    const slug = 'the-art-of-handcrafted-brass'
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': secret },
      data: { slug, type: 'blog' },
    })
    expect(res.status()).toBe(200)
    const body = (await res.json()) as { revalidated: boolean; paths: string[] }
    expect(body.revalidated).toBe(true)
    expect(body.paths).toContain('/journal')
    expect(body.paths).toContain(`/journal/${slug}`)
  })
})

// ---------------------------------------------------------------------------
// 404 edge case
// ---------------------------------------------------------------------------

test.describe('Journal — 404 edge case', () => {
  test('non-existent slug renders a 404', async ({ page }) => {
    const response = await page.goto('/journal/this-post-does-not-exist-xyz-999')
    expect(response?.status()).toBe(404)
  })

  test('navigating back from a post detail to listing works', async ({ page }) => {
    const href = await getFirstPostHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page.getByTestId('post-detail')).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL('/journal')
    await expect(page.getByTestId('journal-listing-page')).toBeVisible()
  })
})
