import { expect, test } from '@playwright/test'
import { loginAndGoTo, uniqueEmail, STRONG_PASSWORD, registerUser } from './helpers'

test.describe('Account Navigation', () => {
  test('account nav renders on the dashboard', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await expect(page.getByTestId('account-nav')).toBeVisible({ timeout: 15_000 })
  })

  test('nav link "My Orders" navigates to orders page', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await page.getByTestId('nav-orders').click()
    await expect(page).toHaveURL(/\/account\/orders$/, { timeout: 15_000 })
    await expect(page.getByTestId('orders-page')).toBeVisible()
  })

  test('nav link "Addresses" navigates to address book', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await page.getByTestId('nav-addresses').click()
    await expect(page).toHaveURL(/\/account\/addresses$/, { timeout: 15_000 })
    await expect(page.getByTestId('addresses-page')).toBeVisible()
  })

  test('nav link "Wishlist" navigates to wishlist', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await page.getByTestId('nav-wishlist').click()
    await expect(page).toHaveURL(/\/account\/wishlist$/, { timeout: 15_000 })
    await expect(page.getByTestId('wishlist-page')).toBeVisible()
  })

  test('nav link "Settings" navigates to settings page', async ({ page }) => {
    await loginAndGoTo(page, '/account')
    await page.getByTestId('nav-settings').click()
    await expect(page).toHaveURL(/\/account\/settings$/, { timeout: 15_000 })
    await expect(page.getByTestId('settings-page')).toBeVisible()
  })

  test('nav link "Dashboard" navigates back to dashboard', async ({ page }) => {
    await loginAndGoTo(page, '/account/orders')
    await page.getByTestId('nav-dashboard').click()
    await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 })
    await expect(page.getByTestId('account-dashboard')).toBeVisible()
  })

  test('sign out button logs the user out and redirects to /login', async ({ page }) => {
    const email = uniqueEmail('nav')
    await registerUser(page, { name: 'Nav Tester', email, password: STRONG_PASSWORD })
    await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 })

    await page.getByTestId('account-nav-signout').click()
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 })

    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'tt_session')).toBeFalsy()
  })

  test('visiting /account after sign-out redirects to /login', async ({ page }) => {
    const email = uniqueEmail('nav2')
    await registerUser(page, { name: 'Nav Tester 2', email, password: STRONG_PASSWORD })

    await page.getByTestId('account-nav-signout').click()
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 })

    await page.goto('/account')
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 })
  })
})
