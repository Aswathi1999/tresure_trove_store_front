import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { BrandPhilosophy } from './BrandPhilosophy'
import type { BrandPhilosophyContent } from '@/lib/payload'

const content: BrandPhilosophyContent = {
  eyebrow: 'Our Story',
  headline: 'Crafted to Last Generations',
  body: 'We believe furniture should be an heirloom, not a throwaway.',
  ctaText: 'Discover Our Craft',
  ctaHref: '/about',
  imageUrl: 'https://cdn.example.com/philosophy.jpg',
}

describe('BrandPhilosophy', () => {
  it('renders nothing when content is null', () => {
    const { container } = render(<BrandPhilosophy content={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the Brand Philosophy section when content is provided', () => {
    render(<BrandPhilosophy content={content} />)
    expect(screen.getByRole('region', { name: /brand philosophy/i })).toBeInTheDocument()
  })

  it('renders the eyebrow text', () => {
    render(<BrandPhilosophy content={content} />)
    expect(screen.getByText('Our Story')).toBeInTheDocument()
  })

  it('renders the headline', () => {
    render(<BrandPhilosophy content={content} />)
    expect(screen.getByRole('heading', { name: 'Crafted to Last Generations' })).toBeInTheDocument()
  })

  it('renders the body text', () => {
    render(<BrandPhilosophy content={content} />)
    expect(
      screen.getByText('We believe furniture should be an heirloom, not a throwaway.'),
    ).toBeInTheDocument()
  })

  it('renders the CTA button with correct text', () => {
    render(<BrandPhilosophy content={content} />)
    const cta = screen.getByTestId('brand-philosophy-cta')
    expect(cta).toHaveTextContent('Discover Our Craft')
  })

  it('renders the CTA button pointing to the correct href', () => {
    render(<BrandPhilosophy content={content} />)
    const cta = screen.getByTestId('brand-philosophy-cta')
    expect(cta).toHaveAttribute('href', '/about')
  })

  it('renders the philosophy image with correct src and alt', () => {
    render(<BrandPhilosophy content={content} />)
    const img = screen.getByAltText('Crafted to Last Generations')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/philosophy.jpg')
  })
})
