import { getCustomerAddresses } from '@/lib/account'
import { AddressBook } from '@/components/account/AddressBook'
import type { MockSavedAddress } from '@/lib/account.mock'

export const metadata = {
  title: 'Address Book — Treasure Trove',
}

export default async function AddressesPage() {
  const raw = await getCustomerAddresses()

  const addresses: MockSavedAddress[] = raw.map((addr) => ({
    id: addr.id,
    label: addr.label,
    fullName: [addr.firstName, addr.lastName].filter(Boolean).join(' '),
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    pin: addr.pin,
    country: addr.countryCode === 'in' ? 'India' : addr.countryCode.toUpperCase(),
    isDefault: addr.isDefault,
  }))

  return (
    <div data-testid="addresses-page">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
          My Account
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-tt-ink)]">Address Book</h1>
        <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1">
          Manage your saved delivery addresses.
        </p>
      </div>
      <AddressBook initialAddresses={addresses} />
    </div>
  )
}
