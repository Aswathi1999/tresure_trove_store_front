import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/actions/account', () => ({
  updateProfile: vi.fn().mockResolvedValue({ ok: true }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { ProfileForm } from './ProfileForm'
import type { MockProfile } from '@/lib/account.mock'

const PROFILE: MockProfile = {
  firstName: 'Arjun',
  lastName: 'Mehra',
  email: 'arjun.mehra@example.com',
  phone: '+91 98765 43210',
}

describe('ProfileForm', () => {
  it('renders read-only profile data', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByTestId('profile-first-name')).toHaveTextContent('Arjun')
    expect(screen.getByTestId('profile-last-name')).toHaveTextContent('Mehra')
    expect(screen.getByTestId('profile-email')).toHaveTextContent('arjun.mehra@example.com')
    expect(screen.getByTestId('profile-phone')).toHaveTextContent('+91 98765 43210')
  })

  it('shows edit form when Edit Profile button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    expect(screen.queryByTestId('edit-profile-form')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('edit-profile-button'))
    expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument()
  })

  it('pre-fills edit form with current profile values', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))

    expect(screen.getByTestId('input-first-name')).toHaveValue('Arjun')
    expect(screen.getByTestId('input-last-name')).toHaveValue('Mehra')
    expect(screen.getByTestId('input-phone')).toHaveValue('+91 98765 43210')
  })

  it('email field is disabled in edit mode', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))

    expect(screen.getByTestId('input-email-disabled')).toBeDisabled()
    expect(screen.getByTestId('input-email-disabled')).toHaveValue(PROFILE.email)
  })

  it('shows validation errors when submitting with empty required fields', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))
    await user.clear(screen.getByTestId('input-first-name'))
    await user.clear(screen.getByTestId('input-last-name'))
    await user.click(screen.getByTestId('profile-save-button'))

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
  })

  it('cancels edit and hides the form', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))
    expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument()

    await user.click(screen.getByTestId('profile-cancel-button'))
    expect(screen.queryByTestId('edit-profile-form')).not.toBeInTheDocument()
  })

  it('cancel after typing restores original values in the read-only view', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))
    await user.clear(screen.getByTestId('input-first-name'))
    await user.type(screen.getByTestId('input-first-name'), 'Temporary')
    await user.click(screen.getByTestId('profile-cancel-button'))

    expect(screen.getByTestId('profile-first-name')).toHaveTextContent('Arjun')
  })

  it('saves changes and hides the edit form', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))
    await user.clear(screen.getByTestId('input-first-name'))
    await user.type(screen.getByTestId('input-first-name'), 'Rajan')
    await user.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => expect(screen.queryByTestId('edit-profile-form')).not.toBeInTheDocument(), {
      timeout: 3000,
    })
  })

  it('updates the displayed profile data after saving', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))
    await user.clear(screen.getByTestId('input-last-name'))
    await user.type(screen.getByTestId('input-last-name'), 'Kapoor')
    await user.click(screen.getByTestId('profile-save-button'))

    await waitFor(
      () => expect(screen.getByTestId('profile-last-name')).toHaveTextContent('Kapoor'),
      { timeout: 3000 },
    )
  })

  it('shows a save success indicator after saving', async () => {
    const user = userEvent.setup()
    render(<ProfileForm profile={PROFILE} />)

    await user.click(screen.getByTestId('edit-profile-button'))
    await user.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => expect(screen.getByTestId('profile-save-success')).toBeInTheDocument(), {
      timeout: 3000,
    })
  })
})
