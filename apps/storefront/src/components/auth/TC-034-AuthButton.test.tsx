import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthButton } from './AuthButton'

describe('AuthButton', () => {
  it('renders its children', () => {
    render(<AuthButton>Sign In</AuthButton>)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('is disabled while loading', () => {
    render(<AuthButton loading>Signing In</AuthButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders a spinner when loading', () => {
    const { container } = render(<AuthButton loading>Signing In</AuthButton>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is set', () => {
    render(<AuthButton disabled>Sign In</AuthButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<AuthButton onClick={onClick}>Sign In</AuthButton>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <AuthButton loading onClick={onClick}>
        Signing In
      </AuthButton>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('respects the type prop (e.g., submit)', () => {
    render(<AuthButton type="submit">Submit</AuthButton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
