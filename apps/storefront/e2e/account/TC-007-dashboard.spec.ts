import { expect, test } from '@playwright/test'
import { assertRedirectsToLogin, loginAndGoTo } from './helpers'

test.describe('Account Dashboard', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await assertRedirectsToLogin(page, '/account')
  })

  test('shows the dashboard for an authenticated user', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await expect(page.getByTestId('account-dashboard')).toBeVisible({ timeout: 15_000 })
  })

  test('shows session state as signed in', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await expect(page.getByTestId('account-session-state')).toContainText(/signed in/i, {
      timeout: 15_000,
    })
  })

  test('displays summary cards for orders, addresses, and wishlist', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await expect(page.getByTestId('dashboard-orders-card')).toBeVisible()
    await expect(page.getByTestId('dashboard-addresses-card')).toBeVisible()
    await expect(page.getByTestId('dashboard-wishlist-card')).toBeVisible()
  })

  test('shows recent order rows linked to order detail pages', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    const firstOrder = page.getByTestId('dashboard-order-order_01')
    await expect(firstOrder).toBeVisible()
    await expect(firstOrder).toHaveAttribute('href', /\/account\/orders\/order_01/)
  })

  test('"View All Orders" link navigates to orders page', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await page.getByTestId('dashboard-view-all-orders').click()
    await expect(page).toHaveURL(/\/account\/orders$/, { timeout: 15_000 })
    await expect(page.getByTestId('orders-page')).toBeVisible()
  })

  test('account nav is visible on the dashboard', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await expect(page.getByTestId('account-nav')).toBeVisible()
  })
})
