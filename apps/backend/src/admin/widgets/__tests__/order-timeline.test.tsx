/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@medusajs/admin-sdk', () => ({
  defineWidgetConfig: jest.fn((cfg: unknown) => cfg),
}))

jest.mock('@medusajs/framework/types', () => ({}))

import OrderTimelineWidget from '../order-timeline'

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderPayment = { id: string; captured_at?: string | null }
type OrderPaymentCollection = { id: string; payments?: OrderPayment[] }
type OrderFulfillment = {
  id: string
  created_at: string
  shipped_at?: string | null
  delivered_at?: string | null
}

type MockOrder = {
  id: string
  created_at: string
  updated_at: string
  payment_collections?: OrderPaymentCollection[]
  fulfillments?: OrderFulfillment[]
  canceled_at?: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeOrder(overrides: Partial<MockOrder> = {}): MockOrder {
  return {
    id: 'order_01',
    created_at: '2026-01-01T10:00:00.000Z',
    updated_at: '2026-01-01T10:00:00.000Z',
    payment_collections: [],
    fulfillments: [],
    canceled_at: null,
    ...overrides,
  }
}

type FetchMock = jest.Mock

let fetchMock: FetchMock

function mockFetchNotes(notes: unknown[] = []) {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ notes }),
  })
}

async function renderWidget(order: MockOrder) {
  render(<OrderTimelineWidget data={order as never} />)
  await waitFor(() => {
    expect(screen.queryByText('Loading timeline…')).not.toBeInTheDocument()
  })
}

beforeEach(() => {
  fetchMock = jest.fn()
  ;(globalThis as Record<string, unknown>).fetch = fetchMock
  mockFetchNotes()
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).fetch
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('header', () => {
  it('renders the Order Timeline heading', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByText('Order Timeline')).toBeInTheDocument()
  })

  it('renders the subtitle', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByText(/status history/i)).toBeInTheDocument()
  })

  it('shows the event count badge', async () => {
    await renderWidget(makeOrder())
    // At minimum, the order_placed event is always present
    expect(screen.getByText(/1 event/i)).toBeInTheDocument()
  })

  it('uses the plural form in the badge for multiple events', async () => {
    const order = makeOrder({
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
    })
    await renderWidget(order)
    expect(screen.getByText(/2 events/i)).toBeInTheDocument()
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('loading state', () => {
  it('shows loading indicator before fetch resolves', () => {
    // Set up a fetch that never resolves so we can check the loading state
    fetchMock.mockReturnValue(new Promise(() => {}))
    render(<OrderTimelineWidget data={makeOrder() as never} />)
    expect(screen.getByText('Loading timeline…')).toBeInTheDocument()
  })

  it('hides loading indicator after fetch resolves', async () => {
    await renderWidget(makeOrder())
    expect(screen.queryByText('Loading timeline…')).not.toBeInTheDocument()
  })
})

// ── deriveEvents — order_placed ───────────────────────────────────────────────

describe('order_placed event', () => {
  it('always renders the Order Placed event', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByText('Order Placed')).toBeInTheDocument()
  })

  it('renders exactly one Order Placed event per order', async () => {
    await renderWidget(makeOrder())
    expect(screen.getAllByText('Order Placed')).toHaveLength(1)
  })
})

// ── deriveEvents — payment_captured ──────────────────────────────────────────

describe('payment_captured event', () => {
  it('renders Payment Captured when a payment has captured_at', async () => {
    const order = makeOrder({
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
    })
    await renderWidget(order)
    expect(screen.getByText('Payment Captured')).toBeInTheDocument()
  })

  it('does not render Payment Captured when no payment has captured_at', async () => {
    const order = makeOrder({
      payment_collections: [{ id: 'pc_01', payments: [{ id: 'pay_01', captured_at: null }] }],
    })
    await renderWidget(order)
    expect(screen.queryByText('Payment Captured')).not.toBeInTheDocument()
  })

  it('renders one Payment Captured per captured payment', async () => {
    const order = makeOrder({
      payment_collections: [
        {
          id: 'pc_01',
          payments: [
            { id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' },
            { id: 'pay_02', captured_at: '2026-01-01T12:00:00.000Z' },
          ],
        },
      ],
    })
    await renderWidget(order)
    expect(screen.getAllByText('Payment Captured')).toHaveLength(2)
  })
})

// ── deriveEvents — fulfillment events ────────────────────────────────────────

describe('fulfillment events', () => {
  it('renders Fulfillment Created when a fulfillment exists', async () => {
    const order = makeOrder({
      fulfillments: [{ id: 'ful_01', created_at: '2026-01-01T12:00:00.000Z' }],
    })
    await renderWidget(order)
    expect(screen.getByText('Fulfillment Created')).toBeInTheDocument()
  })

  it('renders Order Shipped when fulfillment has shipped_at', async () => {
    const order = makeOrder({
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-01-01T12:00:00.000Z',
          shipped_at: '2026-01-02T09:00:00.000Z',
        },
      ],
    })
    await renderWidget(order)
    expect(screen.getByText('Order Shipped')).toBeInTheDocument()
  })

  it('does not render Order Shipped when shipped_at is null', async () => {
    const order = makeOrder({
      fulfillments: [{ id: 'ful_01', created_at: '2026-01-01T12:00:00.000Z', shipped_at: null }],
    })
    await renderWidget(order)
    expect(screen.queryByText('Order Shipped')).not.toBeInTheDocument()
  })

  it('renders Order Delivered when fulfillment has delivered_at', async () => {
    const order = makeOrder({
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-01-01T12:00:00.000Z',
          shipped_at: '2026-01-02T09:00:00.000Z',
          delivered_at: '2026-01-03T14:00:00.000Z',
        },
      ],
    })
    await renderWidget(order)
    expect(screen.getByText('Order Delivered')).toBeInTheDocument()
  })

  it('does not render Order Delivered when delivered_at is null', async () => {
    const order = makeOrder({
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-01-01T12:00:00.000Z',
          shipped_at: '2026-01-02T09:00:00.000Z',
          delivered_at: null,
        },
      ],
    })
    await renderWidget(order)
    expect(screen.queryByText('Order Delivered')).not.toBeInTheDocument()
  })
})

// ── deriveEvents — cancelled ──────────────────────────────────────────────────

describe('cancelled event', () => {
  it('renders Order Cancelled when canceled_at is set', async () => {
    const order = makeOrder({ canceled_at: '2026-01-02T00:00:00.000Z' })
    await renderWidget(order)
    expect(screen.getByText('Order Cancelled')).toBeInTheDocument()
  })

  it('does not render Order Cancelled when canceled_at is null', async () => {
    await renderWidget(makeOrder({ canceled_at: null }))
    expect(screen.queryByText('Order Cancelled')).not.toBeInTheDocument()
  })
})

// ── sortByTime — chronological order ─────────────────────────────────────────

describe('events are sorted chronologically', () => {
  it('shows Order Placed before Payment Captured', async () => {
    const order = makeOrder({
      created_at: '2026-01-01T10:00:00.000Z',
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
    })
    await renderWidget(order)

    const items = screen.getAllByRole('listitem')
    const labels = items.map((li) => li.textContent ?? '')

    const placedIdx = labels.findIndex((t) => t.includes('Order Placed'))
    const capturedIdx = labels.findIndex((t) => t.includes('Payment Captured'))
    expect(placedIdx).toBeLessThan(capturedIdx)
  })
})

// ── Notes from API ────────────────────────────────────────────────────────────

describe('notes fetched from API', () => {
  it('fetches notes for the correct order ID', async () => {
    await renderWidget(makeOrder({ id: 'order_99' }))
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('resource_id=order_99'),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('renders fetched notes as Note Added events', async () => {
    mockFetchNotes([
      {
        id: 'note_01',
        value: 'Customer called — confirmed address',
        created_at: '2026-01-01T12:00:00.000Z',
        author: { first_name: 'Admin', last_name: null, email: 'admin@tt.com' },
      },
    ])
    await renderWidget(makeOrder())
    expect(screen.getByText('Note Added')).toBeInTheDocument()
    expect(screen.getByText('Customer called — confirmed address')).toBeInTheDocument()
  })

  it('renders the author name for a note', async () => {
    mockFetchNotes([
      {
        id: 'note_01',
        value: 'Hold order',
        created_at: '2026-01-01T12:00:00.000Z',
        author: { first_name: 'Raj', last_name: 'Kumar', email: 'raj@tt.com' },
      },
    ])
    await renderWidget(makeOrder())
    expect(screen.getByText(/Raj Kumar/)).toBeInTheDocument()
  })

  it('falls back to "Admin" when author has no name or email', async () => {
    mockFetchNotes([
      {
        id: 'note_01',
        value: 'Test note',
        created_at: '2026-01-01T12:00:00.000Z',
        author: {},
      },
    ])
    await renderWidget(makeOrder())
    expect(screen.getByText(/— Admin/)).toBeInTheDocument()
  })

  it('continues rendering without notes when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'))
    render(<OrderTimelineWidget data={makeOrder() as never} />)
    await waitFor(() => {
      expect(screen.queryByText('Loading timeline…')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Order Placed')).toBeInTheDocument()
  })
})

// ── Timestamp formatting ──────────────────────────────────────────────────────

describe('timestamp formatting', () => {
  it('renders a formatted timestamp for the Order Placed event', async () => {
    await renderWidget(makeOrder({ created_at: '2026-01-15T09:30:00.000Z' }))
    // The fmt() function formats with en-IN locale — just verify the year is visible
    const items = screen.getAllByRole('listitem')
    const placedItem = items.find((li) => li.textContent?.includes('Order Placed'))
    expect(placedItem?.textContent).toMatch(/2026/)
  })

  it('renders a formatted timestamp for the Payment Captured event', async () => {
    const order = makeOrder({
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-02-10T14:00:00.000Z' }] },
      ],
    })
    await renderWidget(order)
    const items = screen.getAllByRole('listitem')
    const capturedItem = items.find((li) => li.textContent?.includes('Payment Captured'))
    expect(capturedItem?.textContent).toMatch(/2026/)
  })

  it('renders a formatted timestamp for the Fulfillment Created event', async () => {
    const order = makeOrder({
      fulfillments: [{ id: 'ful_01', created_at: '2026-02-11T08:00:00.000Z' }],
    })
    await renderWidget(order)
    const items = screen.getAllByRole('listitem')
    const fulfillmentItem = items.find((li) => li.textContent?.includes('Fulfillment Created'))
    expect(fulfillmentItem?.textContent).toMatch(/2026/)
  })

  it('renders a formatted timestamp for the Order Shipped event', async () => {
    const order = makeOrder({
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-02-11T08:00:00.000Z',
          shipped_at: '2026-02-12T10:00:00.000Z',
        },
      ],
    })
    await renderWidget(order)
    const items = screen.getAllByRole('listitem')
    const shippedItem = items.find((li) => li.textContent?.includes('Order Shipped'))
    expect(shippedItem?.textContent).toMatch(/2026/)
  })
})

// ── Full order lifecycle — all 7 event types ──────────────────────────────────

describe('full order lifecycle — all event types', () => {
  it('renders all six order status events for a complete lifecycle', async () => {
    mockFetchNotes([
      {
        id: 'note_01',
        value: 'Internal review done',
        created_at: '2026-01-03T08:00:00.000Z',
        author: { first_name: 'Admin', last_name: null, email: 'admin@tt.com' },
      },
    ])

    const order = makeOrder({
      created_at: '2026-01-01T10:00:00.000Z',
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-01-02T09:00:00.000Z',
          shipped_at: '2026-01-02T14:00:00.000Z',
          delivered_at: '2026-01-04T12:00:00.000Z',
        },
      ],
    })

    await renderWidget(order)

    expect(screen.getByText('Order Placed')).toBeInTheDocument()
    expect(screen.getByText('Payment Captured')).toBeInTheDocument()
    expect(screen.getByText('Fulfillment Created')).toBeInTheDocument()
    expect(screen.getByText('Order Shipped')).toBeInTheDocument()
    expect(screen.getByText('Order Delivered')).toBeInTheDocument()
    expect(screen.getByText('Note Added')).toBeInTheDocument()
  })

  it('shows 6 events in the count badge for a complete lifecycle with one note', async () => {
    mockFetchNotes([
      {
        id: 'note_01',
        value: 'Packed and ready',
        created_at: '2026-01-02T08:00:00.000Z',
        author: {},
      },
    ])

    const order = makeOrder({
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-01-02T09:00:00.000Z',
          shipped_at: '2026-01-02T14:00:00.000Z',
          delivered_at: '2026-01-04T12:00:00.000Z',
        },
      ],
    })

    await renderWidget(order)
    expect(screen.getByText(/6 events/i)).toBeInTheDocument()
  })

  it('shows all events in chronological order for a complete lifecycle', async () => {
    const order = makeOrder({
      created_at: '2026-01-01T10:00:00.000Z',
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
      fulfillments: [
        {
          id: 'ful_01',
          created_at: '2026-01-02T09:00:00.000Z',
          shipped_at: '2026-01-03T10:00:00.000Z',
          delivered_at: '2026-01-04T12:00:00.000Z',
        },
      ],
    })

    await renderWidget(order)

    const items = screen.getAllByRole('listitem')
    const labels = items.map((li) => li.textContent ?? '')

    const idxOf = (label: string) => labels.findIndex((t) => t.includes(label))

    expect(idxOf('Order Placed')).toBeLessThan(idxOf('Payment Captured'))
    expect(idxOf('Payment Captured')).toBeLessThan(idxOf('Fulfillment Created'))
    expect(idxOf('Fulfillment Created')).toBeLessThan(idxOf('Order Shipped'))
    expect(idxOf('Order Shipped')).toBeLessThan(idxOf('Order Delivered'))
  })

  it('renders Order Cancelled as the final event when order is cancelled', async () => {
    const order = makeOrder({
      created_at: '2026-01-01T10:00:00.000Z',
      payment_collections: [
        { id: 'pc_01', payments: [{ id: 'pay_01', captured_at: '2026-01-01T11:00:00.000Z' }] },
      ],
      canceled_at: '2026-01-02T08:00:00.000Z',
    })

    await renderWidget(order)

    const items = screen.getAllByRole('listitem')
    const labels = items.map((li) => li.textContent ?? '')
    const cancelledIdx = labels.findIndex((t) => t.includes('Order Cancelled'))
    const placedIdx = labels.findIndex((t) => t.includes('Order Placed'))

    expect(cancelledIdx).toBeGreaterThan(placedIdx)
    expect(cancelledIdx).toBe(labels.length - 1)
  })
})

// ── Add Internal Note ─────────────────────────────────────────────────────────

describe('Add Internal Note section', () => {
  it('renders the section heading', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByText(/add internal note/i)).toBeInTheDocument()
  })

  it('renders the textarea with the correct placeholder', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByPlaceholderText(/leave an internal note/i)).toBeInTheDocument()
  })

  it('renders the Save Note button', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument()
  })

  it('Save Note button is disabled when the textarea is empty', async () => {
    await renderWidget(makeOrder())
    expect(screen.getByRole('button', { name: /save note/i })).toBeDisabled()
  })

  it('Save Note button is enabled when the textarea has text', async () => {
    const user = userEvent.setup()
    await renderWidget(makeOrder())
    await user.type(screen.getByPlaceholderText(/leave an internal note/i), 'Hold for VIP')
    expect(screen.getByRole('button', { name: /save note/i })).not.toBeDisabled()
  })

  it('POSTs to /admin/notes with the correct payload on submit', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notes: [] }) }) // initial load
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          note: {
            id: 'note_new',
            value: 'VIP customer — priority dispatch',
            created_at: '2026-01-01T15:00:00.000Z',
          },
        }),
      }) // note POST

    await renderWidget(makeOrder({ id: 'order_01' }))
    await user.type(
      screen.getByPlaceholderText(/leave an internal note/i),
      'VIP customer — priority dispatch',
    )
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      const postCall = (fetchMock.mock.calls as [string, RequestInit][]).find(
        ([url, opts]) => url === '/admin/notes' && opts.method === 'POST',
      )
      expect(postCall).toBeDefined()
      const body = JSON.parse(postCall![1].body as string) as Record<string, unknown>
      expect(body.resource_id).toBe('order_01')
      expect(body.resource_type).toBe('order')
      expect(body.value).toBe('VIP customer — priority dispatch')
    })
  })

  it('appends the new note to the timeline after a successful save', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notes: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          note: {
            id: 'note_new',
            value: 'Check courier pickup',
            created_at: '2026-01-01T15:00:00.000Z',
          },
        }),
      })

    await renderWidget(makeOrder())
    await user.type(screen.getByPlaceholderText(/leave an internal note/i), 'Check courier pickup')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(screen.getByText('Check courier pickup')).toBeInTheDocument()
    })
  })

  it('clears the textarea after a successful save', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notes: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          note: { id: 'note_new', value: 'Test', created_at: '2026-01-01T15:00:00.000Z' },
        }),
      })

    await renderWidget(makeOrder())
    const textarea = screen.getByPlaceholderText(/leave an internal note/i)
    await user.type(textarea, 'Test')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(textarea).toHaveValue('')
    })
  })

  it('shows an error message when the note POST fails', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notes: [] }) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })

    await renderWidget(makeOrder())
    await user.type(screen.getByPlaceholderText(/leave an internal note/i), 'Failing note')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument()
    })
  })

  it('shows "Saving…" on the button while the request is in flight', async () => {
    const user = userEvent.setup()
    let resolvePost!: () => void
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notes: [] }) })
      .mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          resolvePost = () =>
            resolve({
              ok: true,
              json: async () => ({
                note: { id: 'n', value: 'x', created_at: '2026-01-01T15:00:00.000Z' },
              }),
            } as Response)
        }),
      )

    await renderWidget(makeOrder())
    await user.type(screen.getByPlaceholderText(/leave an internal note/i), 'Hold')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    })

    await act(async () => {
      resolvePost()
    })
  })
})
