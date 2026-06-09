import { expect, test } from '@playwright/test'
import { STRONG_PASSWORD, registerUser, uniqueEmail } from './helpers'

test.describe('Logout', () => {
  test('signs the user out, clears the session cookie, and lands on /login', async ({ page }) => {
    const email = uniqueEmail('logout')
    await registerUser(page, { name: 'Logout Tester', email, password: STRONG_PASSWORD })

    await expect(page.getByTestId('account-logout-button')).toBeVisible()

    await page.getByTestId('account-logout-button').click()

    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 })

    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'tt_session')).toBeFalsy()

    await page.goto('/account')
    await expect(page.getByTestId('account-session-state')).toContainText(/not signed in/i)
  })
})
