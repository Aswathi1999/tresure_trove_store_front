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

export interface TestCart {
  cartId: string
  variantId: string
  lineItemId: string
  unitPrice: number
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

export async function getFirstVariant(
  request: APIRequestContext,
): Promise<{ variantId: string; unitPrice: number }> {
  const res = await request.get(`${MEDUSA_URL}/store/products?limit=1&fields=*variants`, {
    headers: medusaHeaders(),
  })
  const body = (await res.json()) as {
    products: Array<{
      variants: Array<{ id: string; calculated_price?: { calculated_amount: number } }>
    }>
  }
  const product = body.products[0]
  if (!product?.variants?.length) {
    throw new Error('No products/variants found in Medusa — seed your backend first')
  }
  const variant = product.variants[0]!
  return {
    variantId: variant.id,
    unitPrice: variant.calculated_price?.calculated_amount ?? 0,
  }
}

export async function createTestCart(request: APIRequestContext): Promise<TestCart> {
  const regionId = await getDefaultRegionId(request)
  const { variantId, unitPrice } = await getFirstVariant(request)

  const cartRes = await request.post(`${MEDUSA_URL}/store/carts`, {
    headers: medusaHeaders(),
    data: { region_id: regionId },
  })
  const cartBody = (await cartRes.json()) as { cart: { id: string } }
  const cartId = cartBody.cart.id

  const lineRes = await request.post(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
    headers: medusaHeaders(),
    data: { variant_id: variantId, quantity: 2 },
  })
  const lineBody = (await lineRes.json()) as {
    cart: { items: Array<{ id: string }> }
  }
  const lineItemId = lineBody.cart.items[0]?.id ?? ''

  return { cartId, variantId, lineItemId, unitPrice }
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

export async function openCartDrawer(page: Page): Promise<void> {
  await page.getByTestId('cart-trigger').click()
  await page.getByTestId('cart-drawer').waitFor({ state: 'visible' })
}
