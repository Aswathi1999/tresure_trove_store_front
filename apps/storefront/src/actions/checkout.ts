'use server'

import { cookies } from 'next/headers'
import {
  getCart,
  updateCartAddress,
  listCartShippingOptions,
  addCartShippingMethod,
  initiateCartPaymentSession,
  completeCart,
  createCart,
  getDefaultRegion,
  associateCartWithCustomer,
  removeCartItem,
  addCartItem,
  applyCartPromotions,
  removeCartPromotions,
  getCartPromotions,
  authorizeRazorpaySession,
} from '@/lib/medusa'
import { getAuthenticatedCustomerId } from '@/lib/account'
import type { MockAddress, MockShippingOption, MockOrder } from '@/lib/checkout.mock'
import { calcGst, type CartLineItem } from '@/lib/cart-types'

const CART_COOKIE = 'tt_cart_id'
const CART_COOKIE_OPTIONS = {
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax' as const,
  path: '/',
}

async function getAuthHeaders(): Promise<{ authorization: string } | null> {
  const store = await cookies()
  const token = store.get('tt_session')?.value
  if (!token) return null
  return { authorization: `Bearer ${token}` }
}

// Mirror the auth-aware cookie scheme used by actions/cart.ts so checkout
// operates on the SAME cart the storefront cart store uses. Logged-in users
// get a per-customer cart; otherwise the shared guest cart. Without this,
// checkout used a different cart than the one the promo was applied to, so the
// discount never reached the placed order.
async function getCartCookieName(): Promise<string> {
  const customerId = await getAuthenticatedCustomerId()
  return customerId ? `tt_cart_${customerId}` : CART_COOKIE
}

async function getOrCreateCheckoutCart(): Promise<string> {
  const cookieStore = await cookies()
  const cookieName = await getCartCookieName()
  const cartId = cookieStore.get(cookieName)?.value

  if (cartId) {
    try {
      await getCart(cartId)
      return cartId
    } catch {
      cookieStore.delete(cookieName)
    }
  }

  const region = await getDefaultRegion()
  const authHeaders = await getAuthHeaders()
  const cart = await createCart(region.id, authHeaders ?? undefined)
  cookieStore.set(cookieName, cart.id, CART_COOKIE_OPTIONS)
  return cart.id
}

// Map a storefront MockAddress to the Medusa cart address shape (splitting the
// single full-name field into first/last).
function toMedusaAddress(a: MockAddress) {
  const nameParts = a.fullName.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  // Single-word names have no surname — leave last_name empty rather than
  // duplicating the first name (which rendered back as e.g. "Anu Anu").
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
  return {
    first_name: firstName,
    last_name: lastName,
    address_1: a.addressLine1,
    address_2: a.addressLine2,
    city: a.city,
    country_code: a.country.toLowerCase(),
    province: a.state,
    postal_code: a.pincode,
    phone: a.phone,
  }
}

export async function setShippingAddressAction(
  address: MockAddress,
  billingAddress?: MockAddress,
): Promise<void> {
  const cartId = await getOrCreateCheckoutCart()
  await updateCartAddress(
    cartId,
    address.email,
    toMedusaAddress(address),
    billingAddress ? toMedusaAddress(billingAddress) : undefined,
  )
}

export async function getShippingOptionsAction(): Promise<MockShippingOption[]> {
  const cartId = await getOrCreateCheckoutCart()
  const options = await listCartShippingOptions(cartId)

  return options.map((opt) => ({
    id: opt.id,
    name: opt.name,
    carrier: opt.provider?.id ?? 'Standard Carrier',
    estimatedDelivery: '3–7 business days',
    price: opt.amount ?? 0,
  }))
}

export async function addShippingMethodAction(optionId: string): Promise<void> {
  const cartId = await getOrCreateCheckoutCart()
  await addCartShippingMethod(cartId, optionId)
}

const RAZORPAY_PROVIDER_ID = 'pp_razorpay_razorpay'

export interface RazorpaySessionInfo {
  razorpayOrderId: string
  /** Amount in the smallest currency unit (paise), matching the Razorpay order. */
  amount: number
  currency: string
  cartId: string
  /** Items removed from the cart so the Razorpay order matches the SELECTED
   *  subtotal. Restore these (see restoreCartItemsAction) if the customer
   *  cancels or the payment fails, so they aren't lost from the cart. */
  removedItems: { variantId: string; quantity: number }[]
}

// Initiate a Razorpay payment session on the cart and return the order details
// the client needs to open the checkout modal. Called before the modal opens.
//
// The Razorpay order amount is the cart total, but the customer may have
// deselected some cart items. Remove the unselected items first (capturing them
// for restore) so the amount charged matches exactly what they're buying.
export async function initiateRazorpaySession(
  cartId: string,
  unselectedLineItemIds?: string[],
): Promise<RazorpaySessionInfo> {
  const removedItems: { variantId: string; quantity: number }[] = []
  if (unselectedLineItemIds && unselectedLineItemIds.length > 0) {
    const preCart = await getCart(cartId)
    for (const li of preCart.items ?? []) {
      if (unselectedLineItemIds.includes(li.id) && li.variant_id) {
        removedItems.push({ variantId: li.variant_id, quantity: li.quantity })
      }
    }
    for (const lineItemId of unselectedLineItemIds) {
      await removeCartItem(cartId, lineItemId)
    }
  }

  const cart = await getCart(cartId)
  const collection = await initiateCartPaymentSession(cart, RAZORPAY_PROVIDER_ID)
  const session = (collection.payment_sessions ?? []).find(
    (s) => s.provider_id === RAZORPAY_PROVIDER_ID,
  )
  if (!session) {
    throw new Error('Could not start the Razorpay payment. Please try again.')
  }
  // The provider stores the created Razorpay order on the session data.
  const data = (session.data ?? {}) as Record<string, unknown>
  const razorpayOrderId = typeof data['id'] === 'string' ? data['id'] : ''
  const amount =
    typeof data['amount'] === 'number' ? data['amount'] : Number(data['amount'] ?? session.amount)
  const currency = typeof data['currency'] === 'string' ? data['currency'] : session.currency_code
  if (!razorpayOrderId) {
    throw new Error('Razorpay order was not created. Please try again.')
  }
  return { razorpayOrderId, amount, currency: currency.toUpperCase(), cartId, removedItems }
}

// Re-add items that initiateRazorpaySession removed from the cart, used when a
// Razorpay payment is cancelled or fails so the customer keeps their cart.
export async function restoreCartItemsAction(
  cartId: string,
  items: { variantId: string; quantity: number }[],
): Promise<void> {
  for (const item of items) {
    await addCartItem(cartId, item.variantId, item.quantity).catch(() => {})
  }
}

// Authorize a completed Razorpay payment. The backend provider verifies the HMAC
// signature server-side; this throws if verification fails.
export async function authorizeRazorpayPayment(
  cartId: string,
  paymentId: string,
  orderId: string,
  signature: string,
): Promise<void> {
  await authorizeRazorpaySession(cartId, {
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
    razorpay_signature: signature,
  })
}

export interface PromoActionResult {
  ok: boolean
  error?: string
  // Tax-inclusive discount (kept for callers that need the gross saving).
  discountTotal: number
  // Pre-tax discount — the promo's face value. The storefront displays this and
  // charges GST on the discounted base, so the breakdown matches the real order.
  discountSubtotal: number
  // Pre-tax portion of the discount applied to shipping (free-shipping promos).
  shippingDiscount: number
  appliedCodes: string[]
}

const EMPTY_PROMO = {
  discountTotal: 0,
  discountSubtotal: 0,
  shippingDiscount: 0,
  appliedCodes: [] as string[],
}

export async function applyPromotionAction(
  cartId: string,
  code: string,
): Promise<PromoActionResult> {
  const trimmed = code.trim()
  if (!cartId) {
    return { ok: false, error: 'Your cart is empty.', ...EMPTY_PROMO }
  }
  if (!trimmed) {
    return { ok: false, error: 'Enter a promo code.', ...EMPTY_PROMO }
  }
  try {
    const result = await applyCartPromotions(cartId, [trimmed])
    // Medusa silently ignores codes that aren't applicable, so confirm the
    // entered code actually landed on the cart before reporting success.
    const matched = result.codes.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    if (!matched) {
      return {
        ok: false,
        error: `"${trimmed}" is not valid for this order.`,
        discountTotal: result.discountTotal,
        discountSubtotal: result.discountSubtotal,
        shippingDiscount: result.shippingDiscount,
        appliedCodes: result.codes,
      }
    }
    return {
      ok: true,
      discountTotal: result.discountTotal,
      discountSubtotal: result.discountSubtotal,
      shippingDiscount: result.shippingDiscount,
      appliedCodes: result.codes,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not apply the promo code.',
      ...EMPTY_PROMO,
    }
  }
}

export async function removePromotionAction(
  cartId: string,
  code: string,
): Promise<PromoActionResult> {
  if (!cartId) {
    return { ok: false, error: 'Your cart is empty.', ...EMPTY_PROMO }
  }
  try {
    const result = await removeCartPromotions(cartId, [code])
    return {
      ok: true,
      discountTotal: result.discountTotal,
      discountSubtotal: result.discountSubtotal,
      shippingDiscount: result.shippingDiscount,
      appliedCodes: result.codes,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not remove the promo code.',
      ...EMPTY_PROMO,
    }
  }
}

export async function getAppliedPromotionsAction(cartId: string): Promise<PromoActionResult> {
  if (!cartId) return { ok: true, ...EMPTY_PROMO }
  try {
    const result = await getCartPromotions(cartId)
    return {
      ok: true,
      discountTotal: result.discountTotal,
      discountSubtotal: result.discountSubtotal,
      shippingDiscount: result.shippingDiscount,
      appliedCodes: result.codes,
    }
  } catch {
    return { ok: false, ...EMPTY_PROMO }
  }
}

// Returns the PRE-TAX discount split into its item and shipping portions, so the
// placed order's GST-exclusive breakdown (goods − itemDiscount, GST on the
// remainder, shipping − shippingDiscount) matches the cart total Medusa charges.
async function getCartDiscount(
  cartId: string,
): Promise<{ itemDiscount: number; shippingDiscount: number }> {
  try {
    const { discountSubtotal, shippingDiscount } = await getCartPromotions(cartId)
    return { itemDiscount: Math.max(0, discountSubtotal - shippingDiscount), shippingDiscount }
  } catch {
    return { itemDiscount: 0, shippingDiscount: 0 }
  }
}

// After an order completes, the cart is consumed. If the customer left some
// items unselected, rebuild a fresh cart containing them (and point the cart
// cookie at it) so they're kept for next time; otherwise clear the cookie.
async function finalizeCartAfterOrder(
  keepItems?: { variantId: string; quantity: number }[],
): Promise<void> {
  const cookieStore = await cookies()
  const cookieName = await getCartCookieName()
  if (keepItems && keepItems.length > 0) {
    try {
      const region = await getDefaultRegion()
      const authHeaders = await getAuthHeaders()
      const newCart = await createCart(region.id, authHeaders ?? undefined)
      for (const item of keepItems) {
        await addCartItem(newCart.id, item.variantId, item.quantity).catch(() => {})
      }
      cookieStore.set(cookieName, newCart.id, CART_COOKIE_OPTIONS)
      return
    } catch {
      // If rebuilding the cart fails, fall through and just clear it.
    }
  }
  cookieStore.delete(cookieName)
}

export async function completeOrderAction(
  address: MockAddress,
  shippingOption: MockShippingOption,
  cartItems: CartLineItem[],
  currency: 'INR' | 'USD' | 'AED',
  paymentMethod?: string,
  unselectedLineItemIds?: string[],
  razorpay?: { paymentId: string; orderId: string; signature: string },
  keepItems?: { variantId: string; quantity: number }[],
): Promise<MockOrder> {
  if (paymentMethod !== 'cod') {
    // INR online payments (UPI / Card / Net Banking) go through Razorpay. The
    // session was initiated and the modal completed on the client; here we
    // authorize the verified payment, then complete the cart into a real order.
    if (currency === 'INR' && razorpay) {
      const cartId = await getOrCreateCheckoutCart()

      const authHeaders = await getAuthHeaders()
      if (authHeaders) {
        await associateCartWithCustomer(cartId, authHeaders).catch(() => {})
      }

      // Verify + authorize the Razorpay payment (HMAC checked backend-side).
      // Throws if the signature is invalid.
      await authorizeRazorpayPayment(
        cartId,
        razorpay.paymentId,
        razorpay.orderId,
        razorpay.signature,
      )

      // Capture the promo discount before completion consumes the cart.
      const { itemDiscount, shippingDiscount } = await getCartDiscount(cartId)

      const result = await completeCart(cartId)
      if (result.type !== 'order') {
        throw new Error('Payment could not be confirmed. Please try again.')
      }

      // Completion consumes the cart; rebuild it with any unselected items so
      // they stay in the customer's cart for a future purchase.
      await finalizeCartAfterOrder(keepItems)

      const { order } = result
      const year = new Date().getFullYear()
      const orderId = `TT-${year}-${String(order.display_id ?? 0).padStart(5, '0')}`
      const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      const net = Math.max(0, subtotal - itemDiscount)
      const shipping = Math.max(0, shippingOption.price - shippingDiscount)
      return {
        id: orderId,
        items: cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          variant: item.variant,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          imageUrl: item.imageUrl,
          imageAlt: item.imageAlt,
        })),
        address,
        shippingOption,
        subtotal,
        shipping,
        discount: itemDiscount,
        total: net + calcGst(net + shipping) + shipping,
        currency,
      }
    }

    // Non-INR (Stripe) is still mocked here so the success page renders during
    // UI development — Stripe frontend integration is a separate task.
    const cartId = await getOrCreateCheckoutCart()
    const { itemDiscount, shippingDiscount } = await getCartDiscount(cartId)
    const year = new Date().getFullYear()
    const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const net = Math.max(0, subtotal - itemDiscount)
    const shipping = Math.max(0, shippingOption.price - shippingDiscount)
    return {
      id: `TT-${year}-${String(Math.floor(10000 + Math.random() * 90000))}`,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
      })),
      address,
      shippingOption,
      subtotal,
      shipping,
      discount: itemDiscount,
      total: net + calcGst(net + shipping) + shipping,
      currency,
    }
  }

  const authHeaders = await getAuthHeaders()

  const cartId = await getOrCreateCheckoutCart()

  // Link the cart to the logged-in customer BEFORE completion so the resulting
  // order is saved to their account (My Orders). For guests this is skipped.
  if (authHeaders) {
    await associateCartWithCustomer(cartId, authHeaders).catch(() => {})
  }

  // The user may have deselected some items in the cart before checkout.
  // Capture those items (variant + quantity) BEFORE removing them so they can
  // be restored to a fresh cart after this order completes — otherwise the
  // unchecked items would be lost when completeCart consumes the cart. Then
  // remove them so the placed order matches the order summary.
  const itemsToKeep: Array<{ variantId: string; quantity: number }> = []
  if (unselectedLineItemIds && unselectedLineItemIds.length > 0) {
    const preCart = await getCart(cartId)
    for (const li of preCart.items ?? []) {
      if (unselectedLineItemIds.includes(li.id) && li.variant_id) {
        itemsToKeep.push({ variantId: li.variant_id, quantity: li.quantity })
      }
    }
    for (const lineItemId of unselectedLineItemIds) {
      await removeCartItem(cartId, lineItemId)
    }
  }

  const cart = await getCart(cartId)

  // Capture any promo discount on the cart (after unselected items were
  // removed) before completion so the placed order reflects it.
  const { itemDiscount, shippingDiscount } = await getCartDiscount(cartId)

  // COD path — uses Medusa's built-in system provider, which auto-authorizes
  // the payment session without an external API call.
  await initiateCartPaymentSession(cart, 'pp_system_default')

  const result = await completeCart(cartId)
  if (result.type !== 'order') {
    throw new Error(
      'Payment was not authorized. Please try again or use a different payment method.',
    )
  }

  // Completion consumes the cart; rebuild it with the unselected items (captured
  // above) so they stay in the customer's cart for a future purchase.
  await finalizeCartAfterOrder(itemsToKeep)

  const { order } = result
  const year = new Date().getFullYear()
  const orderId = `TT-${year}-${String(order.display_id ?? 0).padStart(5, '0')}`
  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const net = Math.max(0, subtotal - itemDiscount)
  const shipping = Math.max(0, shippingOption.price - shippingDiscount)

  return {
    id: orderId,
    items: cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      variant: item.variant,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
    })),
    address,
    shippingOption,
    subtotal,
    shipping,
    discount: itemDiscount,
    total: net + calcGst(net + shipping) + shipping,
    currency,
  }
}
