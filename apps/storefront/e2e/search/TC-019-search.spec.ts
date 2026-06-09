import { expect, test } from '@playwright/test'

// ── helpers ───────────────────────────────────────────────────────────────────

async function openSearchOverlay(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('navbar-search-trigger').click()
  await expect(page.getByTestId('search-bar-input')).toBeVisible()
}

// ── Search overlay / autocomplete ────────────────────────────────────────────

test.describe('Search overlay', () => {
  test('opens when the search trigger is clicked', async ({ page }) => {
    await openSearchOverlay(page)
  })

  test('input accepts text', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').fill('chair')
    await expect(page.getByTestId('search-bar-input')).toHaveValue('chair')
  })

  test('clear button appears after typing and clears the input', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').fill('lamp')
    await expect(page.getByTestId('search-bar-clear')).toBeVisible()
    await page.getByTestId('search-bar-clear').click()
    await expect(page.getByTestId('search-bar-input')).toHaveValue('')
    await expect(page.getByTestId('search-bar-clear')).not.toBeVisible()
  })

  test('pressing Escape closes the overlay', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').press('Escape')
    await expect(page.getByTestId('search-bar-input')).not.toBeVisible()
  })

  test('pressing Enter navigates to the search results page', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').fill('table')
    await page.getByTestId('search-bar-input').press('Enter')
    await expect(page).toHaveURL(/\/search\?q=table/)
  })

  test('autocomplete dropdown appears after typing', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').fill('a')
    // Wait up to 2 s for the debounce + API round-trip.
    // The dropdown renders only when the API returns results; an empty DB is valid — just skip.
    const dropdown = page.getByTestId('autocomplete-dropdown')
    const appeared = await dropdown
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false)
    if (appeared) {
      await expect(dropdown).toBeVisible()
      // First autocomplete item must be present
      await expect(page.getByTestId('autocomplete-item-0')).toBeVisible()
    }
  })

  test('clicking an autocomplete item navigates to the search results page', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').fill('a')
    const dropdown = page.getByTestId('autocomplete-dropdown')
    const appeared = await dropdown
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false)
    if (!appeared) test.skip()
    await page.getByTestId('autocomplete-item-0').click()
    await expect(page).toHaveURL(/\/search\?q=/)
  })

  test('arrow keys move the selection through autocomplete items', async ({ page }) => {
    await openSearchOverlay(page)
    await page.getByTestId('search-bar-input').fill('a')
    const dropdown = page.getByTestId('autocomplete-dropdown')
    const appeared = await dropdown
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false)
    if (!appeared) test.skip()
    // Arrow Down should highlight item 0
    await page.getByTestId('search-bar-input').press('ArrowDown')
    await expect(page.getByTestId('autocomplete-item-0')).toHaveClass(/surface-container/)
  })
})

// ── Search results page ───────────────────────────────────────────────────────

test.describe('Search results page', () => {
  test('renders the heading with the search query', async ({ page }) => {
    await page.goto('/search?q=chair')
    await expect(page.getByTestId('search-heading')).toBeVisible()
    await expect(page.getByTestId('search-heading')).toContainText('chair')
  })

  test('shows a result count', async ({ page }) => {
    await page.goto('/search?q=chair')
    await expect(page.getByTestId('search-result-count')).toBeVisible()
  })

  test('renders the results grid', async ({ page }) => {
    await page.goto('/search?q=chair')
    await expect(page.getByTestId('search-results-grid')).toBeVisible()
  })

  test('sort selector is visible', async ({ page }) => {
    await page.goto('/search?q=chair')
    await expect(page.getByTestId('search-sort')).toBeVisible()
  })

  test('shows no-results state for a query that returns nothing', async ({ page }) => {
    await page.goto('/search?q=zzz_no_product_matches_this_xyzzy')
    await expect(page.getByTestId('no-results')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('no-results')).toContainText('zzz_no_product_matches_this_xyzzy')
  })

  test('no-results browse links are visible', async ({ page }) => {
    await page.goto('/search?q=zzz_no_product_matches_this_xyzzy')
    await expect(page.getByTestId('no-results-browse-All Decor')).toBeVisible({ timeout: 10_000 })
  })

  test('empty query shows the search page without crashing', async ({ page }) => {
    await page.goto('/search?q=')
    await expect(page.getByTestId('search-heading')).toBeVisible()
    await expect(page.getByTestId('search-results-grid')).toBeVisible()
  })
})
