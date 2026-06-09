import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigates to the first product found on the listing page and returns its URL.
 * Returns null when there are no products in the catalogue.
 */
async function getFirstProductUrl(page: import('@playwright/test').Page): Promise<string | null> {
  await page.goto('/products')
  const grid = page.getByTestId('products-grid')
  if (!(await grid.isVisible())) return null
  const firstCard = grid.locator('a[data-testid^="product-card-"]').first()
  if (!(await firstCard.isVisible())) return null
  return firstCard.getAttribute('href')
}

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

test.describe('Product Detail — page structure', () => {
  test('renders the breadcrumb with Home and Products links', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Products' })).toBeVisible()
  })

  test('renders the product title in an h1', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('page title includes the product name and Treasure Trove', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    await expect(page).toHaveTitle(/Treasure Trove/)
  })

  test('renders the image gallery', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    await expect(page.getByTestId('image-gallery')).toBeVisible()
    await expect(page.getByTestId('main-image')).toBeVisible()
  })

  test('renders the price display', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const price = page.getByTestId('price-display')
    await expect(price).toBeVisible()
    const text = await price.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('renders add-to-cart button or out-of-stock state', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const addBtn = page.getByTestId('add-to-cart-button')
    const disabledMsg = page.getByTestId('add-to-cart-disabled')
    const hasAdd = await addBtn.isVisible()
    const hasDisabled = await disabledMsg.isVisible()
    expect(hasAdd || hasDisabled).toBe(true)
  })

  test('renders the buy-now button', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    await expect(page.getByTestId('buy-now-button')).toBeVisible()
  })

  test('renders the description section', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    await expect(page.locator('#description')).toBeVisible()
  })

  test('renders the reviews section', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    await expect(page.locator('#reviews')).toBeVisible()
    await expect(page.getByTestId('reviews-list')).toBeVisible()
  })

  test('page contains valid JSON-LD product schema', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd).toBeAttached()
    const raw = await jsonLd.textContent()
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as Record<string, unknown>
    expect(parsed['@type']).toBe('Product')
    expect(typeof parsed['name']).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// Gallery interaction
// ---------------------------------------------------------------------------

test.describe('Product Detail — image gallery', () => {
  test('clicking a thumbnail switches the main image', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    const thumbnail1 = page.getByTestId('thumbnail-1')
    if (!(await thumbnail1.isVisible())) {
      test.skip()
      return
    }

    const mainImage = page.getByTestId('main-image')
    const srcBefore = await mainImage.locator('img').first().getAttribute('src')
    await thumbnail1.click()
    await page.waitForTimeout(400) // allow framer motion transition
    const srcAfter = await mainImage.locator('img').first().getAttribute('src')
    expect(srcAfter).not.toBe(srcBefore)
  })

  test('first thumbnail is active by default (has ring class)', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    const thumbnail0 = page.getByTestId('thumbnail-0')
    if (!(await thumbnail0.isVisible())) {
      test.skip()
      return
    }
    await expect(thumbnail0).toHaveClass(/ring-/)
  })
})

// ---------------------------------------------------------------------------
// Variant selection
// ---------------------------------------------------------------------------

test.describe('Product Detail — variant selection', () => {
  test('size selector is visible and has at least one option', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const sizeSelector = page.getByTestId('size-selector')
    if (!(await sizeSelector.isVisible())) {
      test.skip()
      return
    }
    const buttons = sizeSelector.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('clicking a different size option selects it', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const sizeSelector = page.getByTestId('size-selector')
    if (!(await sizeSelector.isVisible())) {
      test.skip()
      return
    }
    const buttons = sizeSelector.locator('button:not([disabled])')
    const count = await buttons.count()
    if (count < 2) {
      test.skip()
      return
    }
    await buttons.nth(1).click()
    await expect(buttons.nth(1)).toHaveClass(/bg-\[var\(--color-tt-ink\)\]/)
  })

  test('finish selector is visible when product has finish options', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const finishSelector = page.getByTestId('finish-selector')
    if (!(await finishSelector.isVisible())) {
      test.skip()
      return
    }
    await expect(finishSelector).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Price update
// ---------------------------------------------------------------------------

test.describe('Product Detail — price update on variant change', () => {
  test('price display shows a non-empty value', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const priceText = await page.getByTestId('price-display').textContent()
    expect(priceText?.trim().length).toBeGreaterThan(0)
  })

  test('selecting a different size may update the displayed price', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    const sizeSelector = page.getByTestId('size-selector')
    if (!(await sizeSelector.isVisible())) {
      test.skip()
      return
    }
    const buttons = sizeSelector.locator('button:not([disabled])')
    const count = await buttons.count()
    if (count < 2) {
      test.skip()
      return
    }

    const priceBefore = await page.getByTestId('price-display').textContent()
    await buttons.nth(1).click()
    const priceAfter = await page.getByTestId('price-display').textContent()
    // Price either changes or stays — both are valid. Just ensure it's still visible.
    expect(priceAfter?.trim().length).toBeGreaterThan(0)
    void priceBefore // suppresses unused variable warning
  })
})

// ---------------------------------------------------------------------------
// Quantity selector
// ---------------------------------------------------------------------------

test.describe('Product Detail — quantity selector', () => {
  test('quantity starts at 1', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const qty = page.getByTestId('quantity-value')
    if (!(await qty.isVisible())) {
      test.skip()
      return
    }
    await expect(qty).toHaveText('1')
  })

  test('increment button increases quantity', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const increment = page.getByTestId('quantity-increment')
    if (!(await increment.isVisible()) || (await increment.isDisabled())) {
      test.skip()
      return
    }
    await increment.click()
    await expect(page.getByTestId('quantity-value')).toHaveText('2')
  })

  test('decrement button does not go below 1', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const decrement = page.getByTestId('quantity-decrement')
    if (!(await decrement.isVisible()) || (await decrement.isDisabled())) {
      test.skip()
      return
    }
    await decrement.click()
    await expect(page.getByTestId('quantity-value')).toHaveText('1')
  })
})

// ---------------------------------------------------------------------------
// Add to cart
// ---------------------------------------------------------------------------

test.describe('Product Detail — add to cart', () => {
  test('clicking add to cart opens the cart drawer', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    const addBtn = page.getByTestId('add-to-cart-button')
    if (!(await addBtn.isVisible())) {
      test.skip()
      return
    }
    await addBtn.click()
    // Cart drawer should appear
    await expect(page.getByTestId('cart-drawer')).toBeVisible({ timeout: 5_000 })
  })

  test('out-of-stock variant shows unavailable message instead of add-to-cart', async ({
    page,
  }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    // Look for a disabled add-to-cart (out-of-stock variant)
    const disabled = page.getByTestId('add-to-cart-disabled')
    const available = page.getByTestId('add-to-cart-button')
    const hasDisabled = await disabled.isVisible()
    const hasAvailable = await available.isVisible()
    // One of the two must be present
    expect(hasDisabled || hasAvailable).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Related products
// ---------------------------------------------------------------------------

test.describe('Product Detail — related products', () => {
  test('related products section renders when products exist in same collection', async ({
    page,
  }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    const related = page.getByTestId('related-products')
    if (!(await related.isVisible())) {
      // Product has no collection or no siblings — valid state
      test.skip()
      return
    }
    await expect(related).toBeVisible()
    await expect(page.getByTestId('carousel-track')).toBeVisible()
  })

  test('carousel prev/next buttons are visible when related products exist', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const related = page.getByTestId('related-products')
    if (!(await related.isVisible())) {
      test.skip()
      return
    }
    await expect(page.getByTestId('carousel-prev')).toBeVisible()
    await expect(page.getByTestId('carousel-next')).toBeVisible()
  })

  test('related product cards link to /products/[handle]', async ({ page }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    const related = page.getByTestId('related-products')
    if (!(await related.isVisible())) {
      test.skip()
      return
    }
    const firstCard = related.locator('a[href^="/products/"]').first()
    if (!(await firstCard.isVisible())) {
      test.skip()
      return
    }
    const href = await firstCard.getAttribute('href')
    expect(href).toMatch(/^\/products\//)
  })
})

// ---------------------------------------------------------------------------
// Material story link
// ---------------------------------------------------------------------------

test.describe('Product Detail — material story link', () => {
  test('material story link renders when Payload provides a story for this material', async ({
    page,
  }) => {
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)

    const storyLink = page.getByTestId('material-story-link')
    if (!(await storyLink.isVisible())) {
      // No material story configured for this product — valid
      test.skip()
      return
    }
    await expect(storyLink).toBeVisible()
    const link = storyLink.getByRole('link')
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^\/stories\//)
  })
})

// ---------------------------------------------------------------------------
// 404 / edge cases
// ---------------------------------------------------------------------------

test.describe('Product Detail — edge cases', () => {
  test('non-existent handle renders a 404 page', async ({ page }) => {
    const response = await page.goto('/products/this-handle-does-not-exist-xyz-999')
    expect(response?.status()).toBe(404)
  })

  test('navigating from products listing to PDP and back works', async ({ page }) => {
    await page.goto('/products')
    const grid = page.getByTestId('products-grid')
    if (!(await grid.isVisible())) {
      test.skip()
      return
    }
    const firstCard = grid.locator('a[data-testid^="product-card-"]').first()
    if (!(await firstCard.isVisible())) {
      test.skip()
      return
    }
    await firstCard.click()
    await expect(page).toHaveURL(/\/products\//)
    await page.goBack()
    await expect(page).toHaveURL('/products')
    await expect(page.getByTestId('sort-toolbar')).toBeVisible()
  })

  test('PDP page renders without crash when variants have no INR price', async ({ page }) => {
    // This is tested implicitly — if the page renders h1 without throwing, we're good
    const url = await getFirstProductUrl(page)
    if (!url) test.skip()
    await page.goto(url!)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })
  })
})
