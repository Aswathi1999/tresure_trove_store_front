export interface MockAddress {
  email: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface MockShippingOption {
  id: string
  name: string
  carrier: string
  estimatedDelivery: string
  price: number
}

export interface MockOrderItem {
  id: string
  title: string
  variant: string
  quantity: number
  unitPrice: number
  imageUrl: string
  imageAlt: string
}

export interface MockOrder {
  id: string
  items: MockOrderItem[]
  address: MockAddress
  shippingOption: MockShippingOption
  subtotal: number
  shipping: number
  discount?: number
  total: number
  currency: 'INR' | 'USD' | 'AED'
}

export const MOCK_CART_ITEMS: MockOrderItem[] = [
  {
    id: 'item_1',
    title: 'Artisan Sculpted Vase',
    variant: 'Ivory',
    quantity: 1,
    unitPrice: 845000,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAv9nI_coGkH7JL802f_oj4SDmUl_8fuvDX89gW_ihzNJkyrlqavsChuxZvLPk1fww-XXK6firURdUqyYYgAZiHR1y0xKvGAjIWnE0BbCuDDsdMly7IDc8eofU72riXVQ6aXDz8TmfhYL2mFirieCeYO3jspYm5waOzhlbzq9CNGUL-wZHNCAX05F5LT_q0cJKjvFcCShaG2L3fE2cr_g7mpOd-KJ-f1jrvgff3lE5R703YsWEUcqejdO-IhpWVwUek9WPcwVC2ktIe',
    imageAlt: 'Minimalist handcrafted ceramic vase with matte ivory finish',
  },
  {
    id: 'item_2',
    title: 'Royal Velvet Cushion Set',
    variant: 'Mauve',
    quantity: 2,
    unitPrice: 586200,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUi6MkJ-T3R5GLfSARBqAYltAr0hPA_fn9OoxKSNNX53thOHGaESL9lQ7sBJZDhETmxy-eQTB_zBhKSmEjunQsNJ6K3_3qfZ_dTF42oPkxZQQZGsO58VvCVYFkFWlKQLhBwuDOiFIxmMxiWrCb332BI07usFcVY6ntQG0_S98OAbakDlkKZgHxeZa45AonnULudyvZPW0D0cqkSmlZkco3xXxuIPieL43z7Zej0TEEbh1BrYpCXHULBvLr7-Gsr-Jp3wsGno44lMIr',
    imageAlt: 'Luxurious deep mauve velvet throw pillow with gold embroidery',
  },
]

export const MOCK_SHIPPING_OPTIONS: MockShippingOption[] = [
  {
    id: 'ship_standard',
    name: 'Standard Delivery',
    carrier: 'DTDC / Blue Dart',
    estimatedDelivery: '5–7 business days',
    price: 0,
  },
  {
    id: 'ship_express',
    name: 'Express Delivery',
    carrier: 'FedEx Priority',
    estimatedDelivery: '2–3 business days',
    price: 59900,
  },
  {
    id: 'ship_white_glove',
    name: 'White Glove Delivery',
    carrier: 'Treasure Trove Logistics',
    estimatedDelivery: '7–10 business days',
    price: 149900,
  },
]

export async function mockGetShippingOptions(): Promise<MockShippingOption[]> {
  await new Promise((r) => setTimeout(r, 400))
  return MOCK_SHIPPING_OPTIONS
}

export async function mockInitiatePayment(
  currency: 'INR' | 'USD' | 'AED',
  amount: number,
  simulateFailure = false,
): Promise<{ paymentId: string }> {
  await new Promise((r) => setTimeout(r, 600))
  if (simulateFailure) throw new Error('Payment declined. Please try a different method.')
  return { paymentId: `pay_mock_${currency}_${amount}_${Date.now()}` }
}

export async function mockPlaceOrder(data: {
  address: MockAddress
  shippingOptionId: string
  paymentId: string
}): Promise<MockOrder> {
  await new Promise((r) => setTimeout(r, 700))
  const shippingOption =
    MOCK_SHIPPING_OPTIONS.find((o) => o.id === data.shippingOptionId) ?? MOCK_SHIPPING_OPTIONS[0]
  const subtotal = MOCK_CART_ITEMS.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  return {
    id: `TT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    items: MOCK_CART_ITEMS,
    address: data.address,
    shippingOption,
    subtotal,
    shipping: shippingOption.price,
    total: subtotal + shippingOption.price,
    currency: 'INR',
  }
}
