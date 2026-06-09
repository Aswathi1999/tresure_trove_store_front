import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressForm } from './AddressForm'
import type { MockSavedAddress } from '@/lib/account.mock'

const EXISTING_ADDRESS: MockSavedAddress = {
  id: 'addr_01',
  label: 'Home',
  fullName: 'Arjun Mehra',
  phone: '+91 98765 43210',
  line1: '12, Indiranagar 1st Cross',
  city: 'Bengaluru',
  state: 'Karnataka',
  pin: '560038',
  country: 'India',
  isDefault: true,
}

describe('AddressForm', () => {
  const onSaveMock = vi.fn()
  const onCancelMock = vi.fn()

  beforeEach(() => {
    onSaveMock.mockReset()
    onCancelMock.mockReset()
  })

  it('renders "Add New Address" title when no initial prop', () => {
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)
    expect(screen.getByText('Add New Address')).toBeInTheDocument()
  })

  it('renders "Edit Address" title when initial prop has an id', () => {
    render(<AddressForm initial={EXISTING_ADDRESS} onSave={onSaveMock} onCancel={onCancelMock} />)
    expect(screen.getByText('Edit Address')).toBeInTheDocument()
  })

  it('pre-fills form with initial values', () => {
    render(<AddressForm initial={EXISTING_ADDRESS} onSave={onSaveMock} onCancel={onCancelMock} />)
    expect(screen.getByTestId('input-label')).toHaveValue('Home')
    expect(screen.getByTestId('input-full-name')).toHaveValue('Arjun Mehra')
    expect(screen.getByTestId('input-phone')).toHaveValue('+91 98765 43210')
    expect(screen.getByTestId('input-line1')).toHaveValue('12, Indiranagar 1st Cross')
    expect(screen.getByTestId('input-city')).toHaveValue('Bengaluru')
    expect(screen.getByTestId('input-state')).toHaveValue('Karnataka')
    expect(screen.getByTestId('input-pin')).toHaveValue('560038')
    expect(screen.getByTestId('input-country')).toHaveValue('India')
  })

  it('defaults country to India for empty form', () => {
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)
    expect(screen.getByTestId('input-country')).toHaveValue('India')
  })

  it('shows required field errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    await user.click(screen.getByTestId('address-form-submit'))

    expect(await screen.findByText('Label is required')).toBeInTheDocument()
    expect(screen.getByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Street address is required')).toBeInTheDocument()
    expect(screen.getByText('City is required')).toBeInTheDocument()
    expect(screen.getByText('State is required')).toBeInTheDocument()
    expect(onSaveMock).not.toHaveBeenCalled()
  })

  it('shows PIN format error for non-6-digit values', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    await user.type(screen.getByTestId('input-pin'), '123')
    await user.click(screen.getByTestId('address-form-submit'))

    expect(await screen.findByText('Enter a valid 6-digit PIN')).toBeInTheDocument()
  })

  it('calls onSave with form values on valid submit', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    await user.type(screen.getByTestId('input-label'), 'Office')
    await user.type(screen.getByTestId('input-full-name'), 'Arjun Mehra')
    await user.type(screen.getByTestId('input-phone'), '+91 98765 43210')
    await user.type(screen.getByTestId('input-line1'), '3rd Floor, Brigade Gateway')
    await user.type(screen.getByTestId('input-city'), 'Bengaluru')
    await user.type(screen.getByTestId('input-state'), 'Karnataka')
    await user.type(screen.getByTestId('input-pin'), '560055')

    await user.click(screen.getByTestId('address-form-submit'))

    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Office',
        fullName: 'Arjun Mehra',
        city: 'Bengaluru',
        pin: '560055',
      }),
    )
  })

  it('strips digits typed into the full name field', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    const input = screen.getByTestId('input-full-name')
    await user.type(input, 'Arjun123')
    expect(input).toHaveValue('Arjun')
  })

  it('strips letters typed into the phone field', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    const input = screen.getByTestId('input-phone')
    await user.type(input, '98765abcd')
    expect(input).toHaveValue('98765')
  })

  it('strips special characters typed into the state field', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    const input = screen.getByTestId('input-state')
    await user.type(input, 'Karnataka@#')
    expect(input).toHaveValue('Karnataka')
  })

  it('calls onCancel when the X button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    await user.click(screen.getByTestId('address-form-cancel'))

    expect(onCancelMock).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when the secondary Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddressForm onSave={onSaveMock} onCancel={onCancelMock} />)

    await user.click(screen.getByTestId('address-form-cancel-secondary'))

    expect(onCancelMock).toHaveBeenCalledTimes(1)
  })
})
