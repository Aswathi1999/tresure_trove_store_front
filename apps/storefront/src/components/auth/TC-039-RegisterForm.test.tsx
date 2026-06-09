import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const registerMock = vi.fn()
vi.mock('@/lib/auth/actions', () => ({
  register: (...args: unknown[]) => registerMock(...args),
}))

import { RegisterForm } from './RegisterForm'

describe('RegisterForm', () => {
  beforeEach(() => {
    pushMock.mockReset()
    registerMock.mockReset()
  })

  it('renders all fields', () => {
    render(<RegisterForm />)
    expect(screen.getByTestId('register-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('register-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('register-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('register-confirm-password-input')).toBeInTheDocument()
  })

  it('shows validation errors for empty submission', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    await user.click(screen.getByTestId('register-submit-button'))

    expect(await screen.findByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByTestId('register-name-input'), 'Jane Doe')
    await user.type(screen.getByTestId('register-email-input'), 'jane@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-password-input'), 'password999')
    await user.click(screen.getByTestId('register-submit-button'))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('shows a password length error when password < 8 chars', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByTestId('register-name-input'), 'Jane')
    await user.type(screen.getByTestId('register-email-input'), 'jane@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'short')
    await user.type(screen.getByTestId('register-confirm-password-input'), 'short')
    await user.click(screen.getByTestId('register-submit-button'))

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('navigates to /account on successful registration', async () => {
    const user = userEvent.setup()
    registerMock.mockResolvedValueOnce({
      ok: true,
      user: { id: '', name: 'Jane Doe', email: 'jane@example.com' },
    })
    render(<RegisterForm />)

    await user.type(screen.getByTestId('register-name-input'), 'Jane Doe')
    await user.type(screen.getByTestId('register-email-input'), 'jane@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-password-input'), 'password123')
    await user.click(screen.getByTestId('register-submit-button'))

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      })
      expect(pushMock).toHaveBeenCalledWith('/account')
    })
  })

  it('shows the email-exists error and a link to /login when EMAIL_EXISTS is returned', async () => {
    const user = userEvent.setup()
    registerMock.mockResolvedValueOnce({
      ok: false,
      code: 'EMAIL_EXISTS',
      message: 'An account with this email already exists.',
    })
    render(<RegisterForm />)

    await user.type(screen.getByTestId('register-name-input'), 'Jane Doe')
    await user.type(screen.getByTestId('register-email-input'), 'jane@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-password-input'), 'password123')
    await user.click(screen.getByTestId('register-submit-button'))

    expect(await screen.findByTestId('register-email-exists-error')).toBeInTheDocument()
    expect(screen.getByTestId('register-goto-login-link')).toHaveAttribute('href', '/login')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('shows a generic error for other failures', async () => {
    const user = userEvent.setup()
    registerMock.mockResolvedValueOnce({
      ok: false,
      code: 'WEAK_PASSWORD',
      message: 'Password is too weak.',
    })
    render(<RegisterForm />)

    await user.type(screen.getByTestId('register-name-input'), 'Jane Doe')
    await user.type(screen.getByTestId('register-email-input'), 'jane@example.com')
    await user.type(screen.getByTestId('register-password-input'), 'password123')
    await user.type(screen.getByTestId('register-confirm-password-input'), 'password123')
    await user.click(screen.getByTestId('register-submit-button'))

    const err = await screen.findByTestId('register-generic-error')
    expect(err).toHaveTextContent('Password is too weak.')
  })

  it('renders a sign-in link', () => {
    render(<RegisterForm />)
    expect(screen.getByTestId('register-login-link')).toHaveAttribute('href', '/login')
  })
})
