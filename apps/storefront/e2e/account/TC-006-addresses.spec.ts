import { expect, test } from '@playwright/test'
import { assertRedirectsToLogin, loginAndGoTo } from './helpers'

test.describe('Account — Address Book', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await assertRedirectsToLogin(page, '/account/addresses')
  })

  test('shows address book page for authenticated user', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await expect(page.getByTestId('addresses-page')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('address-book')).toBeVisible()
  })

  test('renders mock address cards', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await expect(page.getByTestId('address-card-addr_01')).toBeVisible()
    await expect(page.getByTestId('address-card-addr_02')).toBeVisible()
  })

  test('shows "Default" badge on the default address', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    const homeCard = page.getByTestId('address-card-addr_01')
    await expect(homeCard).toContainText(/default/i)
  })

  test('"Add New Address" button opens the address form', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await page.getByTestId('add-address-button').click()
    await expect(page.getByTestId('address-form')).toBeVisible()
    await expect(page.locator('text=Add New Address')).toBeVisible()
  })

  test('cancel from add form returns to address list', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await page.getByTestId('add-address-button').click()
    await page.getByTestId('address-form-cancel').click()
    await expect(page.getByTestId('address-book')).toBeVisible()
    await expect(page.getByTestId('address-form')).not.toBeVisible()
  })

  test('filling and submitting the add form adds a new address card', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await page.getByTestId('add-address-button').click()

    await page.getByTestId('input-label').fill('Guest House')
    await page.getByTestId('input-full-name').fill('Priya Singh')
    await page.getByTestId('input-phone').fill('+91 77777 88888')
    await page.getByTestId('input-line1').fill('45 Lake View Road, Phase 2')
    await page.getByTestId('input-city').fill('Pune')
    await page.getByTestId('input-state').fill('Maharashtra')
    await page.getByTestId('input-pin').fill('411001')
    await page.getByTestId('address-form-submit').click()

    await expect(page.getByTestId('address-book')).toBeVisible()
    await expect(page.locator('text=Priya Singh')).toBeVisible()
  })

  test('deleting an address removes it from the list', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await expect(page.getByTestId('address-card-addr_02')).toBeVisible()
    await page.getByTestId('delete-address-addr_02').click()
    await expect(page.getByTestId('address-card-addr_02')).not.toBeVisible()
  })

  test('"Set Default" promotes an address to default', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await page.getByTestId('set-default-addr_02').click()
    const officeCard = page.getByTestId('address-card-addr_02')
    await expect(officeCard).toContainText(/default/i)
  })

  test('edit button opens form with existing address data', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await page.getByTestId('edit-address-addr_01').click()
    await expect(page.getByTestId('address-form')).toBeVisible()
    await expect(page.getByTestId('input-label')).toHaveValue('Home')
    await expect(page.getByTestId('input-city')).toHaveValue('Bengaluru')
  })

  test('saving edits updates the address card', async ({ page }) => {
    await loginAndGoTo(page, '/account/addresses')
    await page.getByTestId('edit-address-addr_01').click()
    await page.getByTestId('input-city').clear()
    await page.getByTestId('input-city').fill('Hyderabad')
    await page.getByTestId('address-form-submit').click()
    await expect(page.getByTestId('address-card-addr_01')).toContainText('Hyderabad')
  })
})
