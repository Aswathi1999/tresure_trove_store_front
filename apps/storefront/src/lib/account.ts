import { cookies } from 'next/headers'
import { medusa } from '@/lib/medusa'
import type { HttpTypes } from '@medusajs/types'
import type { MockOrder } from '@/lib/account.mock'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<{ authorization: string } | null> {
  const store = await cookies()
  const token = store.get('tt_session')?.value
  if (!token) return null
  return { authorization: `Bearer ${token}` }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface CustomerAddress {
  id: string
  label: string
  firstName: string
  lastName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pin: string
  countryCode: string
  isDefault: boolean
}

export interface CustomerOrderItem {
  id: string
  name: string
  variant: string
  quantity: number
  unitPrice: number
  imageUrl: string
}

export interface CustomerOrder {
  id: string
  number: string
  date: string
  total: number
  status: MockOrder['status']
  items: CustomerOrderItem[]
}

export interface CustomerOrderDetail extends CustomerOrder {
  // Pre-tax goods subtotal, pre-tax shipping, total tax (GST), and discount —
  // so the order detail breakdown reconciles to `total` instead of guessing.
  subtotal: number
  shipping: number
  tax: number
  discount: number
  // Tracking numbers from the order's fulfillment labels (added by admin when
  // the order ships). Empty until the order is fulfilled with tracking.
  tracking: Array<{ number: string; url?: string }>
  shippingAddress: {
    fullName: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    pin: string
    country: string
  } | null
  timeline: Array<{ label: string; date: string; completed: boolean }>
}

// ── Internal mappers ──────────────────────────────────────────────────────────

function mapOrderStatus(order: HttpTypes.StoreOrder): MockOrder['status'] {
  if (order.status === 'canceled') return 'Cancelled'
  const fs = order.fulfillment_status
  if (fs === 'delivered') return 'Delivered'
  if (fs === 'shipped' || fs === 'partially_shipped') return 'Shipped'
  return 'Processing'
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function buildOrderNumber(displayId: number, createdAt: string | Date): string {
  return `TT-${new Date(createdAt).getFullYear()}-${String(displayId).padStart(4, '0')}`
}

interface RawLineItem {
  id: string
  title?: string
  subtitle?: string
  thumbnail?: string | null
  quantity: number
  unit_price?: number
}

function mapOrderItem(item: RawLineItem): CustomerOrderItem {
  return {
    id: item.id,
    name: item.title ?? 'Product',
    variant: item.subtitle ?? '',
    quantity: item.quantity,
    unitPrice: item.unit_price ?? 0,
    imageUrl: item.thumbnail ?? '',
  }
}

function buildTimeline(
  order: HttpTypes.StoreOrder,
): Array<{ label: string; date: string; completed: boolean }> {
  const status = mapOrderStatus(order)
  const placed = order.created_at ? formatDate(order.created_at) : ''

  if (status === 'Cancelled') {
    return [
      { label: 'Order Placed', date: placed, completed: true },
      { label: 'Cancelled', date: placed, completed: true },
    ]
  }

  return [
    { label: 'Order Placed', date: placed, completed: true },
    {
      label: 'Payment Confirmed',
      date: placed,
      completed: order.payment_status === 'captured',
    },
    {
      label: 'Processing',
      date: '',
      completed: status !== 'Processing',
    },
    {
      label: 'Shipped',
      date: '',
      completed: status === 'Shipped' || status === 'Delivered',
    },
    { label: 'Delivered', date: '', completed: status === 'Delivered' },
  ]
}

// ── Public fetchers ───────────────────────────────────────────────────────────

export async function getAuthenticatedCustomerId(): Promise<string | null> {
  const headers = await getAuthHeaders()
  if (!headers) return null
  try {
    const { customer } = await medusa.store.customer.retrieve({}, headers)
    return customer.id
  } catch {
    return null
  }
}

export async function getCustomer(): Promise<CustomerProfile | null> {
  const headers = await getAuthHeaders()
  if (!headers) return null
  try {
    const { customer } = await medusa.store.customer.retrieve({}, headers)
    return {
      id: customer.id,
      firstName: customer.first_name ?? '',
      lastName: customer.last_name ?? '',
      email: customer.email,
      phone: customer.phone ?? '',
    }
  } catch {
    return null
  }
}

export async function getCustomerAddresses(): Promise<CustomerAddress[]> {
  const headers = await getAuthHeaders()
  if (!headers) return []
  try {
    const { customer } = await medusa.store.customer.retrieve({ fields: '*addresses' }, headers)
    return (customer.addresses ?? []).map((addr) => ({
      id: addr.id,
      label: (addr.metadata?.['label'] as string | undefined) ?? '',
      firstName: addr.first_name ?? '',
      lastName: addr.last_name ?? '',
      phone: addr.phone ?? '',
      line1: addr.address_1 ?? '',
      line2: addr.address_2 ?? undefined,
      city: addr.city ?? '',
      state: addr.province ?? '',
      pin: addr.postal_code ?? '',
      countryCode: addr.country_code ?? 'in',
      isDefault: addr.is_default_shipping ?? false,
    }))
  } catch {
    return []
  }
}

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const headers = await getAuthHeaders()
  if (!headers) return []
  try {
    // Ask Medusa for newest-first; also sort defensively below in case the
    // backend ignores the order param, so the most recent order is always on top.
    const { orders } = await medusa.store.order.list({ order: '-created_at' }, headers)
    const sorted = [...orders].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      // Descending by creation time; break ties on display_id so same-timestamp
      // orders still show the later-numbered one first.
      return tb - ta || (b.display_id ?? 0) - (a.display_id ?? 0)
    })
    return sorted.map((order) => ({
      id: order.id,
      number: buildOrderNumber(order.display_id ?? 0, order.created_at),
      date: formatDate(order.created_at),
      total: order.total ?? 0,
      status: mapOrderStatus(order),
      items: ((order.items ?? []) as RawLineItem[]).map(mapOrderItem),
    }))
  } catch {
    return []
  }

  // Fallback: look up guest orders by email from account page context
  // Guest orders won't show without authentication
  return []
}

export async function getCustomerOrder(id: string): Promise<CustomerOrderDetail | null> {
  const headers = await getAuthHeaders()
  if (!headers) return null
  try {
    // Request the total breakdown fields (added to the default selection with
    // `+`); they aren't returned by default. Without these, the detail page
    // had to guess and wrongly showed "Shipping: Free" with no tax line.
    const { order } = await medusa.store.order.retrieve(
      id,
      {
        fields:
          '+item_subtotal,+shipping_subtotal,+tax_total,+discount_total,+fulfillments.labels.tracking_number,+fulfillments.labels.tracking_url',
      },
      headers,
    )
    const addr = order.shipping_address
    const t = order as unknown as {
      item_subtotal?: number
      shipping_subtotal?: number
      tax_total?: number
      discount_total?: number
      fulfillments?: Array<{
        labels?: Array<{ tracking_number?: string | null; tracking_url?: string | null }>
      }>
    }
    const items = ((order.items ?? []) as RawLineItem[]).map(mapOrderItem)
    const itemsSubtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    // Flatten tracking numbers across all fulfillment labels. Drop placeholder
    // "#" urls (Medusa stores that when no real tracking URL was provided).
    const tracking = (t.fulfillments ?? []).flatMap((f) =>
      (f.labels ?? [])
        .filter((l) => l.tracking_number)
        .map((l) => ({
          number: l.tracking_number as string,
          url: l.tracking_url && l.tracking_url !== '#' ? l.tracking_url : undefined,
        })),
    )

    return {
      id: order.id,
      number: buildOrderNumber(order.display_id ?? 0, order.created_at),
      date: formatDate(order.created_at),
      total: order.total ?? 0,
      subtotal: t.item_subtotal ?? itemsSubtotal,
      shipping: t.shipping_subtotal ?? 0,
      tax: t.tax_total ?? 0,
      discount: t.discount_total ?? 0,
      tracking,
      status: mapOrderStatus(order),
      items,
      shippingAddress: addr
        ? {
            fullName: [addr.first_name, addr.last_name].filter(Boolean).join(' '),
            phone: addr.phone ?? '',
            line1: addr.address_1 ?? '',
            line2: addr.address_2 ?? undefined,
            city: addr.city ?? '',
            state: addr.province ?? '',
            pin: addr.postal_code ?? '',
            country: addr.country_code?.toUpperCase() ?? '',
          }
        : null,
      timeline: buildTimeline(order),
    }
  } catch {
    return null
  }
}
