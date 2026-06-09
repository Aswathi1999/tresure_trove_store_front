import { expect, type Page } from '@playwright/test'
import { registerUser, loginUser, uniqueEmail, STRONG_PASSWORD } from '../auth/helpers'

export { uniqueEmail, STRONG_PASSWORD, loginUser, registerUser }

export async function loginAndGoTo(page: Page, path: string): Promise<void> {
  const email = uniqueEmail('account')
  await registerUser(page, { name: 'Account Tester', email, password: STRONG_PASSWORD })
  await page.goto(path)
}

export async function assertRedirectsToLogin(page: Page, path: string): Promise<void> {
  await page.context().clearCookies()
  await page.goto(path)
  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 })
}
