import { expect, test } from '@playwright/test'
import { createTestCart, setCartCookie, openCartDrawer } from './helpers'

test.describe('Cart Drawer', () => {
  test('opens and closes via the cart trigger button', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('cart-trigger').click()

    await expect(page.getByTestId('cart-drawer')).toBeVisible()
    await expect(page.getByTestId('cart-backdrop')).toBeVisible()

    await page.getByTestId('close-cart-button').click()
    await expect(page.getByTestId('cart-drawer')).not.toBeVisible()
  })

  test('closes when Escape key is pressed', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('cart-trigger').click()
    await expect(page.getByTestId('cart-drawer')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('cart-drawer')).not.toBeVisible()
  })

  test('closes when backdrop is clicked', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('cart-trigger').click()
    await expect(page.getByTestId('cart-drawer')).toBeVisible()

    await page.getByTestId('cart-backdrop').click()
    await expect(page.getByTestId('cart-drawer')).not.toBeVisible()
  })

  test('shows empty state when no cart cookie is set', async ({ page }) => {
    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('empty-cart')).toBeVisible()
    await expect(page.getByTestId('continue-shopping-link')).toBeVisible()
  })
})

test.describe('Cart Items', () => {
  test('loads and displays items from an existing Medusa cart', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('cart-item-count')).toBeVisible()
  })

  test('displays correct item count in header badge', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    const countBadge = page.getByTestId('cart-item-count')
    await expect(countBadge).toBeVisible({ timeout: 15_000 })
    const countText = await countBadge.textContent()
    expect(countText).toMatch(/\(\d+\)/)
  })

  test('shows the cart trigger badge count when items are in the cart', async ({
    page,
    request,
  }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')

    // Wait for initCart to load items (the badge should appear)
    await expect(page.getByTestId('cart-trigger-count')).toBeVisible({ timeout: 15_000 })
  })

  test('shows subtotal and total in cart summary', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('cart-subtotal')).toBeVisible()
    await expect(page.getByTestId('cart-total')).toBeVisible()

    const subtotalText = await page.getByTestId('cart-subtotal').textContent()
    expect(subtotalText).toMatch(/Rs\./)
  })
})

test.describe('Cart Quantity Updates', () => {
  test('increments item quantity and updates totals', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })

    const subtotalBefore = await page.getByTestId('cart-subtotal').textContent()
    await page.getByTestId('quantity-increment').first().click()

    // Wait for the loading spinner to disappear (async update)
    await expect(page.getByTestId('cart-loading-spinner')).not.toBeVisible({ timeout: 15_000 })

    const subtotalAfter = await page.getByTestId('cart-subtotal').textContent()
    expect(subtotalAfter).not.toEqual(subtotalBefore)
  })

  test('decrements item quantity when quantity is above 1', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })

    const subtotalBefore = await page.getByTestId('cart-subtotal').textContent()

    // The test cart is created with quantity=2, so decrement should work
    await page.getByTestId('quantity-decrement').first().click()
    await expect(page.getByTestId('cart-loading-spinner')).not.toBeVisible({ timeout: 15_000 })

    const subtotalAfter = await page.getByTestId('cart-subtotal').textContent()
    expect(subtotalAfter).not.toEqual(subtotalBefore)
  })

  test('decrement button is disabled when quantity is 1', async ({ page, request }) => {
    const { cartId, variantId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    // Force quantity to 1 by incrementing once then decrementing
    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })

    // Reduce to 1 if currently at 2 (test cart has qty=2)
    const decrementBtn = page.getByTestId('quantity-decrement').first()
    await decrementBtn.click()
    await expect(page.getByTestId('cart-loading-spinner')).not.toBeVisible({ timeout: 15_000 })

    // At quantity=1, decrement should be disabled
    await expect(decrementBtn).toBeDisabled()

    // Suppress unused variable warning
    void variantId
  })
})

test.describe('Cart Remove Item', () => {
  test('removes an item from the cart and shows empty state when last item removed', async ({
    page,
    request,
  }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })

    await page.getByTestId('remove-item-button').first().click()
    await expect(page.getByTestId('cart-loading-spinner')).not.toBeVisible({ timeout: 15_000 })

    await expect(page.getByTestId('empty-cart')).toBeVisible({ timeout: 10_000 })
  })

  test('removes item from cart and item count updates in header', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('cart-item-count')).toBeVisible()

    await page.getByTestId('remove-item-button').first().click()
    await expect(page.getByTestId('cart-loading-spinner')).not.toBeVisible({ timeout: 15_000 })

    // After removing the only item, the count badge should disappear
    await expect(page.getByTestId('cart-item-count')).not.toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Cart Checkout', () => {
  test('checkout CTA links to /checkout', async ({ page, request }) => {
    const { cartId } = await createTestCart(request)
    await setCartCookie(page, cartId)

    await page.goto('/')
    await openCartDrawer(page)

    await expect(page.getByTestId('cart-item').first()).toBeVisible({ timeout: 15_000 })

    const checkoutHref = await page.getByTestId('checkout-cta').getAttribute('href')
    expect(checkoutHref).toBe('/checkout')
  })
})
