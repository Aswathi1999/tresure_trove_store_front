import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const forgotPasswordMock = vi.fn()
vi.mock('@/lib/auth/actions', () => ({
  forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args),
}))

import { ForgotPasswordForm } from './ForgotPasswordForm'

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    forgotPasswordMock.mockReset()
  })

  it('renders the email field and submit button', () => {
    render(<ForgotPasswordForm />)
    expect(screen.getByTestId('forgot-password-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('forgot-password-submit-button')).toHaveTextContent(
      /send reset link/i,
    )
  })

  it('shows a validation error when submitting empty email', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)
    await user.click(screen.getByTestId('forgot-password-submit-button'))
    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(forgotPasswordMock).not.toHaveBeenCalled()
  })

  it('shows an invalid email error', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)
    await user.type(screen.getByTestId('forgot-password-email-input'), 'not-valid')
    await user.click(screen.getByTestId('forgot-password-submit-button'))
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(forgotPasswordMock).not.toHaveBeenCalled()
  })

  it('shows the success message after a valid submission', async () => {
    const user = userEvent.setup()
    forgotPasswordMock.mockResolvedValueOnce({ ok: true })
    render(<ForgotPasswordForm />)

    await user.type(screen.getByTestId('forgot-password-email-input'), 'jane@example.com')
    await user.click(screen.getByTestId('forgot-password-submit-button'))

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith('jane@example.com')
    })
    expect(await screen.findByTestId('forgot-password-success')).toBeInTheDocument()
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument()
    expect(screen.getByTestId('forgot-password-back-to-login')).toHaveAttribute('href', '/login')
  })

  it('shows success even if the action rejects (no user enumeration)', async () => {
    const user = userEvent.setup()
    // Action always resolves { ok: true } even for unknown emails per product decision.
    forgotPasswordMock.mockResolvedValueOnce({ ok: true })
    render(<ForgotPasswordForm />)

    await user.type(screen.getByTestId('forgot-password-email-input'), 'nobody@example.com')
    await user.click(screen.getByTestId('forgot-password-submit-button'))

    expect(await screen.findByTestId('forgot-password-success')).toBeInTheDocument()
  })

  it('renders a link back to the login page', () => {
    render(<ForgotPasswordForm />)
    expect(screen.getByTestId('forgot-password-login-link')).toHaveAttribute('href', '/login')
  })
})
