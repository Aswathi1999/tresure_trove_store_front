'use server'

import { cookies } from 'next/headers'
import type { HttpTypes } from '@medusajs/types'
import {
  createCart,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  getDefaultRegion,
} from '@/lib/medusa'
import { getAuthenticatedCustomerId } from '@/lib/account'

const CART_COOKIE = 'tt_cart_id'
const CART_COOKIE_OPTIONS = {
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  sameSite: 'lax' as const,
  path: '/',
}

function getCartCookieName(customerId: string | null): string {
  if (customerId) return `tt_cart_${customerId}`
  return CART_COOKIE
}

// The logged-in customer's auth header, used so a new cart is created already
// associated with their account (cart.customer_id), keeping the eventual order
// on the registered customer instead of a guest duplicate. Undefined for guests.
async function getAuthHeaders(): Promise<{ authorization: string } | undefined> {
  const store = await cookies()
  const token = store.get('tt_session')?.value
  return token ? { authorization: `Bearer ${token}` } : undefined
}

export async function getCartAction(): Promise<HttpTypes.StoreCart | null> {
  const cookieStore = await cookies()
  const customerId = await getAuthenticatedCustomerId()
  const cartCookieName = getCartCookieName(customerId)
  const cartId = cookieStore.get(cartCookieName)?.value
  if (!cartId) return null
  try {
    return await getCart(cartId)
  } catch {
    cookieStore.delete(cartCookieName)
    return null
  }
}

export async function getOrCreateCartAction(): Promise<HttpTypes.StoreCart> {
  const cookieStore = await cookies()
  const customerId = await getAuthenticatedCustomerId()
  const cartCookieName = getCartCookieName(customerId)
  const cartId = cookieStore.get(cartCookieName)?.value

  if (cartId) {
    try {
      return await getCart(cartId)
    } catch {
      cookieStore.delete(cartCookieName)
    }
  }

  const region = await getDefaultRegion()
  const authHeaders = await getAuthHeaders()
  const cart = await createCart(region.id, authHeaders)
  cookieStore.set(cartCookieName, cart.id, CART_COOKIE_OPTIONS)
  return cart
}

export async function addItemAction(
  variantId: string,
  quantity: number,
): Promise<HttpTypes.StoreCart> {
  const cart = await getOrCreateCartAction()
  return addCartItem(cart.id, variantId, quantity)
}

export async function updateItemAction(
  lineItemId: string,
  quantity: number,
): Promise<HttpTypes.StoreCart> {
  const cart = await getOrCreateCartAction()
  return updateCartItem(cart.id, lineItemId, quantity)
}

export async function removeItemAction(lineItemId: string): Promise<HttpTypes.StoreCart> {
  const cart = await getOrCreateCartAction()
  return removeCartItem(cart.id, lineItemId)
}
