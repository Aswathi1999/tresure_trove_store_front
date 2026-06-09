import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigates to /materials and returns the href of the first material card link,
 * or null when no materials are present (e.g. CMS not running in test env).
 */
async function getFirstMaterialHref(page: import('@playwright/test').Page): Promise<string | null> {
  await page.goto('/materials')
  const listing = page.getByTestId('materials-listing-page')
  if (!(await listing.isVisible())) return null
  const firstLink = listing
    .locator('[data-testid^="material-card-"] a[href^="/materials/"]')
    .first()
  if (!(await firstLink.isVisible())) return null
  return firstLink.getAttribute('href')
}

// ---------------------------------------------------------------------------
// Materials listing — page structure
// ---------------------------------------------------------------------------

test.describe('Materials listing — page structure', () => {
  test('renders the listing page container', async ({ page }) => {
    await page.goto('/materials')
    await expect(page.getByTestId('materials-listing-page')).toBeVisible()
  })

  test('page title is correct', async ({ page }) => {
    await page.goto('/materials')
    await expect(page).toHaveTitle(/Our Materials.*Treasure Trove/i)
  })

  test('breadcrumb shows Home and Materials', async ({ page }) => {
    await page.goto('/materials')
    const nav = page.getByTestId('breadcrumb')
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByText('Materials')).toBeVisible()
  })

  test('hero section renders with headline text', async ({ page }) => {
    await page.goto('/materials')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Materials listing — material cards
// ---------------------------------------------------------------------------

test.describe('Materials listing — material cards', () => {
  test('renders materials grid container', async ({ page }) => {
    await page.goto('/materials')
    await expect(page.getByTestId('materials-listing-page')).toBeVisible()
    await expect(page.getByTestId('materials-grid')).toBeAttached()
  })

  test('shows material cards or an empty grid', async ({ page }) => {
    await page.goto('/materials')
    await expect(page.getByTestId('materials-listing-page')).toBeVisible()
    const grid = page.getByTestId('materials-grid')
    const cards = grid.locator('[data-testid^="material-card-"]')
    const count = await cards.count()
    if (count > 0) {
      await expect(cards.first()).toBeVisible()
    }
    // count === 0 is valid when CMS is not available — test still passes
  })

  test('material card links point to /materials/[slug]', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    expect(href).toMatch(/^\/materials\/.+/)
  })

  test('material card shows sustainability rating', async ({ page }) => {
    await page.goto('/materials')
    const grid = page.getByTestId('materials-grid')
    const cards = grid.locator('[data-testid^="material-card-"]')
    const count = await cards.count()
    if (count === 0) {
      test.skip()
      return
    }
    // Each card should contain a sustainability rating element
    const firstCard = cards.first()
    const rating = firstCard.locator('[data-testid^="sustainability-rating"]')
    await expect(rating).toBeVisible()
  })

  test('material card shows origin', async ({ page }) => {
    await page.goto('/materials')
    const grid = page.getByTestId('materials-grid')
    const cards = grid.locator('[data-testid^="material-card-"]')
    const count = await cards.count()
    if (count === 0) {
      test.skip()
      return
    }
    const firstCard = cards.first()
    const origin = firstCard.locator('[data-testid^="material-card-origin-"]')
    await expect(origin).toBeVisible()
    const text = await origin.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('material card wood type badge is visible', async ({ page }) => {
    await page.goto('/materials')
    const grid = page.getByTestId('materials-grid')
    const cards = grid.locator('[data-testid^="material-card-"]')
    const count = await cards.count()
    if (count === 0) {
      test.skip()
      return
    }
    const badge = cards.first().locator('[data-testid^="material-card-wood-type-badge-"]')
    await expect(badge).toBeVisible()
  })

  test('clicking a material card navigates to the detail page', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.click(`[data-testid^="material-card-"] a[href="${href}"]`)
    await expect(page).toHaveURL(href)
    await expect(page.getByTestId('material-story-page')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Individual material story — page structure
// ---------------------------------------------------------------------------

test.describe('Material story detail — page structure', () => {
  test('renders the material-story-page container', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page.getByTestId('material-story-page')).toBeVisible()
  })

  test('renders material-detail article', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page.getByTestId('material-detail')).toBeVisible()
  })

  test('renders an h1 with the material name', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const name = page.getByTestId('material-detail-name')
    await expect(name).toBeVisible()
    const text = await name.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('page title includes material name and Treasure Trove', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page).toHaveTitle(/Treasure Trove/)
  })

  test('breadcrumb shows Home > Materials > material name', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Materials' })).toBeVisible()
  })

  test('origin is displayed on detail page', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const origin = page.getByTestId('material-detail-origin')
    await expect(origin).toBeVisible()
    const text = await origin.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('wood type badge is displayed on detail page', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page.getByTestId('material-detail-wood-type-badge')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Sustainability rating display
// ---------------------------------------------------------------------------

test.describe('Material story detail — sustainability rating', () => {
  test('sustainability rating is visible on detail page', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const rating = page.locator('[data-testid^="sustainability-rating"]')
    await expect(rating).toBeVisible()
  })

  test('sustainability rating shows leaf icons', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const rating = page.locator('[data-testid^="sustainability-rating"]').first()
    await expect(rating).toBeVisible()
    // Rating should contain SVG leaf icons rendered by lucide-react
    const icons = rating.locator('svg')
    const iconCount = await icons.count()
    expect(iconCount).toBeGreaterThan(0)
  })

  test('sustainability rating label is displayed', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const ratingText = page.locator('text=/Sustainability/i')
    await expect(ratingText.first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Related products filtered by wood_type
// ---------------------------------------------------------------------------

test.describe('Material story detail — related products', () => {
  test('related products section renders when products exist', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const section = page.getByTestId('related-products-by-material')
    if (!(await section.isVisible())) {
      // No Medusa products with matching wood_type metadata — valid state
      test.skip()
      return
    }
    await expect(section).toBeVisible()
  })

  test('related products section shows "Featured Pieces" heading', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const section = page.getByTestId('related-products-by-material')
    if (!(await section.isVisible())) {
      test.skip()
      return
    }
    await expect(section.getByText('Featured Pieces')).toBeVisible()
  })

  test('related products section shows "Made with [material]" label', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const section = page.getByTestId('related-products-by-material')
    if (!(await section.isVisible())) {
      test.skip()
      return
    }
    const madeWith = section.locator('text=/Made with/i')
    await expect(madeWith).toBeVisible()
  })

  test('related product cards link to /products/[handle]', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const section = page.getByTestId('related-products-by-material')
    if (!(await section.isVisible())) {
      test.skip()
      return
    }
    const firstProductLink = section.locator('a[href^="/products/"]').first()
    if (!(await firstProductLink.isVisible())) {
      test.skip()
      return
    }
    const productHref = await firstProductLink.getAttribute('href')
    expect(productHref).toMatch(/^\/products\/.+/)
  })

  test('related product cards show product name and price', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    const section = page.getByTestId('related-products-by-material')
    if (!(await section.isVisible())) {
      test.skip()
      return
    }
    const cards = section.locator('[data-testid^="related-product-card-"]')
    if ((await cards.count()) === 0) {
      test.skip()
      return
    }
    const firstCard = cards.first()
    const name = firstCard.locator('[data-testid^="related-product-name-"]')
    const price = firstCard.locator('[data-testid^="related-product-price-"]')
    await expect(name).toBeVisible()
    await expect(price).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// ISR revalidation webhook — material type
// ---------------------------------------------------------------------------

test.describe('Materials — ISR revalidation webhook', () => {
  test('returns 401 when x-revalidate-secret header is absent', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      data: { slug: 'teak', type: 'material-story' },
    })
    expect(res.status()).toBe(401)
  })

  test('returns 401 for an incorrect secret', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': 'wrong-secret' },
      data: { slug: 'teak', type: 'material-story' },
    })
    expect(res.status()).toBe(401)
  })

  test('returns 200 and revalidates /materials and /materials/[slug] with correct secret', async ({
    request,
  }) => {
    const secret = process.env['REVALIDATE_SECRET']
    if (!secret) {
      test.skip()
      return
    }
    const slug = 'teak'
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': secret },
      data: { slug, type: 'material-story' },
    })
    expect(res.status()).toBe(200)
    const body = (await res.json()) as { revalidated: boolean; paths: string[] }
    expect(body.revalidated).toBe(true)
    expect(body.paths).toContain('/materials')
    expect(body.paths).toContain(`/materials/${slug}`)
  })
})

// ---------------------------------------------------------------------------
// 404 edge case
// ---------------------------------------------------------------------------

test.describe('Materials — 404 edge case', () => {
  test('non-existent slug renders a 404', async ({ page }) => {
    const response = await page.goto('/materials/this-material-does-not-exist-xyz-999')
    expect(response?.status()).toBe(404)
  })

  test('navigating back from a detail page to listing works', async ({ page }) => {
    const href = await getFirstMaterialHref(page)
    if (!href) {
      test.skip()
      return
    }
    await page.goto(href)
    await expect(page.getByTestId('material-story-page')).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL('/materials')
    await expect(page.getByTestId('materials-listing-page')).toBeVisible()
  })
})
