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

vi.mock('@/components/layout/SectionReveal', () => ({
  SectionReveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/Breadcrumb', () => ({
  Breadcrumb: () => <nav data-testid="breadcrumb" aria-label="Breadcrumb" />,
}))

import CraftsmanshipPage from './page'

describe('CraftsmanshipPage', () => {
  it('renders the page container', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByTestId('craftsmanship-page')).toBeInTheDocument()
  })

  it('renders the hero section with the main heading', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByTestId('craftsmanship-hero')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /from forest to heirloom/i })).toBeInTheDocument()
  })

  it('renders the breadcrumb navigation', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
  })

  it('renders all four craft steps', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByTestId('craftsmanship-step-0')).toBeInTheDocument()
    expect(screen.getByTestId('craftsmanship-step-1')).toBeInTheDocument()
    expect(screen.getByTestId('craftsmanship-step-2')).toBeInTheDocument()
    expect(screen.getByTestId('craftsmanship-step-3')).toBeInTheDocument()
  })

  it('renders each step title in order', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByText('Design & Conception')).toBeInTheDocument()
    expect(screen.getByText('Material Selection & Seasoning')).toBeInTheDocument()
    expect(screen.getByText('Master Craftsmen at Work')).toBeInTheDocument()
    expect(screen.getByText('Finishing & Quality')).toBeInTheDocument()
  })

  it('renders the closing CTA section', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByTestId('craftsmanship-cta')).toBeInTheDocument()
  })

  it('renders the materials CTA link pointing to /materials', () => {
    render(<CraftsmanshipPage />)
    expect(screen.getByTestId('craftsmanship-materials-link')).toHaveAttribute('href', '/materials')
  })
})
