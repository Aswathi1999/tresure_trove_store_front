import { expect, test } from '@playwright/test'
import { assertRedirectsToLogin, loginAndGoTo } from './helpers'

test.describe('Account — Wishlist', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await assertRedirectsToLogin(page, '/account/wishlist')
  })

  test('shows wishlist page for authenticated user', async ({ page }) => {
    await loginAndGoTo(page, '/account/wishlist')
    await expect(page.getByTestId('wishlist-page')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('wishlist-grid')).toBeVisible()
  })

  test('renders all four mock wishlist items', async ({ page }) => {
    await loginAndGoTo(page, '/account/wishlist')
    await expect(page.getByTestId('wishlist-item-wish_01')).toBeVisible()
    await expect(page.getByTestId('wishlist-item-wish_02')).toBeVisible()
    await expect(page.getByTestId('wishlist-item-wish_03')).toBeVisible()
    await expect(page.getByTestId('wishlist-item-wish_04')).toBeVisible()
  })

  test('displays item names', async ({ page }) => {
    await loginAndGoTo(page, '/account/wishlist')
    await expect(page.locator('text=Ōkura Lounge Chair')).toBeVisible()
    await expect(page.locator('text=Handcrafted Brass Pendant')).toBeVisible()
  })

  test('items with sale price show original price', async ({ page }) => {
    await loginAndGoTo(page, '/account/wishlist')
    await expect(page.locator('text=₹9,500')).toBeVisible()
  })

  test('remove button removes item from wishlist', async ({ page }) => {
    await loginAndGoTo(page, '/account/wishlist')
    await expect(page.getByTestId('wishlist-item-wish_01')).toBeVisible()
    await page.getByTestId('remove-wishlist-mobile-wish_01').click()
    await expect(page.getByTestId('wishlist-item-wish_01')).not.toBeVisible()
  })

  test('wishlist item links to product detail page', async ({ page }) => {
    await loginAndGoTo(page, '/account/wishlist')
    const links = page.locator('[href="/products/okura-lounge-chair"]')
    await expect(links.first()).toBeVisible()
  })

  test('shows empty state with "Discover Products" link after all items removed', async ({
    page,
  }) => {
    await loginAndGoTo(page, '/account/wishlist')
    for (const id of ['wish_01', 'wish_02', 'wish_03', 'wish_04']) {
      await page.getByTestId(`remove-wishlist-mobile-${id}`).click()
    }
    await expect(page.getByTestId('wishlist-empty')).toBeVisible()
    await expect(page.locator('text=Your wishlist is empty')).toBeVisible()
    await expect(page.getByRole('link', { name: /discover products/i })).toBeVisible()
  })
})
