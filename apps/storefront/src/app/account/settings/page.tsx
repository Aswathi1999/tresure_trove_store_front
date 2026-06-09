import { getCustomer } from '@/lib/account'
import { ProfileForm } from '@/components/account/ProfileForm'
import type { MockProfile } from '@/lib/account.mock'

export const metadata = {
  title: 'Profile Settings — Treasure Trove',
}

export default async function SettingsPage() {
  const customer = await getCustomer()

  const profile: MockProfile = {
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
  }

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
          My Account
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-tt-ink)]">Profile Settings</h1>
        <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1">
          Manage your personal details.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}
