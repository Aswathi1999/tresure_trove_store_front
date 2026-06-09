import { expect, test } from '@playwright/test'
import { uniqueEmail } from './helpers'

test.describe('Forgot password', () => {
  test('shows client validation errors when submitted empty', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByTestId('forgot-password-submit-button').click()
    await expect(page.getByTestId('forgot-password-email-input-error')).toBeVisible()
  })

  test('rejects an invalid email format', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByTestId('forgot-password-email-input').fill('not-an-email')
    await page.getByTestId('forgot-password-submit-button').click()
    await expect(page.getByTestId('forgot-password-email-input-error')).toBeVisible()
  })

  test('always shows a generic success confirmation for a valid email', async ({ page }) => {
    const email = uniqueEmail('forgot')

    await page.goto('/forgot-password')
    await page.getByTestId('forgot-password-email-input').fill(email)
    await page.getByTestId('forgot-password-submit-button').click()

    await expect(page.getByTestId('forgot-password-success')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('forgot-password-success')).toContainText(email)
    await expect(page.getByTestId('forgot-password-back-to-login')).toBeVisible()
  })

  test('navigates back to login from the success screen', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByTestId('forgot-password-email-input').fill(uniqueEmail('nav'))
    await page.getByTestId('forgot-password-submit-button').click()

    await expect(page.getByTestId('forgot-password-success')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('forgot-password-back-to-login').click()
    await expect(page).toHaveURL(/\/login$/)
  })
})
