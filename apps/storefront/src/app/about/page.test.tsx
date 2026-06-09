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

import AboutPage from './page'

describe('AboutPage', () => {
  it('renders the page container', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-page')).toBeInTheDocument()
  })

  it('renders the hero section with the main heading', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-hero')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /about treasure trove/i })).toBeInTheDocument()
  })

  it('renders the breadcrumb navigation', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
  })

  it('renders three content sections', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-section-0')).toBeInTheDocument()
    expect(screen.getByTestId('about-section-1')).toBeInTheDocument()
    expect(screen.getByTestId('about-section-2')).toBeInTheDocument()
  })

  it('renders each content section with its correct title', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-section-title-0')).toHaveTextContent(
      'Curated, not mass produced.',
    )
    expect(screen.getByTestId('about-section-title-1')).toHaveTextContent(
      'Made in India, for homes everywhere.',
    )
    expect(screen.getByTestId('about-section-title-2')).toHaveTextContent('A Bangalore boutique.')
  })

  it('renders the stats strip', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-stats')).toBeInTheDocument()
  })

  it('renders all four stat values and labels', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-stat-value-0')).toHaveTextContent('8')
    expect(screen.getByTestId('about-stat-label-0')).toHaveTextContent('Categories')
    expect(screen.getByTestId('about-stat-value-1')).toHaveTextContent('16')
    expect(screen.getByTestId('about-stat-label-1')).toHaveTextContent('Sub-Collections')
    expect(screen.getByTestId('about-stat-value-2')).toHaveTextContent('Pan India')
    expect(screen.getByTestId('about-stat-label-2')).toHaveTextContent('Shipping')
    expect(screen.getByTestId('about-stat-value-3')).toHaveTextContent('7-Day')
    expect(screen.getByTestId('about-stat-label-3')).toHaveTextContent('Returns')
  })

  it('renders the newsletter section with an email input and subscribe button', () => {
    render(<AboutPage />)
    expect(screen.getByTestId('about-newsletter')).toBeInTheDocument()
    expect(screen.getByTestId('about-newsletter-input')).toBeInTheDocument()
    expect(screen.getByTestId('about-newsletter-submit')).toHaveTextContent('Subscribe')
  })
})
