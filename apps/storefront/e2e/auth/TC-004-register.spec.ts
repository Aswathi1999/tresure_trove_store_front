import { expect, test } from '@playwright/test'
import { STRONG_PASSWORD, registerUser, uniqueEmail } from './helpers'

test.describe('Registration', () => {
  test('shows client validation errors when the form is submitted empty', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('register-submit-button').click()

    await expect(page.getByTestId('register-name-input-error')).toBeVisible()
    await expect(page.getByTestId('register-email-input-error')).toBeVisible()
    await expect(page.getByTestId('register-password-input-error')).toBeVisible()
    await expect(page.getByTestId('register-confirm-password-input-error')).toBeVisible()
  })

  test('blocks submit when passwords do not match', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('register-name-input').fill('Mismatch User')
    await page.getByTestId('register-email-input').fill(uniqueEmail('mismatch'))
    await page.getByTestId('register-password-input').fill(STRONG_PASSWORD)
    await page.getByTestId('register-confirm-password-input').fill('DifferentPass123!')
    await page.getByTestId('register-submit-button').click()

    await expect(page.getByTestId('register-confirm-password-input-error')).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })

  test('creates a new account and lands on /account with a session', async ({ page }) => {
    const email = uniqueEmail('signup')

    await registerUser(page, { name: 'New Customer', email, password: STRONG_PASSWORD })

    await expect(page.getByTestId('account-heading')).toBeVisible()
    await expect(page.getByTestId('account-session-state')).toContainText(/signed in/i)
    await expect(page.getByTestId('account-logout-button')).toBeVisible()

    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'tt_session')).toBeTruthy()
  })

  test('shows an email-exists error when signing up with a known email', async ({ page }) => {
    const email = uniqueEmail('dup')

    await registerUser(page, { name: 'First Signup', email, password: STRONG_PASSWORD })

    await page.goto('/register')
    await page.getByTestId('register-name-input').fill('Second Signup')
    await page.getByTestId('register-email-input').fill(email)
    await page.getByTestId('register-password-input').fill(STRONG_PASSWORD)
    await page.getByTestId('register-confirm-password-input').fill(STRONG_PASSWORD)
    await page.getByTestId('register-submit-button').click()

    await expect(page.getByTestId('register-email-exists-error')).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/register$/)
  })
})
