import type { APIRequestContext, Page } from '@playwright/test'

const MEDUSA_URL = process.env['NEXT_PUBLIC_MEDUSA_BACKEND_URL'] ?? 'http://localhost:9000'
const PUB_KEY = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? ''
const CART_COOKIE = 'tt_cart_id'

function medusaHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUB_KEY,
  }
}

export interface CheckoutTestCart {
  cartId: string
  variantId: string
}

export async function getDefaultRegionId(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${MEDUSA_URL}/store/regions`, {
    headers: medusaHeaders(),
  })
  const body = (await res.json()) as { regions: Array<{ id: string }> }
  const region = body.regions[0]
  if (!region) throw new Error('No regions found in Medusa — seed your backend first')
  return region.id
}

async function getFirstVariantId(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${MEDUSA_URL}/store/products?limit=1&fields=*variants`, {
    headers: medusaHeaders(),
  })
  const body = (await res.json()) as {
    products: Array<{ variants: Array<{ id: string }> }>
  }
  const variant = body.products[0]?.variants[0]
  if (!variant) throw new Error('No product variants in Medusa — seed your backend first')
  return variant.id
}

export async function createCheckoutCart(request: APIRequestContext): Promise<CheckoutTestCart> {
  const regionId = await getDefaultRegionId(request)
  const variantId = await getFirstVariantId(request)

  const cartRes = await request.post(`${MEDUSA_URL}/store/carts`, {
    headers: medusaHeaders(),
    data: { region_id: regionId },
  })
  const cartBody = (await cartRes.json()) as { cart: { id: string } }
  const cartId = cartBody.cart.id

  await request.post(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
    headers: medusaHeaders(),
    data: { variant_id: variantId, quantity: 1 },
  })

  return { cartId, variantId }
}

export async function setCartCookie(page: Page, cartId: string): Promise<void> {
  await page.context().addCookies([
    {
      name: CART_COOKIE,
      value: cartId,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
  ])
}

export const TEST_ADDRESS = {
  email: 'test@treasuretrove.com',
  fullName: 'Arjun Mehra',
  phone: '+919876543210',
  addressLine1: '42 MG Road, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  country: 'IN',
} as const

export async function fillAddressForm(page: Page): Promise<void> {
  await page.getByTestId('input-email').fill(TEST_ADDRESS.email)
  await page.getByTestId('input-full-name').fill(TEST_ADDRESS.fullName)
  await page.getByTestId('input-phone').fill(TEST_ADDRESS.phone)
  await page.getByTestId('input-address-line-1').fill(TEST_ADDRESS.addressLine1)
  await page.getByTestId('input-city').fill(TEST_ADDRESS.city)
  await page.getByTestId('input-state').fill(TEST_ADDRESS.state)
  await page.getByTestId('input-pincode').fill(TEST_ADDRESS.pincode)
  await page.getByTestId('input-country').selectOption(TEST_ADDRESS.country)
}
