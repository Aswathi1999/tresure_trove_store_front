export interface MockOrderItem {
  id: string
  name: string
  variant: string
  quantity: number
  unitPrice: number
  imageUrl: string
}

export interface MockTimelineEvent {
  label: string
  date: string
  completed: boolean
}

export interface MockOrder {
  id: string
  number: string
  date: string
  total: number
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  items: MockOrderItem[]
  shippingAddress: MockSavedAddress
  timeline: MockTimelineEvent[]
}

export interface MockSavedAddress {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pin: string
  country: string
  isDefault: boolean
}

export interface MockWishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl: string
  handle: string
}

export interface MockProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export const MOCK_PROFILE: MockProfile = {
  firstName: 'Arjun',
  lastName: 'Mehra',
  email: 'arjun.mehra@example.com',
  phone: '+91 98765 43210',
}

export const MOCK_ADDRESSES: MockSavedAddress[] = [
  {
    id: 'addr_01',
    label: 'Home',
    fullName: 'Arjun Mehra',
    phone: '+91 98765 43210',
    line1: '12, Indiranagar 1st Cross',
    line2: 'Near CMH Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560038',
    country: 'India',
    isDefault: true,
  },
  {
    id: 'addr_02',
    label: 'Office',
    fullName: 'Arjun Mehra',
    phone: '+91 98765 43210',
    line1: '3rd Floor, Brigade Gateway',
    line2: 'Malleswaram',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560055',
    country: 'India',
    isDefault: false,
  },
]

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'order_01',
    number: 'TT-2026-0041',
    date: '15 Apr 2026',
    total: 2480000,
    status: 'Delivered',
    shippingAddress: MOCK_ADDRESSES[0],
    items: [
      {
        id: 'item_01',
        name: 'Ōkura Lounge Chair',
        variant: 'Natural Teak',
        quantity: 1,
        unitPrice: 1980000,
        imageUrl: '',
      },
      {
        id: 'item_02',
        name: 'Brass Floor Lamp',
        variant: 'Antique Brass',
        quantity: 1,
        unitPrice: 500000,
        imageUrl: '',
      },
    ],
    timeline: [
      { label: 'Order Placed', date: '15 Apr 2026', completed: true },
      { label: 'Payment Confirmed', date: '15 Apr 2026', completed: true },
      { label: 'Processing', date: '16 Apr 2026', completed: true },
      { label: 'Shipped', date: '17 Apr 2026', completed: true },
      { label: 'Delivered', date: '20 Apr 2026', completed: true },
    ],
  },
  {
    id: 'order_02',
    number: 'TT-2026-0038',
    date: '08 Apr 2026',
    total: 890000,
    status: 'Shipped',
    shippingAddress: MOCK_ADDRESSES[0],
    items: [
      {
        id: 'item_03',
        name: 'Linen Table Runner',
        variant: 'Ivory / 180cm',
        quantity: 2,
        unitPrice: 445000,
        imageUrl: '',
      },
    ],
    timeline: [
      { label: 'Order Placed', date: '08 Apr 2026', completed: true },
      { label: 'Payment Confirmed', date: '08 Apr 2026', completed: true },
      { label: 'Processing', date: '09 Apr 2026', completed: true },
      { label: 'Shipped', date: '10 Apr 2026', completed: true },
      { label: 'Delivered', date: '', completed: false },
    ],
  },
  {
    id: 'order_03',
    number: 'TT-2026-0029',
    date: '01 Mar 2026',
    total: 3150000,
    status: 'Processing',
    shippingAddress: MOCK_ADDRESSES[1],
    items: [
      {
        id: 'item_04',
        name: 'Handwoven Jute Basket Set',
        variant: 'Natural / Set of 3',
        quantity: 1,
        unitPrice: 350000,
        imageUrl: '',
      },
      {
        id: 'item_05',
        name: 'Mango Wood Side Table',
        variant: 'Dark Walnut',
        quantity: 1,
        unitPrice: 2800000,
        imageUrl: '',
      },
    ],
    timeline: [
      { label: 'Order Placed', date: '01 Mar 2026', completed: true },
      { label: 'Payment Confirmed', date: '01 Mar 2026', completed: true },
      { label: 'Processing', date: '', completed: false },
      { label: 'Shipped', date: '', completed: false },
      { label: 'Delivered', date: '', completed: false },
    ],
  },
  {
    id: 'order_04',
    number: 'TT-2026-0014',
    date: '12 Jan 2026',
    total: 560000,
    status: 'Cancelled',
    shippingAddress: MOCK_ADDRESSES[0],
    items: [
      {
        id: 'item_06',
        name: 'Ceramic Vase — Terracotta',
        variant: 'Large',
        quantity: 1,
        unitPrice: 560000,
        imageUrl: '',
      },
    ],
    timeline: [
      { label: 'Order Placed', date: '12 Jan 2026', completed: true },
      { label: 'Cancelled', date: '12 Jan 2026', completed: true },
    ],
  },
]

export const MOCK_WISHLIST: MockWishlistItem[] = [
  {
    id: 'wish_01',
    name: 'Ōkura Lounge Chair',
    price: 1980000,
    imageUrl: '',
    handle: 'okura-lounge-chair',
  },
  {
    id: 'wish_02',
    name: 'Handcrafted Brass Pendant',
    price: 760000,
    originalPrice: 950000,
    imageUrl: '',
    handle: 'handcrafted-brass-pendant',
  },
  {
    id: 'wish_03',
    name: 'Reclaimed Teak Dining Table',
    price: 4200000,
    imageUrl: '',
    handle: 'reclaimed-teak-dining-table',
  },
  {
    id: 'wish_04',
    name: 'Jaipur Block Print Cushion',
    price: 180000,
    originalPrice: 250000,
    imageUrl: '',
    handle: 'jaipur-block-print-cushion',
  },
]

export function formatPriceMock(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}
