/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'

jest.mock('@medusajs/admin-sdk', () => ({
  defineWidgetConfig: jest.fn((cfg: unknown) => cfg),
}))

import DiscountUsageReportWidget from '../discount-usage-report'

// ── Types ─────────────────────────────────────────────────────────────────────

type ApplicationMethod = { type: 'percentage' | 'fixed'; value: number; currency_code?: string }

type Promotion = {
  id: string
  code: string
  usage_count?: number
  status?: string
  application_method?: ApplicationMethod
}

type GiftCard = {
  id: string
  code: string
  value: number
  balance: number
  currency_code?: string
  is_disabled?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 'promo_01',
    code: 'TT-INDIA-500',
    usage_count: 10,
    status: 'active',
    application_method: { type: 'fixed', value: 50000, currency_code: 'inr' },
    ...overrides,
  }
}

function makeGiftCard(overrides: Partial<GiftCard> = {}): GiftCard {
  return {
    id: 'gc_01',
    code: 'TTGC-ABC123',
    value: 100000,
    balance: 75000,
    currency_code: 'inr',
    is_disabled: false,
    ...overrides,
  }
}

let fetchMock: jest.Mock

function mockFetchResponses({
  promotions = [] as Promotion[],
  giftCards = [] as GiftCard[],
  promoOk = true,
  giftOk = true,
  error = null as Error | null,
} = {}) {
  if (error) {
    fetchMock.mockRejectedValue(error)
    return
  }
  fetchMock
    .mockResolvedValueOnce({ ok: promoOk, json: async () => ({ promotions }) })
    .mockResolvedValueOnce({ ok: giftOk, json: async () => ({ gift_cards: giftCards }) })
}

async function renderAndWait(opts = {}) {
  mockFetchResponses(opts)
  render(<DiscountUsageReportWidget />)
  await waitFor(() => {
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
  })
}

beforeEach(() => {
  fetchMock = jest.fn()
  ;(globalThis as Record<string, unknown>).fetch = fetchMock
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).fetch
})

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('renders the Discount Usage Report heading', async () => {
    await renderAndWait()
    expect(screen.getByText('Discount Usage Report')).toBeInTheDocument()
  })

  it('renders the subtitle', async () => {
    await renderAndWait()
    expect(screen.getByText(/live redemption data/i)).toBeInTheDocument()
  })

  it('renders all three stat card labels', async () => {
    await renderAndWait()
    expect(screen.getByText('Total Redemptions')).toBeInTheDocument()
    expect(screen.getByText('Discount Distributed')).toBeInTheDocument()
    expect(screen.getByText('Gift Card Liability')).toBeInTheDocument()
  })

  it('renders the Top Codes section label', async () => {
    await renderAndWait()
    expect(screen.getByText(/top codes by redemptions/i)).toBeInTheDocument()
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('loading state', () => {
  it('shows "Loading…" in the top codes area before fetch resolves', () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    render(<DiscountUsageReportWidget />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows "—" in stat cards while loading', () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    render(<DiscountUsageReportWidget />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(3)
  })

  it('hides "Loading…" after fetch resolves', async () => {
    await renderAndWait()
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
  })
})

// ── Stat cards — total redemptions ────────────────────────────────────────────

describe('total redemptions stat', () => {
  it('shows 0 redemptions when no promotions exist', async () => {
    await renderAndWait({ promotions: [] })
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows the sum of all promotion usage_count values', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({ usage_count: 12 }),
        makePromotion({ id: 'p2', code: 'TT-UAE-100', usage_count: 8 }),
      ],
    })
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('treats undefined usage_count as 0', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({ usage_count: 7 }),
        makePromotion({ id: 'p2', code: 'TT-NEW', usage_count: undefined }),
      ],
    })
    // Total should be 7 (0 + 7), shown as the redemptions stat
    expect(screen.getAllByText('7').length).toBeGreaterThan(0)
  })
})

// ── Stat cards — discount distributed ─────────────────────────────────────────

describe('discount distributed stat', () => {
  it('shows ₹0 when no fixed-type promotions exist', async () => {
    await renderAndWait({ promotions: [] })
    const inrValues = screen.getAllByText(/₹/)
    expect(inrValues.length).toBeGreaterThanOrEqual(1)
  })

  it('calculates total discount for fixed-type promotions (value × usage_count)', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({ application_method: { type: 'fixed', value: 50000 }, usage_count: 4 }),
      ],
    })
    // 50000 × 4 uses = 200000 (rupees, major unit) = ₹2,00,000
    expect(screen.getByText(/₹2,00,000/)).toBeInTheDocument()
  })

  it('excludes percentage-type promotions from the discount total', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({ application_method: { type: 'percentage', value: 10 }, usage_count: 100 }),
      ],
    })
    // Percentage type should not be counted — total stays ₹0
    expect(screen.getAllByText(/₹0/).length).toBeGreaterThan(0)
  })

  it('excludes promotions with no application_method from the total', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: undefined, usage_count: 50 })],
    })
    expect(screen.getAllByText(/₹0/).length).toBeGreaterThan(0)
  })
})

// ── Stat cards — gift card liability ──────────────────────────────────────────

describe('gift card liability stat', () => {
  it('shows ₹0 liability when no gift cards exist', async () => {
    await renderAndWait({ giftCards: [] })
    const inrValues = screen.getAllByText(/₹0/)
    expect(inrValues.length).toBeGreaterThan(0)
  })

  it('sums balance of all active (non-disabled) gift cards', async () => {
    await renderAndWait({
      giftCards: [
        makeGiftCard({ balance: 50000 }),
        makeGiftCard({ id: 'gc_02', code: 'TTGC-DEF', balance: 25000 }),
      ],
    })
    // 50000 + 25000 = 75000 (rupees, major unit) = ₹75,000
    expect(screen.getByText(/₹75,000/)).toBeInTheDocument()
  })

  it('excludes disabled gift cards from the liability total', async () => {
    await renderAndWait({
      giftCards: [
        makeGiftCard({ balance: 50000 }),
        makeGiftCard({ id: 'gc_dis', code: 'TTGC-DIS', balance: 100000, is_disabled: true }),
      ],
    })
    // Only active card: 50000 (rupees) = ₹50,000
    expect(screen.getByText(/₹50,000/)).toBeInTheDocument()
  })

  it('shows active card count below the liability value', async () => {
    await renderAndWait({
      giftCards: [
        makeGiftCard({ balance: 50000 }),
        makeGiftCard({ id: 'gc_02', code: 'TTGC-B', balance: 30000 }),
      ],
    })
    expect(screen.getByText(/2 active cards/i)).toBeInTheDocument()
  })

  it('shows singular "card" when only one active gift card exists', async () => {
    await renderAndWait({ giftCards: [makeGiftCard({ balance: 50000 })] })
    expect(screen.getByText(/1 active card/i)).toBeInTheDocument()
  })
})

// ── Top codes table ───────────────────────────────────────────────────────────

describe('top codes table', () => {
  it('shows "No promotion codes found" when promotions array is empty', async () => {
    await renderAndWait({ promotions: [] })
    expect(screen.getByText(/no promotion codes found/i)).toBeInTheDocument()
  })

  it('renders the code value in a table cell', async () => {
    await renderAndWait({ promotions: [makePromotion({ code: 'TT-INDIA-500' })] })
    expect(screen.getByText('TT-INDIA-500')).toBeInTheDocument()
  })

  it('sorts codes by usage_count descending', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({ id: 'p1', code: 'LOW-USE', usage_count: 2 }),
        makePromotion({ id: 'p2', code: 'HIGH-USE', usage_count: 50 }),
      ],
    })
    const rows = screen.getAllByRole('row')
    // Header is rows[0], first data row is rows[1]
    expect(rows[1].textContent).toContain('HIGH-USE')
    expect(rows[2].textContent).toContain('LOW-USE')
  })

  it('shows at most 10 codes even when more than 10 promotions exist', async () => {
    const promos = Array.from({ length: 15 }, (_, i) =>
      makePromotion({ id: `p${i}`, code: `CODE-${i}`, usage_count: 15 - i }),
    )
    await renderAndWait({ promotions: promos })
    const rows = screen.getAllByRole('row')
    // 1 header + 10 data rows
    expect(rows).toHaveLength(11)
  })

  it('shows rank numbers starting from 1', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({ id: 'p1', code: 'A', usage_count: 10 }),
        makePromotion({ id: 'p2', code: 'B', usage_count: 5 }),
      ],
    })
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})

// ── Top codes — type and value labels ─────────────────────────────────────────

describe('type and value labels', () => {
  it('shows "Percentage" type for percentage application method', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: { type: 'percentage', value: 15 } })],
    })
    expect(screen.getByText('Percentage')).toBeInTheDocument()
  })

  it('shows "{value}%" for percentage method value', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: { type: 'percentage', value: 20 } })],
    })
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('shows "Fixed Amount" type for fixed application method', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: { type: 'fixed', value: 50000 } })],
    })
    expect(screen.getByText('Fixed Amount')).toBeInTheDocument()
  })

  it('shows INR-formatted value for fixed method', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: { type: 'fixed', value: 500000 } })],
    })
    expect(screen.getByText(/₹5,00,000/)).toBeInTheDocument()
  })

  it('shows "Automatic" type when there is no application method', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: undefined })],
    })
    expect(screen.getByText('Automatic')).toBeInTheDocument()
  })

  it('shows "—" value for Automatic type promotions', async () => {
    await renderAndWait({
      promotions: [makePromotion({ application_method: undefined })],
    })
    // The "—" in the value column (not loading dash)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })
})

// ── Status badges ─────────────────────────────────────────────────────────────

describe('status badges', () => {
  it('shows "active" status badge for an active promotion', async () => {
    await renderAndWait({ promotions: [makePromotion({ status: 'active' })] })
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('shows "expired" status badge for an expired promotion', async () => {
    await renderAndWait({ promotions: [makePromotion({ status: 'expired' })] })
    expect(screen.getByText('expired')).toBeInTheDocument()
  })

  it('shows "disabled" status badge for a disabled promotion', async () => {
    await renderAndWait({ promotions: [makePromotion({ status: 'disabled' })] })
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('falls back to "active" when status is undefined', async () => {
    await renderAndWait({ promotions: [makePromotion({ status: undefined })] })
    expect(screen.getByText('active')).toBeInTheDocument()
  })
})

// ── Error handling ─────────────────────────────────────────────────────────────

describe('error handling', () => {
  it('shows an error message when fetch throws', async () => {
    mockFetchResponses({ error: new Error('Network failure') })
    render(<DiscountUsageReportWidget />)
    expect(await screen.findByText('Network failure')).toBeInTheDocument()
  })

  it('shows empty state when promotions endpoint returns non-ok', async () => {
    mockFetchResponses({ promoOk: false, giftOk: true })
    render(<DiscountUsageReportWidget />)
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/no promotion codes found/i)).toBeInTheDocument()
  })

  it('does not crash when gift cards endpoint returns non-ok', async () => {
    mockFetchResponses({ promotions: [makePromotion()], giftOk: false })
    render(<DiscountUsageReportWidget />)
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    })
    expect(screen.getByText('TT-INDIA-500')).toBeInTheDocument()
  })
})

// ── API fetch behaviour ───────────────────────────────────────────────────────

describe('API fetch behaviour', () => {
  it('fetches from /admin/promotions?limit=100', async () => {
    await renderAndWait()
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/promotions?limit=100',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('fetches from /admin/gift-cards?limit=100', async () => {
    await renderAndWait()
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/gift-cards?limit=100',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('makes exactly 2 fetch calls on mount', async () => {
    await renderAndWait()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

// ── Integration — widget + subscriber ─────────────────────────────────────────

describe('integration — widget data matches subscriber-logged regions', () => {
  it('correctly renders a multi-region set of promotions with different currencies', async () => {
    await renderAndWait({
      promotions: [
        makePromotion({
          id: 'p_in',
          code: 'TT-INDIA-500',
          usage_count: 25,
          application_method: { type: 'fixed', value: 50000 },
        }),
        makePromotion({
          id: 'p_ae',
          code: 'TT-UAE-100',
          usage_count: 12,
          application_method: { type: 'percentage', value: 10 },
        }),
        makePromotion({
          id: 'p_sea',
          code: 'TT-SEA-FREE',
          usage_count: 8,
          application_method: undefined,
        }),
      ],
      giftCards: [
        makeGiftCard({ id: 'gc_in', balance: 200000, currency_code: 'inr' }),
        makeGiftCard({ id: 'gc_ae', balance: 50000, currency_code: 'aed' }),
      ],
    })

    // Total redemptions: 25 + 12 + 8 = 45
    expect(screen.getByText('45')).toBeInTheDocument()
    // India code is top by redemptions
    const rows = screen.getAllByRole('row')
    expect(rows[1].textContent).toContain('TT-INDIA-500')
    // Both gift cards active
    expect(screen.getByText(/2 active cards/i)).toBeInTheDocument()
  })
})
