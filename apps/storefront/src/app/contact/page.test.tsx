import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    className,
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} className={className} />,
}))

vi.mock('@/components/contact/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form" />,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
    className?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import ContactPage from './page'

describe('ContactPage', () => {
  it('renders the page container', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-page')).toBeInTheDocument()
  })

  it('renders the page heading', () => {
    render(<ContactPage />)
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument()
  })

  it('renders the form section and the info section', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-form-section')).toBeInTheDocument()
    expect(screen.getByTestId('contact-info-section')).toBeInTheDocument()
  })

  it('renders the ContactForm component inside the form section', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
  })

  it('renders all four contact info cards', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-visit')).toBeInTheDocument()
    expect(screen.getByTestId('contact-call')).toBeInTheDocument()
    expect(screen.getByTestId('contact-email')).toBeInTheDocument()
    expect(screen.getByTestId('contact-chat')).toBeInTheDocument()
  })

  it('renders the map section with the flagship location card', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-map')).toBeInTheDocument()
    expect(screen.getByTestId('contact-map-card')).toBeInTheDocument()
  })
})
