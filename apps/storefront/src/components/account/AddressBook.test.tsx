import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/actions/account', () => ({
  addAddress: vi.fn().mockResolvedValue({ ok: true, data: 'addr_new' }),
  updateAddress: vi.fn().mockResolvedValue({ ok: true }),
  deleteAddress: vi.fn().mockResolvedValue({ ok: true }),
  setDefaultAddress: vi.fn().mockResolvedValue({ ok: true }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { AddressBook } from './AddressBook'
import type { MockSavedAddress } from '@/lib/account.mock'

const ADDR_HOME: MockSavedAddress = {
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

const ADDR_OFFICE: MockSavedAddress = {
  id: 'addr_02',
  label: 'Office',
  fullName: 'Arjun Mehra',
  phone: '+91 98765 43210',
  line1: '3rd Floor, Brigade Gateway',
  city: 'Bengaluru',
  state: 'Karnataka',
  pin: '560055',
  country: 'India',
  isDefault: false,
}

describe('AddressBook', () => {
  it('renders all address cards', () => {
    render(<AddressBook initialAddresses={[ADDR_HOME, ADDR_OFFICE]} />)
    expect(screen.getByTestId('address-card-addr_01')).toBeInTheDocument()
    expect(screen.getByTestId('address-card-addr_02')).toBeInTheDocument()
  })

  it('hides "Set Default" button for the default address', () => {
    render(<AddressBook initialAddresses={[ADDR_HOME, ADDR_OFFICE]} />)
    expect(screen.queryByTestId('set-default-addr_01')).not.toBeInTheDocument()
  })

  it('shows "Set Default" button only on non-default addresses', () => {
    render(<AddressBook initialAddresses={[ADDR_HOME, ADDR_OFFICE]} />)
    expect(screen.getByTestId('set-default-addr_02')).toBeInTheDocument()
  })

  it('shows empty state when no addresses', () => {
    render(<AddressBook initialAddresses={[]} />)
    expect(screen.getByTestId('address-book')).toBeInTheDocument()
    expect(screen.getByText(/no saved addresses/i)).toBeInTheDocument()
  })

  it('opens address form when "Add New Address" is clicked', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[]} />)

    await user.click(screen.getByTestId('add-address-button'))

    expect(screen.getByTestId('address-form')).toBeInTheDocument()
    expect(screen.getByText('Add New Address')).toBeInTheDocument()
  })

  it('returns to list when cancel is clicked in the add form', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[]} />)

    await user.click(screen.getByTestId('add-address-button'))
    await user.click(screen.getByTestId('address-form-cancel'))

    expect(screen.queryByTestId('address-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('address-book')).toBeInTheDocument()
  })

  it('adds a new address after filling and submitting the form', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[]} />)

    await user.click(screen.getByTestId('add-address-button'))
    await user.type(screen.getByTestId('input-label'), 'Home')
    await user.type(screen.getByTestId('input-full-name'), 'Test User')
    await user.type(screen.getByTestId('input-phone'), '+91 99999 00000')
    await user.type(screen.getByTestId('input-line1'), '1 Test Street, Test Area')
    await user.type(screen.getByTestId('input-city'), 'Mumbai')
    await user.type(screen.getByTestId('input-state'), 'Maharashtra')
    await user.type(screen.getByTestId('input-pin'), '400001')
    await user.click(screen.getByTestId('address-form-submit'))

    expect(screen.queryByTestId('address-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('address-book')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('removes an address when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[ADDR_HOME, ADDR_OFFICE]} />)

    await user.click(screen.getByTestId('delete-address-addr_02'))

    expect(screen.queryByTestId('address-card-addr_02')).not.toBeInTheDocument()
    expect(screen.getByTestId('address-card-addr_01')).toBeInTheDocument()
  })

  it('promotes a non-default address to default when "Set Default" is clicked', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[ADDR_HOME, ADDR_OFFICE]} />)

    await user.click(screen.getByTestId('set-default-addr_02'))

    expect(screen.queryByTestId('set-default-addr_02')).not.toBeInTheDocument()
    expect(screen.getByTestId('set-default-addr_01')).toBeInTheDocument()
  })

  it('opens edit form with pre-filled data when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[ADDR_HOME]} />)

    await user.click(screen.getByTestId('edit-address-addr_01'))

    expect(screen.getByTestId('address-form')).toBeInTheDocument()
    expect(screen.getByText('Edit Address')).toBeInTheDocument()
    expect(screen.getByTestId('input-label')).toHaveValue('Home')
    expect(screen.getByTestId('input-city')).toHaveValue('Bengaluru')
  })

  it('updates address after editing and submitting', async () => {
    const user = userEvent.setup()
    render(<AddressBook initialAddresses={[ADDR_HOME]} />)

    await user.click(screen.getByTestId('edit-address-addr_01'))
    await user.clear(screen.getByTestId('input-city'))
    await user.type(screen.getByTestId('input-city'), 'Chennai')
    await user.click(screen.getByTestId('address-form-submit'))

    expect(screen.queryByTestId('address-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('address-card-addr_01')).toHaveTextContent('Chennai')
  })
})
