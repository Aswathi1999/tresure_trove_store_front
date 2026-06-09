import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if there are products on the page (grid visible). */
async function hasProducts(page: import('@playwright/test').Page): Promise<boolean> {
  const grid = page.getByTestId('products-grid')
  return grid.isVisible()
}

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

test.describe('Products Listing — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products')
  })

  test('renders the breadcrumb', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(breadcrumb.getByText('All Products')).toBeVisible()
  })

  test('renders the category hero heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible()
  })

  test('renders the filter sidebar', async ({ page }) => {
    await expect(page.getByTestId('filter-sidebar')).toBeVisible()
  })

  test('renders the sort toolbar', async ({ page }) => {
    await expect(page.getByTestId('sort-toolbar')).toBeVisible()
  })

  test('renders products grid or no-products message', async ({ page }) => {
    const grid = page.getByTestId('products-grid')
    const empty = page.getByTestId('no-products-message')
    const hasGrid = await grid.isVisible()
    const hasEmpty = await empty.isVisible()
    expect(hasGrid || hasEmpty).toBe(true)
  })

  test('page title is set correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/All Products.*Treasure Trove/)
  })
})

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

test.describe('Products Listing — sort', () => {
  test('sort select is present with all four options', async ({ page }) => {
    await page.goto('/products')
    const select = page.getByTestId('sort-select')
    await expect(select).toBeVisible()
    await expect(select.getByRole('option', { name: 'Recommended' })).toBeAttached()
    await expect(select.getByRole('option', { name: 'Price: Low to High' })).toBeAttached()
    await expect(select.getByRole('option', { name: 'Price: High to Low' })).toBeAttached()
    await expect(select.getByRole('option', { name: 'Newest Arrivals' })).toBeAttached()
  })

  test('selecting Price: Low to High sets sort URL param', async ({ page }) => {
    await page.goto('/products')
    await page.getByTestId('sort-select').selectOption({ label: 'Price: Low to High' })
    await expect(page).toHaveURL(/sort=variants\.prices\.amount/)
  })

  test('selecting Price: High to Low sets sort URL param', async ({ page }) => {
    await page.goto('/products')
    await page.getByTestId('sort-select').selectOption({ label: 'Price: High to Low' })
    await expect(page).toHaveURL(/sort=-variants\.prices\.amount/)
  })

  test('selecting Newest Arrivals sets sort=-created_at', async ({ page }) => {
    await page.goto('/products')
    await page.getByTestId('sort-select').selectOption({ label: 'Newest Arrivals' })
    await expect(page).toHaveURL(/sort=-created_at/)
  })

  test('selecting Recommended removes the sort param', async ({ page }) => {
    await page.goto('/products?sort=-created_at')
    await page.getByTestId('sort-select').selectOption({ label: 'Recommended' })
    await expect(page).not.toHaveURL(/[?&]sort=/)
  })

  test('sort param is reflected in select value on load', async ({ page }) => {
    await page.goto('/products?sort=-variants.prices.amount')
    await expect(page.getByTestId('sort-select')).toHaveValue('-variants.prices.amount')
  })

  test('sort resets page to 1', async ({ page }) => {
    await page.goto('/products?page=2')
    await page.getByTestId('sort-select').selectOption({ label: 'Newest Arrivals' })
    await expect(page).not.toHaveURL(/[?&]page=/)
  })
})

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

test.describe('Products Listing — material filters', () => {
  const MATERIALS = ['Brass', 'Wood', 'Glass', 'Ceramic', 'Marble', 'Linen', 'Rattan']

  test('all material filter buttons are visible', async ({ page }) => {
    await page.goto('/products')
    for (const m of MATERIALS) {
      await expect(page.getByTestId(`material-filter-${m.toLowerCase()}`)).toBeVisible()
    }
  })

  test('clicking a material filter updates the URL', async ({ page }) => {
    await page.goto('/products')
    await page.getByTestId('material-filter-wood').click()
    await expect(page).toHaveURL(/material=Wood/)
  })

  test('active material filter button is highlighted', async ({ page }) => {
    await page.goto('/products?material=Wood')
    const btn = page.getByTestId('material-filter-wood')
    // Active state uses the gold background class
    await expect(btn).toHaveClass(/bg-\[var\(--color-tt-gold\)\]/)
  })

  test('inactive material filter button has border style', async ({ page }) => {
    await page.goto('/products?material=Wood')
    const btn = page.getByTestId('material-filter-glass')
    await expect(btn).toHaveClass(/border/)
    await expect(btn).not.toHaveClass(/bg-\[var\(--color-tt-gold\)\]/)
  })

  test('clicking the active material filter deselects it', async ({ page }) => {
    await page.goto('/products?material=Wood')
    await page.getByTestId('material-filter-wood').click()
    await expect(page).not.toHaveURL(/[?&]material=/)
  })

  test('material filter resets page to 1', async ({ page }) => {
    await page.goto('/products?page=2')
    await page.getByTestId('material-filter-brass').click()
    await expect(page).not.toHaveURL(/[?&]page=/)
    await expect(page).toHaveURL(/material=Brass/)
  })
})

test.describe('Products Listing — in-stock filter', () => {
  test('in-stock toggle is visible', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByTestId('in-stock-toggle')).toBeVisible()
  })

  test('in-stock toggle starts unchecked by default', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByTestId('in-stock-toggle')).toHaveAttribute('aria-checked', 'false')
  })

  test('clicking in-stock toggle sets inStock=1 in URL', async ({ page }) => {
    await page.goto('/products')
    await page.getByTestId('in-stock-toggle').click()
    await expect(page).toHaveURL(/inStock=1/)
  })

  test('in-stock toggle shows checked state from URL', async ({ page }) => {
    await page.goto('/products?inStock=1')
    await expect(page.getByTestId('in-stock-toggle')).toHaveAttribute('aria-checked', 'true')
  })

  test('clicking active in-stock toggle removes param from URL', async ({ page }) => {
    await page.goto('/products?inStock=1')
    await page.getByTestId('in-stock-toggle').click()
    await expect(page).not.toHaveURL(/[?&]inStock=/)
  })

  test('in-stock filter resets page to 1', async ({ page }) => {
    await page.goto('/products?page=2')
    await page.getByTestId('in-stock-toggle').click()
    await expect(page).not.toHaveURL(/[?&]page=/)
  })
})

test.describe('Products Listing — price range filter', () => {
  test('price range slider is visible', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByTestId('price-range-slider')).toBeVisible()
  })

  test('slider shows default max price label', async ({ page }) => {
    await page.goto('/products')
    // The price heading shows "Price (₹0 – ₹50,000)" at max value
    await expect(page.getByRole('heading', { name: /Price.*₹50,000/ })).toBeVisible()
  })

  test('maxPrice param is reflected in slider on load', async ({ page }) => {
    await page.goto('/products?maxPrice=25000')
    const slider = page.getByTestId('price-range-slider')
    await expect(slider).toHaveValue('25000')
  })
})

test.describe('Products Listing — clear filters', () => {
  test('clear all button is visible', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByTestId('clear-filters-button')).toBeVisible()
  })

  test('clear all resets all filters and navigates to /products', async ({ page }) => {
    await page.goto('/products?material=Wood&inStock=1&maxPrice=25000&sort=-created_at')
    await page.getByTestId('clear-filters-button').click()
    await expect(page).toHaveURL('/products')
  })

  test('clear all removes material filter', async ({ page }) => {
    await page.goto('/products?material=Brass')
    await page.getByTestId('clear-filters-button').click()
    await expect(page).not.toHaveURL(/material=/)
  })
})

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

test.describe('Products Listing — pagination', () => {
  test('previous page button is disabled on page 1', async ({ page }) => {
    await page.goto('/products')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    await expect(page.getByLabel('Previous page')).toBeDisabled()
  })

  test('last page next button is disabled', async ({ page }) => {
    await page.goto('/products')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    // Click last page button
    const pageButtons = pagination.locator('[data-testid^="page-button-"]')
    const count = await pageButtons.count()
    await pageButtons.nth(count - 1).click()
    await expect(page.getByLabel('Next page')).toBeDisabled()
  })

  test('page 2 button updates URL to page=2', async ({ page }) => {
    await page.goto('/products')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    const page2Btn = page.getByTestId('page-button-2')
    if (!(await page2Btn.isVisible())) {
      test.skip()
      return
    }
    await page2Btn.click()
    await expect(page).toHaveURL(/[?&]page=2/)
  })

  test('next button navigates to page 2', async ({ page }) => {
    await page.goto('/products')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    await page.getByLabel('Next page').click()
    await expect(page).toHaveURL(/[?&]page=2/)
  })

  test('page 1 button removes page param from URL', async ({ page }) => {
    await page.goto('/products')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    // Go to page 2 first, then back to page 1
    const nextBtn = page.getByLabel('Next page')
    if (await nextBtn.isDisabled()) {
      test.skip()
      return
    }
    await nextBtn.click()
    await expect(page).toHaveURL(/page=2/)
    await page.getByTestId('page-button-1').click()
    await expect(page).not.toHaveURL(/[?&]page=/)
  })

  test('sort param is preserved across page navigation', async ({ page }) => {
    await page.goto('/products?sort=-created_at')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    const nextBtn = page.getByLabel('Next page')
    if (await nextBtn.isDisabled()) {
      test.skip()
      return
    }
    await nextBtn.click()
    await expect(page).toHaveURL(/sort=-created_at/)
    await expect(page).toHaveURL(/page=2/)
  })

  test('material filter is preserved across page navigation', async ({ page }) => {
    await page.goto('/products?material=Wood')
    const pagination = page.getByTestId('pagination')
    if (!(await pagination.isVisible())) {
      test.skip()
      return
    }
    const nextBtn = page.getByLabel('Next page')
    if (await nextBtn.isDisabled()) {
      test.skip()
      return
    }
    await nextBtn.click()
    await expect(page).toHaveURL(/material=Wood/)
  })

  test('pagination does not render when there are fewer than 12 products', async ({ page }) => {
    await page.goto('/products')
    const grid = page.getByTestId('products-grid')
    const pagination = page.getByTestId('pagination')

    const hasGrid = await grid.isVisible()
    if (!hasGrid) {
      await expect(pagination).not.toBeVisible()
      return
    }

    const cardCount = await grid.locator('a[data-testid^="product-card-"]').count()
    if (cardCount < 12) {
      await expect(pagination).not.toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// Product cards
// ---------------------------------------------------------------------------

test.describe('Products Listing — product cards', () => {
  test('product cards link to /products/[handle]', async ({ page }) => {
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
    const href = await firstCard.getAttribute('href')
    expect(href).toMatch(/^\/products\//)
  })

  test('product cards show a title', async ({ page }) => {
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
    // Title is rendered in an h4 inside the card
    const title = firstCard.locator('h4')
    await expect(title).not.toBeEmpty()
  })

  test('results count shows correct format', async ({ page }) => {
    await page.goto('/products')
    const text = await page.getByTestId('results-count').textContent()
    expect(text).toMatch(/(No results|Displaying \d+–\d+ of \d+ Results)/i)
  })

  test('results count shows "No results" when grid is empty', async ({ page }) => {
    await page.goto('/products')
    const hasGrid = await page.getByTestId('products-grid').isVisible()
    if (hasGrid) {
      test.skip()
      return
    }
    await expect(page.getByTestId('results-count')).toHaveText(/No results/i)
  })

  test('clicking a product card navigates to the product detail page', async ({ page }) => {
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
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await expect(page).toHaveURL(href ?? '/products')
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test.describe('Products Listing — edge cases', () => {
  test('page=0 falls back to page 1 without crash', async ({ page }) => {
    await page.goto('/products?page=0')
    await expect(page.getByTestId('sort-toolbar')).toBeVisible({ timeout: 30_000 })
    // currentPage = Math.max(1, 0) = 1, so no page param in resulting page
  })

  test('page=9999 renders without crashing (shows empty or last page)', async ({ page }) => {
    await page.goto('/products?page=9999')
    await expect(page.getByTestId('sort-toolbar')).toBeVisible({ timeout: 30_000 })
    // Either shows empty grid or the products from page 1 (offset exceeds count)
    const grid = page.getByTestId('products-grid')
    const empty = page.getByTestId('no-products-message')
    const hasGrid = await grid.isVisible()
    const hasEmpty = await empty.isVisible()
    expect(hasGrid || hasEmpty).toBe(true)
  })

  test('combining sort and material filter preserves both URL params', async ({ page }) => {
    await page.goto('/products')
    await page.getByTestId('sort-select').selectOption({ label: 'Newest Arrivals' })
    await expect(page).toHaveURL(/sort=-created_at/)
    await page.getByTestId('material-filter-wood').click()
    await expect(page).toHaveURL(/sort=-created_at/)
    await expect(page).toHaveURL(/material=Wood/)
  })

  test('in-stock toggle preserves existing sort param', async ({ page }) => {
    await page.goto('/products?sort=-created_at')
    await page.getByTestId('in-stock-toggle').click()
    await expect(page).toHaveURL(/sort=-created_at/)
    await expect(page).toHaveURL(/inStock=1/)
  })

  test('material filter preserves existing sort param', async ({ page }) => {
    await page.goto('/products?sort=variants.prices.amount')
    await page.getByTestId('material-filter-marble').click()
    await expect(page).toHaveURL(/sort=variants\.prices\.amount/)
    await expect(page).toHaveURL(/material=Marble/)
  })

  test('page renders correctly with all filters combined', async ({ page }) => {
    await page.goto('/products?sort=-created_at&material=Wood&inStock=1&maxPrice=40000')
    await expect(page.getByTestId('sort-toolbar')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('filter-sidebar')).toBeVisible()
    // Sort select should reflect the URL param
    await expect(page.getByTestId('sort-select')).toHaveValue('-created_at')
    // Material button should be highlighted
    await expect(page.getByTestId('material-filter-wood')).toHaveClass(
      /bg-\[var\(--color-tt-gold\)\]/,
    )
    // In-stock toggle should be checked
    await expect(page.getByTestId('in-stock-toggle')).toHaveAttribute('aria-checked', 'true')
  })
})

// ---------------------------------------------------------------------------
// Filter result count
// ---------------------------------------------------------------------------

test.describe('Products Listing — filter result count', () => {
  test('filter sidebar shows result count', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByTestId('filter-result-count')).toBeVisible()
  })

  test('filter result count text ends with "result" or "results"', async ({ page }) => {
    await page.goto('/products')
    const text = await page.getByTestId('filter-result-count').textContent()
    expect(text).toMatch(/\d+ results?/i)
  })
})
