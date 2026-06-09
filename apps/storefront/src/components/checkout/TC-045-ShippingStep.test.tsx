import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MockShippingOption } from '@/lib/checkout.mock'

const getShippingOptionsActionMock = vi.fn()
const addShippingMethodActionMock = vi.fn()

vi.mock('@/actions/checkout', () => ({
  getShippingOptionsAction: (...args: unknown[]) => getShippingOptionsActionMock(...args),
  addShippingMethodAction: (...args: unknown[]) => addShippingMethodActionMock(...args),
}))

import ShippingStep from './ShippingStep'

const MOCK_OPTIONS: MockShippingOption[] = [
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
]

describe('ShippingStep', () => {
  beforeEach(() => {
    getShippingOptionsActionMock.mockReset()
    addShippingMethodActionMock.mockReset()
  })

  it('renders the section with back and continue buttons', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByTestId('shipping-step')).toBeInTheDocument()
    expect(screen.getByTestId('shipping-back-button')).toBeInTheDocument()
    expect(screen.getByTestId('shipping-continue-button')).toBeInTheDocument()
    await waitFor(() => expect(getShippingOptionsActionMock).toHaveBeenCalledTimes(1))
  })

  it('shows loading state initially before options load', () => {
    getShippingOptionsActionMock.mockReturnValueOnce(new Promise(() => {}))
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/loading shipping options/i)).toBeInTheDocument()
  })

  it('renders shipping options after loading', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    expect(await screen.findByTestId('shipping-option-ship_standard')).toBeInTheDocument()
    expect(screen.getByTestId('shipping-option-ship_express')).toBeInTheDocument()
  })

  it('auto-selects the first option after loading', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await waitFor(() => expect(screen.getByTestId('shipping-radio-ship_standard')).toBeChecked())
    expect(screen.getByTestId('shipping-radio-ship_express')).not.toBeChecked()
  })

  it('displays carrier and estimated delivery for each option', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_standard')
    expect(screen.getByText(/DTDC \/ Blue Dart/)).toBeInTheDocument()
    expect(screen.getByText(/5–7 business days/)).toBeInTheDocument()
    expect(screen.getByText(/FedEx Priority/)).toBeInTheDocument()
    expect(screen.getByText(/2–3 business days/)).toBeInTheDocument()
  })

  it('shows FREE for zero-price options', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_standard')
    expect(screen.getByText('FREE')).toBeInTheDocument()
  })

  it('shows formatted price for non-zero options', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_express')
    expect(screen.getByText('Rs. 599')).toBeInTheDocument()
  })

  it('allows selecting a different option', async () => {
    const user = userEvent.setup()
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_express')
    await user.click(screen.getByTestId('shipping-radio-ship_express'))
    expect(screen.getByTestId('shipping-radio-ship_express')).toBeChecked()
    expect(screen.getByTestId('shipping-radio-ship_standard')).not.toBeChecked()
  })

  it('calls addShippingMethodAction and onNext with the selected option', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    addShippingMethodActionMock.mockResolvedValueOnce(undefined)
    render(<ShippingStep onNext={onNext} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_standard')
    await user.click(screen.getByTestId('shipping-continue-button'))
    await waitFor(() => {
      expect(addShippingMethodActionMock).toHaveBeenCalledWith('ship_standard')
      expect(onNext).toHaveBeenCalledWith(MOCK_OPTIONS[0])
    })
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    render(<ShippingStep onNext={vi.fn()} onBack={onBack} />)
    await user.click(screen.getByTestId('shipping-back-button'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows error banner when getShippingOptionsAction rejects', async () => {
    getShippingOptionsActionMock.mockRejectedValueOnce(new Error('Network error'))
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    expect(await screen.findByTestId('shipping-error')).toHaveTextContent(
      'Failed to load shipping options. Please refresh and try again.',
    )
  })

  it('shows empty state when no options are returned', async () => {
    getShippingOptionsActionMock.mockResolvedValueOnce([])
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    expect(await screen.findByText(/No shipping options are available/i)).toBeInTheDocument()
  })

  it('shows error banner and keeps button disabled when addShippingMethodAction rejects', async () => {
    const user = userEvent.setup()
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    addShippingMethodActionMock.mockRejectedValueOnce(new Error('Shipping save failed.'))
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_standard')
    await user.click(screen.getByTestId('shipping-continue-button'))
    expect(await screen.findByTestId('shipping-error')).toHaveTextContent('Shipping save failed.')
  })

  it('shows "SAVING…" and disables continue button while submitting', async () => {
    const user = userEvent.setup()
    let resolve: (v: unknown) => void = () => {}
    getShippingOptionsActionMock.mockResolvedValueOnce(MOCK_OPTIONS)
    addShippingMethodActionMock.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r
      }),
    )
    render(<ShippingStep onNext={vi.fn()} onBack={vi.fn()} />)
    await screen.findByTestId('shipping-option-ship_standard')
    await user.click(screen.getByTestId('shipping-continue-button'))
    await waitFor(() => {
      expect(screen.getByTestId('shipping-continue-button')).toHaveTextContent('SAVING…')
      expect(screen.getByTestId('shipping-continue-button')).toBeDisabled()
    })
    resolve(undefined)
  })
})
