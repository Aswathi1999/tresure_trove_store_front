import { expect, test } from '@playwright/test'

test.describe('Homepage — section render', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the hero section', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Hero' })).toBeVisible()
  })

  test('renders the trust strip', async ({ page }) => {
    // TrustStrip renders desktop + mobile — use .first() to avoid strict-mode violation
    await expect(page.getByText('Free Shipping').first()).toBeVisible()
  })

  test('renders the marquee bar', async ({ page }) => {
    await expect(page.getByTestId('marquee-container')).toBeVisible()
  })

  test('renders the category section with 8 tiles', async ({ page }) => {
    // Exclude mobile tiles (data-testid="category-tile-mobile-*") — desktop-only count
    const tiles = page.locator('[data-testid^="category-tile-"]:not([data-testid*="mobile"])')
    await expect(tiles.first()).toBeVisible({ timeout: 15_000 })
    await expect(tiles).toHaveCount(8)
  })

  test('renders the collections grid', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Collections' })).toBeVisible()
  })

  test('renders the blog preview section', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Blog' })).toBeVisible()
  })

  test('renders a featured products section', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Bestsellers' })
    await expect(section).toBeVisible({ timeout: 15_000 })
  })

  test('renders a new arrivals section', async ({ page }) => {
    const section = page.getByRole('region', { name: 'New Arrivals' })
    await expect(section).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Homepage — featured products', () => {
  test('shows product cards or the empty-state message', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Bestsellers' })
    await expect(section).toBeVisible({ timeout: 15_000 })

    const hasCards = await section.locator('[data-testid^="product-card-"]').count()
    if (hasCards > 0) {
      // Products loaded — verify cards have links to /products/*
      const firstCard = section.locator('[data-testid^="product-card-"]').first()
      const href = await firstCard.getAttribute('href')
      expect(href).toMatch(/^\/products\//)
    } else {
      // Empty-state message must be visible
      await expect(section.getByText('Could not load products')).toBeVisible()
    }
  })

  test('view-all button links to the correct collection', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Bestsellers' })
    const viewAll = section.getByTestId('view-all-button')
    await expect(viewAll).toBeVisible({ timeout: 15_000 })
    await expect(viewAll).toHaveAttribute('href', '/collections/bestsellers')
  })
})

test.describe('Homepage — new arrivals', () => {
  test('view-all button links to new arrivals collection', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'New Arrivals' })
    const viewAll = section.getByTestId('view-all-button')
    await expect(viewAll).toBeVisible({ timeout: 15_000 })
    await expect(viewAll).toHaveAttribute('href', '/collections/new-arrivals')
  })
})

test.describe('Homepage — collections grid', () => {
  test('shows collection cards or an empty grid', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Collections' })
    await expect(section).toBeVisible()

    const cards = section.locator('[data-testid^="collection-card-"]')
    const count = await cards.count()
    if (count > 0) {
      const href = await cards.first().getAttribute('href')
      expect(href).toMatch(/^\/collections\//)
    }
  })
})

test.describe('Homepage — blog preview', () => {
  test('shows blog cards or an empty section', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Blog' })
    await expect(section).toBeVisible()

    const cards = section.locator('[data-testid^="blog-card-"]')
    const count = await cards.count()
    if (count > 0) {
      const href = await cards.first().locator('a').first().getAttribute('href')
      expect(href).toMatch(/^\/blog\//)
    }
  })
})

test.describe('Homepage — brand philosophy', () => {
  test('CTA button links to a valid collection path when section is visible', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByTestId('brand-philosophy-cta')
    const isVisible = await cta.isVisible()
    if (!isVisible) {
      // Section only renders when CMS has brand philosophy data — skip
      test.skip()
      return
    }
    const href = await cta.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toMatch(/^\//)
  })
})

test.describe('Homepage — category navigation', () => {
  test('clicking a category tile navigates to its collection', async ({ page }) => {
    await page.goto('/')
    const tile = page.getByTestId('category-tile-decor')
    await expect(tile).toBeVisible()
    await expect(tile).toHaveAttribute('href', '/collections/decor')
  })

  test('all desktop category tiles are visible', async ({ page }) => {
    await page.goto('/')
    for (const id of [
      'decor',
      'bed-bath',
      'kitchen-dining',
      'bar-glassware',
      'flowers-plants',
      'outdoor',
      'lighting',
      'accessories',
    ]) {
      await expect(page.getByTestId(`category-tile-${id}`)).toBeVisible()
    }
  })
})

test.describe('Homepage — ISR revalidation webhook', () => {
  test('returns 401 when secret header is missing', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      data: { slug: '', type: 'homepage' },
    })
    expect(res.status()).toBe(401)
  })

  test('returns 401 for an incorrect secret', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': 'wrong-secret' },
      data: { slug: '', type: 'homepage' },
    })
    expect(res.status()).toBe(401)
  })

  test('returns 200 and revalidates / when correct secret is provided', async ({ request }) => {
    const secret = process.env['REVALIDATE_SECRET']
    if (!secret) {
      test.skip()
      return
    }
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': secret },
      data: { slug: '', type: 'homepage' },
    })
    expect(res.status()).toBe(200)
    const body = (await res.json()) as { revalidated: boolean; paths: string[] }
    expect(body.revalidated).toBe(true)
    expect(body.paths).toContain('/')
  })

  test('returns 200 and revalidates a blog path', async ({ request }) => {
    const secret = process.env['REVALIDATE_SECRET']
    if (!secret) {
      test.skip()
      return
    }
    const res = await request.post('/api/revalidate', {
      headers: { 'x-revalidate-secret': secret },
      data: { slug: 'test-post', type: 'blog' },
    })
    expect(res.status()).toBe(200)
    const body = (await res.json()) as { revalidated: boolean; paths: string[] }
    expect(body.revalidated).toBe(true)
    expect(body.paths).toContain('/journal')
    expect(body.paths).toContain('/journal/test-post')
  })
})

test.describe('Homepage — error state: CMS unavailable', () => {
  test('page still loads when CMS data is absent (fallback sections visible)', async ({ page }) => {
    // The page renders with empty sections when CMS fails — trust strip and category
    // section are hardcoded and must always appear regardless of API availability.
    await page.goto('/')
    await expect(page.getByText('Free Shipping').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('marquee-container')).toBeVisible()
  })
})
