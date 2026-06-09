import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthHeader } from './AuthHeader'

describe('AuthHeader', () => {
  it('renders eyebrow and title', () => {
    render(<AuthHeader eyebrow="Welcome" title="Sign In" />)
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <AuthHeader
        eyebrow="Welcome"
        title="Sign In"
        description="Access your account to continue."
      />,
    )
    expect(screen.getByText('Access your account to continue.')).toBeInTheDocument()
  })

  it('does not render description element when omitted', () => {
    const { container } = render(<AuthHeader eyebrow="Welcome" title="Sign In" />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })
})
