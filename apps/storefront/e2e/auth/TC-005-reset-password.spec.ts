import { expect, test } from '@playwright/test'
import { craftExpiredJwt } from './helpers'

test.describe('Reset password', () => {
  test('shows an invalid-link screen when the token is missing', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.getByTestId('reset-password-invalid')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('reset-password-request-new-link')).toBeVisible()
  })

  test('shows an invalid-link screen when the token is malformed', async ({ page }) => {
    await page.goto('/reset-password?token=not-a-real-jwt')
    await expect(page.getByTestId('reset-password-invalid')).toBeVisible({ timeout: 15_000 })
  })

  test('shows an expired-link screen when the token has an expired exp claim', async ({ page }) => {
    await page.goto(`/reset-password?token=${craftExpiredJwt()}`)
    await expect(page.getByTestId('reset-password-expired')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('reset-password-back-to-login')).toBeVisible()
  })

  test('navigates from expired screen to forgot-password to request a new link', async ({
    page,
  }) => {
    await page.goto(`/reset-password?token=${craftExpiredJwt()}`)
    await expect(page.getByTestId('reset-password-expired')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('reset-password-request-new-link').click()
    await expect(page).toHaveURL(/\/forgot-password$/)
  })
})
