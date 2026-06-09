/**
 * Checkout Integration Tests — TASK-044
 *
 * Prerequisites for full test suite:
 *  1. Medusa backend running at localhost:9000 with at least one region and product.
 *  2. Shipping options configured in Medusa (fulfillment provider + service zones).
 *  3. CHECKOUT_TEST_MODE=true set on the Next.js server process.
 *     - CI: automatically set via playwright.config.ts webServer.env
 *     - Local: start the dev server with `CHECKOUT_TEST_MODE=true pnpm dev --filter=storefront`
 *       then run `pnpm playwright test e2e/checkout`
 */

import { expect, test } from '@playwright/test'
import { createCheckoutCart, setCartCookie, fillAddressForm, TEST_ADDRESS } from './helpers'

// ─── Address Step ─────────────────────────────────────────────────────────────

test.describe('Address Step', () => {
  test('renders checkout page with stepper and address form', async ({ page }) => {
    await page.goto('/checkout')

    await expect(page.getByTestId('checkout-header')).toBeVisible()
    await expect(page.getByTestId('checkout-stepper')).toBeVisible()
    await expect(page.getByTestId('address-step')).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/checkout')
    await page.getByTestId('address-continue-button').click()

    // Email and full name are required
    await expect(page.locator('text=Valid email address is required')).toBeVisible()
    await expect(page.locator('text=Full name is required')).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/checkout')
    await page.getByTestId('input-email').fill('not-an-email')
    await page.getByTestId('address-continue-button').click()

    await expect(page.locator('text=Valid email address is required')).toBeVisible()
  })

  test('shows PIN code validation error for India (non-6-digit)', async ({ page }) => {
    await page.goto('/checkout')
    await page.getByTestId('input-email').fill('test@example.com')
    await page.getByTestId('input-full-name').fill('Arjun Mehra')
    await page.getByTestId('input-phone').fill('+919876543210')
    await page.getByTestId('input-address-line-1').fill('42 MG Road')
    await page.getByTestId('input-city').fill('Bengaluru')
    await page.getByTestId('input-state').fill('Karnataka')
    await page.getByTestId('input-pincode').fill('1234') // invalid for IN
    await page.getByTestId('input-country').selectOption('IN')
    await page.getByTestId('address-continue-button').click()

    await expect(page.locator('text=Enter a valid 6-digit PIN code')).toBeVisible()
  })

  test('saves address to Medusa cart and advances to shipping step', async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')
    await expect(page.getByTestId('address-step')).toBeVisible()

    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()

    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
  })
})

// ─── Shipping Step ────────────────────────────────────────────────────────────

test.describe('Shipping Step', () => {
  test.beforeEach(async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')
    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()
    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
  })

  test('displays shipping options loaded from Medusa', async ({ page }) => {
    // Wait for loading spinner to disappear
    await expect(
      page.locator('[data-testid="shipping-step"] [class*="animate-spin"]'),
    ).not.toBeVisible({
      timeout: 15_000,
    })

    // At least one shipping option should be present
    const options = page.locator('[data-testid^="shipping-option-"]')
    await expect(options.first()).toBeVisible({ timeout: 15_000 })
  })

  test('allows selecting a shipping method', async ({ page }) => {
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })

    // All shipping options are radio inputs; click the second if it exists
    const allOptions = page.locator('[data-testid^="shipping-radio-"]')
    const count = await allOptions.count()
    if (count > 1) {
      await allOptions.nth(1).click()
      await expect(allOptions.nth(1)).toBeChecked()
    } else {
      // Single option must be selected by default
      await expect(allOptions.first()).toBeChecked()
    }
  })

  test('back button returns to address step', async ({ page }) => {
    await page.getByTestId('shipping-back-button').click()
    await expect(page.getByTestId('address-step')).toBeVisible()
  })

  test('continue button advances to payment step', async ({ page }) => {
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })
    await page.getByTestId('shipping-continue-button').click()

    await expect(page.getByTestId('payment-step')).toBeVisible({ timeout: 20_000 })
  })
})

// ─── Payment Step ─────────────────────────────────────────────────────────────

test.describe('Payment Step', () => {
  test.beforeEach(async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')
    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()
    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })
    await page.getByTestId('shipping-continue-button').click()
    await expect(page.getByTestId('payment-step')).toBeVisible({ timeout: 20_000 })
  })

  test('renders INR payment method selector', async ({ page }) => {
    await expect(page.getByTestId('payment-method-upi')).toBeVisible()
    await expect(page.getByTestId('payment-method-card')).toBeVisible()
    await expect(page.getByTestId('payment-method-netbanking')).toBeVisible()
    await expect(page.getByTestId('payment-method-cod')).toBeVisible()
  })

  test('allows selecting a payment method', async ({ page }) => {
    await page.getByTestId('payment-radio-upi').click()
    await expect(page.getByTestId('payment-radio-upi')).toBeChecked()

    await page.getByTestId('payment-radio-cod').click()
    await expect(page.getByTestId('payment-radio-cod')).toBeChecked()
    await expect(page.getByTestId('payment-radio-upi')).not.toBeChecked()
  })

  test('back button returns to shipping step', async ({ page }) => {
    await page.getByTestId('payment-back-button').click()
    await expect(page.getByTestId('shipping-step')).toBeVisible()
  })

  test('place-order button shows total price', async ({ page }) => {
    const btnText = await page.getByTestId('place-order-button').textContent()
    expect(btnText).toMatch(/PLACE ORDER/)
    expect(btnText).toMatch(/Rs\./)
  })
})

// ─── Full Checkout Journey ────────────────────────────────────────────────────

test.describe('Full Checkout Journey', () => {
  // Requires CHECKOUT_TEST_MODE=true on the Next.js server.
  // In CI this is set automatically. For local runs, start the server with
  // CHECKOUT_TEST_MODE=true before running these tests.

  test('completes the full address → shipping → payment → confirmation flow', async ({
    page,
    request,
  }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    // Step 1: Address
    await page.goto('/checkout')
    await expect(page.getByTestId('address-step')).toBeVisible()
    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()

    // Step 2: Shipping
    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })
    await page.getByTestId('shipping-continue-button').click()

    // Step 3: Payment
    await expect(page.getByTestId('payment-step')).toBeVisible({ timeout: 20_000 })
    await page.getByTestId('place-order-button').click()

    // Step 4: Confirmation
    await expect(page.getByTestId('confirmation-step')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('confirmation-heading')).toHaveText('Order Placed.')
    const orderId = await page.getByTestId('confirmation-order-id').textContent()
    expect(orderId).toMatch(/^#TT-\d{4}-\d{5}$/)
    await expect(page.getByTestId('confirmation-order-summary')).toBeVisible()
    await expect(page.getByTestId('continue-shopping-link')).toBeVisible()
  })

  test('confirmation screen shows correct delivery address', async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')
    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()

    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })
    await page.getByTestId('shipping-continue-button').click()

    await expect(page.getByTestId('payment-step')).toBeVisible({ timeout: 20_000 })
    await page.getByTestId('place-order-button').click()

    await expect(page.getByTestId('confirmation-step')).toBeVisible({ timeout: 30_000 })
    // Address should appear somewhere in the confirmation
    const confirmationText = await page.getByTestId('confirmation-step').textContent()
    expect(confirmationText).toContain(TEST_ADDRESS.city)
  })

  test('continue-shopping link navigates to /products', async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')
    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()

    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })
    await page.getByTestId('shipping-continue-button').click()

    await expect(page.getByTestId('payment-step')).toBeVisible({ timeout: 20_000 })
    await page.getByTestId('place-order-button').click()

    await expect(page.getByTestId('confirmation-step')).toBeVisible({ timeout: 30_000 })

    const href = await page.getByTestId('continue-shopping-link').getAttribute('href')
    expect(href).toBe('/products')
  })
})

// ─── Order Summary Sidebar ────────────────────────────────────────────────────

test.describe('Order Summary Sidebar', () => {
  test('shows cart items and total in the sidebar', async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')

    await expect(page.getByTestId('order-summary')).toBeVisible()
    await expect(page.getByTestId('order-summary-sidebar')).toBeVisible()
  })

  test('shipping cost updates in sidebar after selecting a method', async ({ page, request }) => {
    const { cartId } = await createCheckoutCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/checkout')
    const summaryText = await page.getByTestId('order-summary').textContent()
    expect(summaryText).toContain('Calculated next')

    await fillAddressForm(page)
    await page.getByTestId('address-continue-button').click()
    await expect(page.getByTestId('shipping-step')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-testid^="shipping-option-"]').first()).toBeVisible({
      timeout: 15_000,
    })
    await page.getByTestId('shipping-continue-button').click()
    await expect(page.getByTestId('payment-step')).toBeVisible({ timeout: 20_000 })

    // After shipping selected, "Calculated next" should be gone
    const updatedSummaryText = await page.getByTestId('order-summary').textContent()
    expect(updatedSummaryText).not.toContain('Calculated next')
  })
})
