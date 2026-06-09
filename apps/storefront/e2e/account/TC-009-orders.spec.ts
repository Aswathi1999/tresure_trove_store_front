import { expect, test } from '@playwright/test'
import { assertRedirectsToLogin, loginAndGoTo } from './helpers'

test.describe('Account — Orders', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await assertRedirectsToLogin(page, '/account/orders')
  })

  test('shows orders list for authenticated user', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders')
    await expect(page.getByTestId('orders-page')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('orders-list')).toBeVisible()
  })

  test('renders all four mock order rows', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders')
    await expect(page.getByTestId('order-row-order_01')).toBeVisible()
    await expect(page.getByTestId('order-row-order_02')).toBeVisible()
    await expect(page.getByTestId('order-row-order_03')).toBeVisible()
    await expect(page.getByTestId('order-row-order_04')).toBeVisible()
  })

  test('shows status badges for all order statuses', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders')
    await expect(page.getByTestId('status-badge-delivered')).toBeVisible()
    await expect(page.getByTestId('status-badge-shipped')).toBeVisible()
    await expect(page.getByTestId('status-badge-processing')).toBeVisible()
    await expect(page.getByTestId('status-badge-cancelled')).toBeVisible()
  })

  test('order row is a link to the order detail page', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders')
    const firstRow = page.getByTestId('order-row-order_01')
    await expect(firstRow).toHaveAttribute('href', /\/account\/orders\/order_01/)
  })

  test('clicking an order row navigates to order detail', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders')
    await page.getByTestId('order-row-order_01').click()
    await expect(page).toHaveURL(/\/account\/orders\/order_01$/, { timeout: 15_000 })
  })

  test('order detail page shows order information', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders/order_01')
    await expect(page.getByTestId('order-detail-page')).toBeVisible({ timeout: 15_000 })
  })

  test('order detail page shows the order number', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders/order_01')
    await expect(page.locator('text=TT-2026-0041')).toBeVisible({ timeout: 15_000 })
  })

  test('order detail page shows all ordered items', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders/order_01')
    await expect(page.locator('text=Ōkura Lounge Chair')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=Brass Floor Lamp')).toBeVisible()
  })
})
