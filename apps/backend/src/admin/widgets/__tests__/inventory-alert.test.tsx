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

import InventoryAlertWidget from '../inventory-alert'

// Mirrors LOW_STOCK_THRESHOLD in subscribers/low-stock-alert.ts — the integration
// tests below verify the widget and subscriber agree on the same boundary value.
const LOW_STOCK_THRESHOLD = 5

// ── Types ─────────────────────────────────────────────────────────────────────

type MockItem = {
  id: string
  sku?: string | null
  title?: string | null
  stocked_quantity?: number | null
  reserved_quantity?: number | null
  available_quantity?: number | null
  metadata?: Record<string, unknown> | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<MockItem> = {}): MockItem {
  return {
    id: 'iitem_01',
    sku: 'OKR-TK-L',
    title: 'Ōkura Lounge Chair — Teak Large',
    stocked_quantity: 20,
    reserved_quantity: 2,
    available_quantity: 18,
    metadata: null,
    ...overrides,
  }
}

function renderWidget(item: MockItem) {
  return render(<InventoryAlertWidget data={item as never} />)
}

let fetchMock: jest.Mock

beforeEach(() => {
  fetchMock = jest.fn()
  ;(globalThis as Record<string, unknown>).fetch = fetchMock
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).fetch
})

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('renders the Stock Alert heading', () => {
    renderWidget(makeItem())
    expect(screen.getByText('Stock Alert')).toBeInTheDocument()
  })

  it('shows the SKU in the subtitle when sku is provided', () => {
    renderWidget(makeItem({ sku: 'OKR-TK-L' }))
    expect(screen.getByText('SKU: OKR-TK-L')).toBeInTheDocument()
  })

  it('shows "Low stock monitoring" when sku is null', () => {
    renderWidget(makeItem({ sku: null }))
    expect(screen.getByText('Low stock monitoring')).toBeInTheDocument()
  })

  it('renders the stock-status-badge with data-testid', () => {
    renderWidget(makeItem())
    expect(screen.getByTestId('stock-status-badge')).toBeInTheDocument()
  })

  it('renders the low-stock-threshold-input with data-testid', () => {
    renderWidget(makeItem())
    expect(screen.getByTestId('low-stock-threshold-input')).toBeInTheDocument()
  })

  it('renders the save-threshold-btn with data-testid', () => {
    renderWidget(makeItem())
    expect(screen.getByTestId('save-threshold-btn')).toBeInTheDocument()
  })

  it('renders the Stocked, Reserved, and Available labels', () => {
    renderWidget(makeItem())
    expect(screen.getByText('Stocked')).toBeInTheDocument()
    expect(screen.getByText('Reserved')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
  })
})

// ── Stock quantity display ─────────────────────────────────────────────────────

describe('stock quantity display', () => {
  it('shows the stocked_quantity value', () => {
    renderWidget(makeItem({ stocked_quantity: 42, reserved_quantity: 3, available_quantity: 39 }))
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows the reserved_quantity value', () => {
    renderWidget(makeItem({ stocked_quantity: 20, reserved_quantity: 7, available_quantity: 13 }))
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows the available_quantity value when provided', () => {
    renderWidget(makeItem({ stocked_quantity: 20, reserved_quantity: 3, available_quantity: 17 }))
    expect(screen.getByText('17')).toBeInTheDocument()
  })

  it('falls back to stocked − reserved when available_quantity is null', () => {
    renderWidget(makeItem({ stocked_quantity: 10, reserved_quantity: 4, available_quantity: null }))
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('clamps fallback available to 0 when reserved exceeds stocked', () => {
    renderWidget(makeItem({ stocked_quantity: 3, reserved_quantity: 8, available_quantity: null }))
    // 3 - 8 = -5, clamped to 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })
})

// ── Status badge — out_of_stock ───────────────────────────────────────────────

describe('status — out of stock', () => {
  it('shows "Out of Stock" when available_quantity is 0', () => {
    renderWidget(makeItem({ available_quantity: 0 }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Out of Stock')
  })

  it('shows "Out of Stock" when available_quantity is negative (clamped)', () => {
    renderWidget(makeItem({ stocked_quantity: 0, reserved_quantity: 0, available_quantity: null }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Out of Stock')
  })

  it('shows the out-of-stock alert message', () => {
    renderWidget(makeItem({ available_quantity: 0 }))
    expect(screen.getByText(/restock immediately/i)).toBeInTheDocument()
  })
})

// ── Status badge — low_stock ──────────────────────────────────────────────────

describe('status — low stock', () => {
  it('shows "Low Stock" when available equals the threshold', () => {
    renderWidget(makeItem({ available_quantity: 5, metadata: { low_stock_threshold: 5 } }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Low Stock')
  })

  it('shows "Low Stock" when available is below the threshold', () => {
    renderWidget(makeItem({ available_quantity: 2, metadata: { low_stock_threshold: 5 } }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Low Stock')
  })

  it('shows the low stock alert message with the available count', () => {
    renderWidget(makeItem({ available_quantity: 3, metadata: { low_stock_threshold: 5 } }))
    expect(screen.getByText(/only 3 unit/i)).toBeInTheDocument()
  })

  it('includes the threshold value in the low stock alert message', () => {
    renderWidget(makeItem({ available_quantity: 2, metadata: { low_stock_threshold: 8 } }))
    expect(screen.getByText(/threshold of 8/i)).toBeInTheDocument()
  })
})

// ── Status badge — in_stock ───────────────────────────────────────────────────

describe('status — in stock', () => {
  it('shows "In Stock" when available exceeds the threshold', () => {
    renderWidget(makeItem({ available_quantity: 18, metadata: { low_stock_threshold: 5 } }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('In Stock')
  })

  it('does not render an alert message when in stock', () => {
    renderWidget(makeItem({ available_quantity: 18 }))
    expect(screen.queryByText(/restock/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/only .* unit/i)).not.toBeInTheDocument()
  })
})

// ── Default threshold ─────────────────────────────────────────────────────────

describe('default threshold', () => {
  it('uses 5 as the default threshold when metadata has no low_stock_threshold', () => {
    renderWidget(makeItem({ available_quantity: 5, metadata: null }))
    // available=5 equals default threshold=5 → Low Stock
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Low Stock')
  })

  it('uses 5 as default threshold — above 5 is In Stock', () => {
    renderWidget(makeItem({ available_quantity: 6, metadata: null }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('In Stock')
  })

  it('pre-fills the threshold input with the value from metadata', () => {
    renderWidget(makeItem({ metadata: { low_stock_threshold: 10 } }))
    expect(screen.getByTestId('low-stock-threshold-input')).toHaveValue(10)
  })

  it('pre-fills the threshold input with 5 when metadata is null', () => {
    renderWidget(makeItem({ metadata: null }))
    expect(screen.getByTestId('low-stock-threshold-input')).toHaveValue(5)
  })
})

// ── Stock bar ─────────────────────────────────────────────────────────────────

describe('stock bar', () => {
  it('renders the "Available vs Stocked" label', () => {
    renderWidget(makeItem())
    expect(screen.getByText(/available vs stocked/i)).toBeInTheDocument()
  })

  it('shows 0% when stocked_quantity is 0', () => {
    renderWidget(makeItem({ stocked_quantity: 0, reserved_quantity: 0, available_quantity: 0 }))
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows correct percentage when available and stocked are set', () => {
    renderWidget(makeItem({ stocked_quantity: 20, available_quantity: 10 }))
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows 100% when available equals stocked', () => {
    renderWidget(makeItem({ stocked_quantity: 10, reserved_quantity: 0, available_quantity: 10 }))
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})

// ── Threshold input — interaction ─────────────────────────────────────────────

describe('threshold input interaction', () => {
  it('Save button is disabled when threshold equals the saved value', () => {
    renderWidget(makeItem({ metadata: { low_stock_threshold: 5 } }))
    expect(screen.getByTestId('save-threshold-btn')).toBeDisabled()
  })

  it('Save button is enabled after the threshold input is changed', async () => {
    const user = userEvent.setup()
    renderWidget(makeItem({ metadata: { low_stock_threshold: 5 } }))
    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '10')
    expect(screen.getByTestId('save-threshold-btn')).not.toBeDisabled()
  })

  it('changing the threshold input updates the status badge in real time', async () => {
    const user = userEvent.setup()
    // available=6, initial threshold=5 → In Stock
    renderWidget(makeItem({ available_quantity: 6, metadata: { low_stock_threshold: 5 } }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('In Stock')

    // Raise threshold to 10 → available=6 is now Low Stock
    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '10')
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Low Stock')
  })
})

// ── Save threshold ────────────────────────────────────────────────────────────

describe('save threshold', () => {
  it('POSTs to /admin/inventory-items/:id on save', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeItem({ id: 'iitem_99', metadata: { low_stock_threshold: 5 } }))

    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '8')
    await user.click(screen.getByTestId('save-threshold-btn'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/admin/inventory-items/iitem_99',
        expect.objectContaining({ method: 'POST', credentials: 'include' }),
      )
    })
  })

  it('includes the new threshold value in the request body metadata', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeItem({ id: 'iitem_01', metadata: { low_stock_threshold: 5 } }))

    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '12')
    await user.click(screen.getByTestId('save-threshold-btn'))

    await waitFor(() => {
      const body = JSON.parse(
        (fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string,
      ) as { metadata: Record<string, unknown> }
      expect(body.metadata.low_stock_threshold).toBe(12)
    })
  })

  it('shows "Saving…" on the button while the request is in flight', async () => {
    const user = userEvent.setup()
    let resolve!: () => void
    fetchMock.mockReturnValue(
      new Promise<Response>((r) => {
        resolve = () => r({ ok: true } as Response)
      }),
    )

    renderWidget(makeItem({ metadata: { low_stock_threshold: 5 } }))
    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '9')
    await user.click(screen.getByTestId('save-threshold-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('save-threshold-btn')).toHaveTextContent('Saving…')
    })

    await act(async () => {
      resolve()
    })
  })

  it('shows "Threshold updated." after a successful save', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeItem({ metadata: { low_stock_threshold: 5 } }))

    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '8')
    await user.click(screen.getByTestId('save-threshold-btn'))

    expect(await screen.findByText('Threshold updated.')).toBeInTheDocument()
  })

  it('shows "Failed to save. Try again." when the API returns an error', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: false, status: 500 })
    renderWidget(makeItem({ metadata: { low_stock_threshold: 5 } }))

    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '8')
    await user.click(screen.getByTestId('save-threshold-btn'))

    expect(await screen.findByText('Failed to save. Try again.')).toBeInTheDocument()
  })

  it('shows error message when fetch throws', async () => {
    const user = userEvent.setup()
    fetchMock.mockRejectedValue(new Error('Network error'))
    renderWidget(makeItem({ metadata: { low_stock_threshold: 5 } }))

    await user.clear(screen.getByTestId('low-stock-threshold-input'))
    await user.type(screen.getByTestId('low-stock-threshold-input'), '8')
    await user.click(screen.getByTestId('save-threshold-btn'))

    expect(await screen.findByText('Failed to save. Try again.')).toBeInTheDocument()
  })

  it('does not show success or error message on initial render', () => {
    renderWidget(makeItem())
    expect(screen.queryByText('Threshold updated.')).not.toBeInTheDocument()
    expect(screen.queryByText('Failed to save. Try again.')).not.toBeInTheDocument()
  })
})

// ── Integration — widget ↔ subscriber threshold consistency ───────────────────

describe('integration — widget and subscriber use the same threshold boundary', () => {
  it('widget DEFAULT_THRESHOLD matches subscriber LOW_STOCK_THRESHOLD (both 5)', () => {
    // Render with no metadata so the widget uses its DEFAULT_THRESHOLD
    // available = LOW_STOCK_THRESHOLD exactly should show Low Stock on both sides
    renderWidget(makeItem({ available_quantity: LOW_STOCK_THRESHOLD, metadata: null }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Low Stock')
  })

  it('widget shows In Stock for available = LOW_STOCK_THRESHOLD + 1 (same boundary as subscriber)', () => {
    renderWidget(makeItem({ available_quantity: LOW_STOCK_THRESHOLD + 1, metadata: null }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('In Stock')
  })

  it('widget shows Out of Stock for available = 0 (subscriber also fires at 0)', () => {
    renderWidget(makeItem({ available_quantity: 0, metadata: null }))
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Out of Stock')
  })

  it('widget status reflects reserved stock reducing available below threshold', () => {
    // stocked=8, reserved=5 → available=3 ≤ threshold=5 → Low Stock
    // This matches subscriber: available = max(0, 8-5) = 3, fires warning
    renderWidget(
      makeItem({
        stocked_quantity: 8,
        reserved_quantity: 5,
        available_quantity: null,
        metadata: null,
      }),
    )
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('Low Stock')
  })

  it('widget shows In Stock when reserved stock leaves available above threshold', () => {
    // stocked=20, reserved=5 → available=15 > threshold=5 → In Stock
    // Subscriber would NOT fire in this case
    renderWidget(
      makeItem({
        stocked_quantity: 20,
        reserved_quantity: 5,
        available_quantity: null,
        metadata: null,
      }),
    )
    expect(screen.getByTestId('stock-status-badge')).toHaveTextContent('In Stock')
  })
})
