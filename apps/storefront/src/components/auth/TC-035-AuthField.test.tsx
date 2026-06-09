import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthField } from './AuthField'

describe('AuthField', () => {
  it('renders label and input', () => {
    render(<AuthField label="Email" name="email" testId="email-input" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
  })

  it('associates label with input via id/htmlFor', () => {
    render(<AuthField label="Email" name="email" testId="email-input" />)
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('renders hint when no error is present', () => {
    render(<AuthField label="Password" name="password" testId="pwd" hint="Min 8 chars." />)
    expect(screen.getByText('Min 8 chars.')).toBeInTheDocument()
  })

  it('renders error message and sets aria-invalid=true when error is present', () => {
    render(
      <AuthField
        label="Email"
        name="email"
        testId="email-input"
        hint="hint text"
        error="Email is required."
      />,
    )
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('email-input-error')).toBeInTheDocument()
    expect(screen.queryByText('hint text')).not.toBeInTheDocument()
  })

  it('sets aria-invalid=false when no error is present', () => {
    render(<AuthField label="Email" name="email" testId="email-input" />)
    expect(screen.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'false')
  })

  it('passes through native input attributes such as type, placeholder, autoComplete', () => {
    render(
      <AuthField
        label="Email"
        name="email"
        testId="email-input"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
      />,
    )
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })
})
