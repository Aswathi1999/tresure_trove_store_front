import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
let tokenParam: string | null = 'valid-token'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? tokenParam : null),
  }),
}))

const validateResetTokenMock = vi.fn()
const resetPasswordMock = vi.fn()
vi.mock('@/lib/auth/actions', () => ({
  validateResetToken: (...args: unknown[]) => validateResetTokenMock(...args),
  resetPassword: (...args: unknown[]) => resetPasswordMock(...args),
}))

import { ResetPasswordForm } from './ResetPasswordForm'

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    pushMock.mockReset()
    validateResetTokenMock.mockReset()
    resetPasswordMock.mockReset()
    tokenParam = 'valid-token'
  })

  it('shows the validating spinner initially', () => {
    validateResetTokenMock.mockReturnValueOnce(new Promise(() => {}))
    render(<ResetPasswordForm />)
    expect(screen.getByTestId('reset-password-validating')).toBeInTheDocument()
  })

  it('shows the invalid state when no token is in the URL', async () => {
    tokenParam = null
    render(<ResetPasswordForm />)
    expect(await screen.findByTestId('reset-password-invalid')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-request-new-link')).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })

  it('shows the invalid state when validateResetToken returns TOKEN_INVALID', async () => {
    validateResetTokenMock.mockResolvedValueOnce({
      ok: false,
      code: 'TOKEN_INVALID',
      message: 'Invalid reset link.',
    })
    render(<ResetPasswordForm />)
    expect(await screen.findByTestId('reset-password-invalid')).toBeInTheDocument()
  })

  it('shows the expired state when validateResetToken returns TOKEN_EXPIRED', async () => {
    validateResetTokenMock.mockResolvedValueOnce({
      ok: false,
      code: 'TOKEN_EXPIRED',
      message: 'Reset link has expired.',
    })
    render(<ResetPasswordForm />)
    expect(await screen.findByTestId('reset-password-expired')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-request-new-link')).toHaveAttribute(
      'href',
      '/forgot-password',
    )
    expect(screen.getByTestId('reset-password-back-to-login')).toHaveAttribute('href', '/login')
  })

  it('shows the form when the token is valid', async () => {
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    render(<ResetPasswordForm />)
    expect(await screen.findByTestId('reset-password-form')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('reset-confirm-password-input')).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty passwords', async () => {
    const user = userEvent.setup()
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    render(<ResetPasswordForm />)

    await screen.findByTestId('reset-password-form')
    await user.click(screen.getByTestId('reset-password-submit-button'))

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument()
    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup()
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    render(<ResetPasswordForm />)

    await screen.findByTestId('reset-password-form')
    await user.type(screen.getByTestId('reset-password-input'), 'password123')
    await user.type(screen.getByTestId('reset-confirm-password-input'), 'password999')
    await user.click(screen.getByTestId('reset-password-submit-button'))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('shows the success state after a successful reset', async () => {
    const user = userEvent.setup()
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    resetPasswordMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    render(<ResetPasswordForm />)

    await screen.findByTestId('reset-password-form')
    await user.type(screen.getByTestId('reset-password-input'), 'newpassword123')
    await user.type(screen.getByTestId('reset-confirm-password-input'), 'newpassword123')
    await user.click(screen.getByTestId('reset-password-submit-button'))

    expect(await screen.findByTestId('reset-password-success')).toBeInTheDocument()
    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith('valid-token', 'newpassword123')
    })
  })

  it('routes to /login when the success CTA is clicked', async () => {
    const user = userEvent.setup()
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    resetPasswordMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    render(<ResetPasswordForm />)

    await screen.findByTestId('reset-password-form')
    await user.type(screen.getByTestId('reset-password-input'), 'newpassword123')
    await user.type(screen.getByTestId('reset-confirm-password-input'), 'newpassword123')
    await user.click(screen.getByTestId('reset-password-submit-button'))

    const cta = await screen.findByTestId('reset-password-go-to-login')
    await user.click(cta)
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('transitions to expired state if resetPassword returns TOKEN_EXPIRED', async () => {
    const user = userEvent.setup()
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    resetPasswordMock.mockResolvedValueOnce({
      ok: false,
      code: 'TOKEN_EXPIRED',
      message: 'Reset link has expired.',
    })
    render(<ResetPasswordForm />)

    await screen.findByTestId('reset-password-form')
    await user.type(screen.getByTestId('reset-password-input'), 'newpassword123')
    await user.type(screen.getByTestId('reset-confirm-password-input'), 'newpassword123')
    await user.click(screen.getByTestId('reset-password-submit-button'))

    expect(await screen.findByTestId('reset-password-expired')).toBeInTheDocument()
  })

  it('transitions to invalid state if resetPassword returns TOKEN_INVALID', async () => {
    const user = userEvent.setup()
    validateResetTokenMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: '', email: '' },
    })
    resetPasswordMock.mockResolvedValueOnce({
      ok: false,
      code: 'TOKEN_INVALID',
      message: 'Invalid reset link.',
    })
    render(<ResetPasswordForm />)

    await screen.findByTestId('reset-password-form')
    await user.type(screen.getByTestId('reset-password-input'), 'newpassword123')
    await user.type(screen.getByTestId('reset-confirm-password-input'), 'newpassword123')
    await user.click(screen.getByTestId('reset-password-submit-button'))

    expect(await screen.findByTestId('reset-password-invalid')).toBeInTheDocument()
  })
})
