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

import CustomerGroupBadgeWidget from '../customer-group-badge'

// ── Types ─────────────────────────────────────────────────────────────────────

type CustomerGroup = { id: string; name: string }

type MockCustomer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  has_account?: boolean
  groups?: CustomerGroup[]
  metadata?: Record<string, unknown> | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCustomer(overrides: Partial<MockCustomer> = {}): MockCustomer {
  return {
    id: 'cus_01',
    email: 'priya@example.com',
    first_name: 'Priya',
    last_name: 'Sharma',
    has_account: true,
    groups: [],
    metadata: null,
    ...overrides,
  }
}

function renderWidget(customer: MockCustomer) {
  return render(<CustomerGroupBadgeWidget data={customer as never} />)
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
  it('renders the Customer Group heading', () => {
    renderWidget(makeCustomer())
    expect(screen.getByText('Customer Group')).toBeInTheDocument()
  })

  it('shows the full name (first + last) in the subtitle', () => {
    renderWidget(makeCustomer({ first_name: 'Priya', last_name: 'Sharma' }))
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
  })

  it('shows only the first name when last_name is null', () => {
    renderWidget(makeCustomer({ first_name: 'Priya', last_name: null }))
    expect(screen.getByText('Priya')).toBeInTheDocument()
  })

  it('falls back to email when both names are null', () => {
    renderWidget(makeCustomer({ first_name: null, last_name: null }))
    expect(screen.getByText('priya@example.com')).toBeInTheDocument()
  })

  it('renders customer-group-badge with data-testid', () => {
    renderWidget(makeCustomer())
    expect(screen.getByTestId('customer-group-badge')).toBeInTheDocument()
  })

  it('renders account-status-badge with data-testid', () => {
    renderWidget(makeCustomer())
    expect(screen.getByTestId('account-status-badge')).toBeInTheDocument()
  })

  it('renders deactivate-account-btn with data-testid', () => {
    renderWidget(makeCustomer())
    expect(screen.getByTestId('deactivate-account-btn')).toBeInTheDocument()
  })
})

// ── Tier detection — Trade ─────────────────────────────────────────────────────

describe('tier detection — trade', () => {
  it('shows "Trade" badge for a group named "trade"', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_01', name: 'trade' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Trade')
  })

  it('shows "Trade" badge when "trade" is part of the group name', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_01', name: 'Treasure Trove Trade' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Trade')
  })

  it('is case-insensitive — TRADE in uppercase triggers Trade badge', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_01', name: 'TRADE CUSTOMERS' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Trade')
  })

  it('shows the trade tier description', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_01', name: 'trade' }] }))
    expect(screen.getByText(/interior designer/i)).toBeInTheDocument()
  })
})

// ── Tier detection — Retail ────────────────────────────────────────────────────

describe('tier detection — retail', () => {
  it('shows "Retail" badge for a group named "retail"', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_02', name: 'retail' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Retail')
  })

  it('shows "Retail" badge when "retail" is part of the group name', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_02', name: 'Retail India' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Retail')
  })

  it('is case-insensitive — RETAIL in uppercase triggers Retail badge', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_02', name: 'RETAIL SEGMENT' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Retail')
  })

  it('shows the retail tier description', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_02', name: 'retail' }] }))
    expect(screen.getByText(/standard retail customer/i)).toBeInTheDocument()
  })
})

// ── Tier detection — No Group ──────────────────────────────────────────────────

describe('tier detection — no group', () => {
  it('shows "No Group" badge when groups array is empty', () => {
    renderWidget(makeCustomer({ groups: [] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('No Group')
  })

  it('shows "No Group" badge when groups have unrelated names', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_03', name: 'VIP Members' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('No Group')
  })

  it('trade takes precedence over retail when both groups are present', () => {
    renderWidget(
      makeCustomer({
        groups: [
          { id: 'grp_01', name: 'trade' },
          { id: 'grp_02', name: 'retail' },
        ],
      }),
    )
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Trade')
  })
})

// ── Group tags ─────────────────────────────────────────────────────────────────

describe('group tags', () => {
  it('renders a tag for each assigned group', () => {
    renderWidget(
      makeCustomer({
        groups: [
          { id: 'grp_01', name: 'trade' },
          { id: 'grp_02', name: 'retail' },
        ],
      }),
    )
    expect(screen.getByTestId('group-tag-grp_01')).toBeInTheDocument()
    expect(screen.getByTestId('group-tag-grp_02')).toBeInTheDocument()
  })

  it('shows the group name text inside each tag', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_01', name: 'Trade Partners' }] }))
    expect(screen.getByTestId('group-tag-grp_01')).toHaveTextContent('Trade Partners')
  })

  it('shows "No groups assigned." when groups array is empty', () => {
    renderWidget(makeCustomer({ groups: [] }))
    expect(screen.getByText('No groups assigned.')).toBeInTheDocument()
  })

  it('renders the correct number of tags for multiple groups', () => {
    renderWidget(
      makeCustomer({
        groups: [
          { id: 'g1', name: 'trade' },
          { id: 'g2', name: 'retail' },
          { id: 'g3', name: 'vip' },
        ],
      }),
    )
    expect(screen.getByTestId('group-tag-g1')).toBeInTheDocument()
    expect(screen.getByTestId('group-tag-g2')).toBeInTheDocument()
    expect(screen.getByTestId('group-tag-g3')).toBeInTheDocument()
  })
})

// ── Account status badge ───────────────────────────────────────────────────────

describe('account status badge', () => {
  it('shows "Active" when has_account is true', () => {
    renderWidget(makeCustomer({ has_account: true }))
    expect(screen.getByTestId('account-status-badge')).toHaveTextContent('Active')
  })

  it('shows "Inactive" when has_account is false', () => {
    renderWidget(makeCustomer({ has_account: false }))
    expect(screen.getByTestId('account-status-badge')).toHaveTextContent('Inactive')
  })

  it('Deactivate Account button is disabled when has_account is false', () => {
    renderWidget(makeCustomer({ has_account: false }))
    expect(screen.getByTestId('deactivate-account-btn')).toBeDisabled()
  })

  it('Deactivate Account button is enabled when has_account is true', () => {
    renderWidget(makeCustomer({ has_account: true }))
    expect(screen.getByTestId('deactivate-account-btn')).not.toBeDisabled()
  })
})

// ── Deactivation flow ─────────────────────────────────────────────────────────

describe('deactivation flow — confirmation dialog', () => {
  it('shows a confirmation dialog when Deactivate Account is clicked', async () => {
    const user = userEvent.setup()
    renderWidget(makeCustomer())
    await user.click(screen.getByTestId('deactivate-account-btn'))
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('hides the confirmation dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWidget(makeCustomer())
    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
  })

  it('shows Confirm and Cancel buttons in the confirmation dialog', async () => {
    const user = userEvent.setup()
    renderWidget(makeCustomer())
    await user.click(screen.getByTestId('deactivate-account-btn'))
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})

describe('deactivation flow — API call', () => {
  it('POSTs to /admin/customers/:id on Confirm', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeCustomer({ id: 'cus_99' }))

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/admin/customers/cus_99',
        expect.objectContaining({ method: 'POST', credentials: 'include' }),
      )
    })
  })

  it('sends has_account: false in the POST body', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeCustomer())

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      const body = JSON.parse(
        (fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string,
      ) as Record<string, unknown>
      expect(body.has_account).toBe(false)
    })
  })

  it('shows "Deactivating…" on the Confirm button while in flight', async () => {
    const user = userEvent.setup()
    let resolve!: () => void
    fetchMock.mockReturnValue(
      new Promise<Response>((r) => {
        resolve = () => r({ ok: true } as Response)
      }),
    )
    renderWidget(makeCustomer())

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.getByText('Deactivating…')).toBeInTheDocument()
    })

    await act(async () => {
      resolve()
    })
  })

  it('shows "Account deactivated successfully." after a successful deactivation', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeCustomer())

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText('Account deactivated successfully.')).toBeInTheDocument()
  })

  it('shows "Inactive" account status badge after successful deactivation', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeCustomer({ has_account: true }))

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await screen.findByText('Account deactivated successfully.')
    expect(screen.getByTestId('account-status-badge')).toHaveTextContent('Inactive')
  })

  it('shows "Failed to deactivate. Try again." when the API returns an error', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: false, status: 500 })
    renderWidget(makeCustomer())

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText('Failed to deactivate. Try again.')).toBeInTheDocument()
  })

  it('shows "Failed to deactivate. Try again." when fetch throws', async () => {
    const user = userEvent.setup()
    fetchMock.mockRejectedValue(new Error('Network error'))
    renderWidget(makeCustomer())

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText('Failed to deactivate. Try again.')).toBeInTheDocument()
  })

  it('does not show success or error message on initial render', () => {
    renderWidget(makeCustomer())
    expect(screen.queryByText('Account deactivated successfully.')).not.toBeInTheDocument()
    expect(screen.queryByText('Failed to deactivate. Try again.')).not.toBeInTheDocument()
  })
})

// ── Integration — widget ↔ deactivate route consistency ───────────────────────

describe('integration — widget and deactivate route', () => {
  it('widget POSTs to the same customer ID path that the route handles', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({ ok: true })
    renderWidget(makeCustomer({ id: 'cus_integration_01' }))

    await user.click(screen.getByTestId('deactivate-account-btn'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      const [url] = fetchMock.mock.calls[0] as [string]
      expect(url).toBe('/admin/customers/cus_integration_01')
    })
  })

  it('Trade badge renders correctly for the trade group used in TASK-123 seed', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_trade', name: 'Treasure Trove Trade' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Trade')
  })

  it('Retail badge renders correctly for the retail group used in TASK-123 seed', () => {
    renderWidget(makeCustomer({ groups: [{ id: 'grp_retail', name: 'Treasure Trove Retail' }] }))
    expect(screen.getByTestId('customer-group-badge')).toHaveTextContent('Retail')
  })
})
