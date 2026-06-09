import { expect, test } from '@playwright/test'
import { STRONG_PASSWORD, registerUser, uniqueEmail } from './helpers'

test.describe('Login', () => {
  test('shows client validation errors when the form is submitted empty', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-submit-button').click()

    await expect(page.getByTestId('login-email-input-error')).toBeVisible()
    await expect(page.getByTestId('login-password-input-error')).toBeVisible()
  })

  test('shows an invalid-credentials error for an unknown account', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-email-input').fill(uniqueEmail('nobody'))
    await page.getByTestId('login-password-input').fill('WrongPass1!')
    await page.getByTestId('login-submit-button').click()

    await expect(page.getByTestId('login-credential-error')).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/login$/)
  })

  test('signs an existing customer in and lands on /account', async ({ page }) => {
    const email = uniqueEmail('login')

    await registerUser(page, { name: 'Login Tester', email, password: STRONG_PASSWORD })

    await page.context().clearCookies()
    await page.goto('/login')
    await page.getByTestId('login-email-input').fill(email)
    await page.getByTestId('login-password-input').fill(STRONG_PASSWORD)
    await page.getByTestId('login-submit-button').click()

    await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 })
    await expect(page.getByTestId('account-session-state')).toContainText(/signed in/i)

    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'tt_session')).toBeTruthy()
  })

  test('navigates from login to register via the create-account link', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-register-link').click()
    await expect(page).toHaveURL(/\/register$/)
    await expect(page.getByTestId('register-page')).toBeVisible()
  })

  test('navigates from login to forgot-password via the forgot link', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-forgot-link').click()
    await expect(page).toHaveURL(/\/forgot-password$/)
    await expect(page.getByTestId('forgot-password-page')).toBeVisible()
  })
})
