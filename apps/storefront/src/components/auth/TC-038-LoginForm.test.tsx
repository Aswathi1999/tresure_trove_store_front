import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const loginMock = vi.fn()
vi.mock('@/lib/auth/actions', () => ({
  login: (...args: unknown[]) => loginMock(...args),
}))

import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockReset()
    loginMock.mockReset()
  })

  it('renders email and password fields and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit-button')).toHaveTextContent(/sign in/i)
  })

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByTestId('login-submit-button'))

    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('shows an email format error for an invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByTestId('login-email-input'), 'not-an-email')
    await user.type(screen.getByTestId('login-password-input'), 'password123')
    await user.click(screen.getByTestId('login-submit-button'))

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('navigates to /account on successful login', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValueOnce({ ok: true, user: { id: '', name: '', email: 'a@b.com' } })
    render(<LoginForm />)

    await user.type(screen.getByTestId('login-email-input'), 'a@b.com')
    await user.type(screen.getByTestId('login-password-input'), 'secret123')
    await user.click(screen.getByTestId('login-submit-button'))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('a@b.com', 'secret123')
      expect(pushMock).toHaveBeenCalledWith('/account')
    })
  })

  it('shows a credential error alert on INVALID_CREDENTIALS', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValueOnce({
      ok: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    })
    render(<LoginForm />)

    await user.type(screen.getByTestId('login-email-input'), 'a@b.com')
    await user.type(screen.getByTestId('login-password-input'), 'wrong')
    await user.click(screen.getByTestId('login-submit-button'))

    const alert = await screen.findByTestId('login-credential-error')
    expect(alert).toHaveTextContent('Invalid email or password.')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('shows the locked screen with a countdown when ACCOUNT_LOCKED is returned', async () => {
    const user = userEvent.setup()
    const lockUntil = Date.now() + 60_000
    loginMock.mockResolvedValueOnce({
      ok: false,
      code: 'ACCOUNT_LOCKED',
      message: 'locked',
      lockUntil,
    })
    render(<LoginForm />)

    await user.type(screen.getByTestId('login-email-input'), 'a@b.com')
    await user.type(screen.getByTestId('login-password-input'), 'whatever')
    await user.click(screen.getByTestId('login-submit-button'))

    expect(await screen.findByTestId('account-locked-screen')).toBeInTheDocument()
    expect(screen.getByTestId('lock-countdown')).toBeInTheDocument()
    expect(screen.getByTestId('locked-forgot-link')).toHaveAttribute('href', '/forgot-password')
  })

  it('disables the submit button and shows "Signing In" while submitting', async () => {
    const user = userEvent.setup()
    let resolveLogin: (value: unknown) => void = () => {}
    loginMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )
    render(<LoginForm />)

    await user.type(screen.getByTestId('login-email-input'), 'a@b.com')
    await user.type(screen.getByTestId('login-password-input'), 'secret123')
    await user.click(screen.getByTestId('login-submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('login-submit-button')).toHaveTextContent(/signing in/i)
      expect(screen.getByTestId('login-submit-button')).toBeDisabled()
    })

    await act(async () => {
      resolveLogin({ ok: true, user: { id: '', name: '', email: 'a@b.com' } })
    })
  })

  it('renders links to forgot-password and register pages', () => {
    render(<LoginForm />)
    expect(screen.getByTestId('login-forgot-link')).toHaveAttribute('href', '/forgot-password')
    expect(screen.getByTestId('login-register-link')).toHaveAttribute('href', '/register')
  })
})
