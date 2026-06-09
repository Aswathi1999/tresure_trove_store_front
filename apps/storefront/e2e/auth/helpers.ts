import { expect, type Page } from '@playwright/test'

export function uniqueEmail(prefix = 'user'): string {
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${stamp}-${rand}@e2e.treasuretrove.test`
}

export const STRONG_PASSWORD = 'TestPass1234!'

export async function registerUser(
  page: Page,
  input: { name: string; email: string; password: string },
): Promise<void> {
  await page.goto('/register')
  await page.getByTestId('register-name-input').fill(input.name)
  await page.getByTestId('register-email-input').fill(input.email)
  await page.getByTestId('register-password-input').fill(input.password)
  await page.getByTestId('register-confirm-password-input').fill(input.password)
  await page.getByTestId('register-submit-button').click()
  await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 })
}

export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-password-input').fill(password)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 })
}

function base64url(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function craftExpiredJwt(): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({ exp: 1, sub: 'expired-test' }))
  return `${header}.${payload}.signature`
}
