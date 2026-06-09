import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const setShippingAddressActionMock = vi.fn()
vi.mock('@/actions/checkout', () => ({
  setShippingAddressAction: (...args: unknown[]) => setShippingAddressActionMock(...args),
}))

import AddressStep from './AddressStep'

const VALID_ADDRESS = {
  email: 'arjun@example.com',
  fullName: 'Arjun Mehra',
  phone: '+919876543210',
  addressLine1: '12 MG Road, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  country: 'IN',
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Record<string, string> = {},
) {
  const vals = { ...VALID_ADDRESS, ...overrides }
  await user.clear(screen.getByTestId('input-email'))
  await user.type(screen.getByTestId('input-email'), vals.email)
  await user.clear(screen.getByTestId('input-full-name'))
  await user.type(screen.getByTestId('input-full-name'), vals.fullName)
  await user.clear(screen.getByTestId('input-phone'))
  await user.type(screen.getByTestId('input-phone'), vals.phone)
  await user.clear(screen.getByTestId('input-address-line-1'))
  await user.type(screen.getByTestId('input-address-line-1'), vals.addressLine1)
  await user.clear(screen.getByTestId('input-city'))
  await user.type(screen.getByTestId('input-city'), vals.city)
  await user.clear(screen.getByTestId('input-state'))
  await user.type(screen.getByTestId('input-state'), vals.state)
  await user.clear(screen.getByTestId('input-pincode'))
  await user.type(screen.getByTestId('input-pincode'), vals.pincode)
  if (vals.country !== 'IN') {
    await user.selectOptions(screen.getByTestId('input-country'), vals.country)
  }
}

describe('AddressStep', () => {
  beforeEach(() => {
    setShippingAddressActionMock.mockReset()
  })

  it('renders all form fields and the continue button', () => {
    render(<AddressStep onNext={vi.fn()} />)
    expect(screen.getByTestId('address-step')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-full-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-phone')).toBeInTheDocument()
    expect(screen.getByTestId('input-address-line-1')).toBeInTheDocument()
    expect(screen.getByTestId('input-address-line-2')).toBeInTheDocument()
    expect(screen.getByTestId('input-city')).toBeInTheDocument()
    expect(screen.getByTestId('input-state')).toBeInTheDocument()
    expect(screen.getByTestId('input-pincode')).toBeInTheDocument()
    expect(screen.getByTestId('input-country')).toBeInTheDocument()
    expect(screen.getByTestId('address-continue-button')).toHaveTextContent('CONTINUE TO SHIPPING')
  })

  it('defaults country to India (IN)', () => {
    render(<AddressStep onNext={vi.fn()} />)
    expect(screen.getByTestId('input-country')).toHaveValue('IN')
  })

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Valid email address is required')).toBeInTheDocument()
    expect(screen.getByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Valid phone number required')).toBeInTheDocument()
    expect(screen.getByText('Street address is required')).toBeInTheDocument()
    expect(screen.getByText('City is required')).toBeInTheDocument()
    expect(screen.getByText('State / region is required')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await user.type(screen.getByTestId('input-email'), 'not-an-email')
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Valid email address is required')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('shows error when fullName is too short', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user, { fullName: 'A' })
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Full name is required')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('shows error when phone is too short', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user, { phone: '123' })
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Valid phone number required')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('shows error when addressLine1 is too short', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user, { addressLine1: 'MG' })
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Street address is required')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('shows Indian PIN code error for non-6-digit value when country is IN', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user, { pincode: '1234' })
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Enter a valid 6-digit PIN code')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('accepts a valid 6-digit Indian PIN code', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    setShippingAddressActionMock.mockResolvedValueOnce(undefined)
    render(<AddressStep onNext={onNext} />)
    await fillForm(user, { pincode: '560038' })
    await user.click(screen.getByTestId('address-continue-button'))
    await waitFor(() => expect(onNext).toHaveBeenCalled())
  })

  it('shows international postal code error for country US with invalid code', async () => {
    const user = userEvent.setup()
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user, { country: 'US', pincode: '123' })
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByText('Enter a valid postal code (5–10 digits)')).toBeInTheDocument()
    expect(setShippingAddressActionMock).not.toHaveBeenCalled()
  })

  it('accepts a valid US postal code (5 digits)', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    setShippingAddressActionMock.mockResolvedValueOnce(undefined)
    render(<AddressStep onNext={onNext} />)
    await fillForm(user, { country: 'US', pincode: '90210' })
    await user.click(screen.getByTestId('address-continue-button'))
    await waitFor(() => expect(onNext).toHaveBeenCalled())
  })

  it('calls setShippingAddressAction and onNext with correct values on valid submit', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    setShippingAddressActionMock.mockResolvedValueOnce(undefined)
    render(<AddressStep onNext={onNext} />)
    await fillForm(user)
    await user.click(screen.getByTestId('address-continue-button'))
    await waitFor(() => {
      expect(setShippingAddressActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: VALID_ADDRESS.email,
          fullName: VALID_ADDRESS.fullName,
          phone: VALID_ADDRESS.phone,
          addressLine1: VALID_ADDRESS.addressLine1,
          city: VALID_ADDRESS.city,
          state: VALID_ADDRESS.state,
          pincode: VALID_ADDRESS.pincode,
          country: VALID_ADDRESS.country,
        }),
      )
      expect(onNext).toHaveBeenCalledTimes(1)
    })
  })

  it('shows a server error when the action throws', async () => {
    const user = userEvent.setup()
    setShippingAddressActionMock.mockRejectedValueOnce(new Error('Address save failed.'))
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user)
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByTestId('address-server-error')).toHaveTextContent(
      'Address save failed.',
    )
  })

  it('shows a fallback server error message when action throws without message', async () => {
    const user = userEvent.setup()
    setShippingAddressActionMock.mockRejectedValueOnce('unknown error')
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user)
    await user.click(screen.getByTestId('address-continue-button'))
    expect(await screen.findByTestId('address-server-error')).toHaveTextContent(
      'Failed to save address. Please try again.',
    )
  })

  it('disables submit button and shows "SAVING…" while submitting', async () => {
    const user = userEvent.setup()
    let resolve: (v: unknown) => void = () => {}
    setShippingAddressActionMock.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r
      }),
    )
    render(<AddressStep onNext={vi.fn()} />)
    await fillForm(user)
    await user.click(screen.getByTestId('address-continue-button'))
    await waitFor(() => {
      expect(screen.getByTestId('address-continue-button')).toHaveTextContent('SAVING…')
      expect(screen.getByTestId('address-continue-button')).toBeDisabled()
    })
    await act(async () => {
      resolve(undefined)
    })
  })
})
