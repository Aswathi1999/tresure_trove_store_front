import { expect, test } from '@playwright/test'
import { assertRedirectsToLogin, loginAndGoTo } from './helpers'

test.describe('Account — Profile Settings', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await assertRedirectsToLogin(page, '/account/settings')
  })

  test('shows settings page for authenticated user', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('profile-settings')).toBeVisible()
  })

  test('displays read-only profile data', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await expect(page.getByTestId('profile-first-name')).toContainText('Arjun')
    await expect(page.getByTestId('profile-last-name')).toContainText('Mehra')
    await expect(page.getByTestId('profile-email')).toContainText('arjun.mehra@example.com')
    await expect(page.getByTestId('profile-phone')).toContainText('+91 98765 43210')
  })

  test('"Edit Profile" button opens the edit form', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await expect(page.getByTestId('edit-profile-form')).toBeVisible()
  })

  test('edit form fields are pre-filled with current profile values', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await expect(page.getByTestId('input-first-name')).toHaveValue('Arjun')
    await expect(page.getByTestId('input-last-name')).toHaveValue('Mehra')
    await expect(page.getByTestId('input-phone')).toHaveValue('+91 98765 43210')
  })

  test('email field is disabled in edit mode', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await expect(page.getByTestId('input-email-disabled')).toBeDisabled()
  })

  test('validation errors appear when submitting empty required fields', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await page.getByTestId('input-first-name').clear()
    await page.getByTestId('input-last-name').clear()
    await page.getByTestId('profile-save-button').click()
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()
  })

  test('cancelling edit hides the form', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await expect(page.getByTestId('edit-profile-form')).toBeVisible()
    await page.getByTestId('profile-cancel-button').click()
    await expect(page.getByTestId('edit-profile-form')).not.toBeVisible()
  })

  test('saving changes updates the displayed profile data', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await page.getByTestId('input-first-name').clear()
    await page.getByTestId('input-first-name').fill('Rajan')
    await page.getByTestId('profile-save-button').click()
    await expect(page.getByTestId('profile-first-name')).toContainText('Rajan', { timeout: 5_000 })
  })

  test('save shows a success indicator', async ({ page }) => {
    await loginAndGoTo(page, '/account/settings')
    await page.getByTestId('edit-profile-button').click()
    await page.getByTestId('input-last-name').clear()
    await page.getByTestId('input-last-name').fill('Kapoor')
    await page.getByTestId('profile-save-button').click()
    await expect(page.getByTestId('profile-save-success')).toBeVisible({ timeout: 5_000 })
  })
})
