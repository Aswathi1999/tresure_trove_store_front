import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _priority,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    priority?: boolean
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
    className?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/home/HeroCarousel', () => ({
  HeroCarousel: ({ size }: { size: string }) => <div data-testid={`hero-carousel-${size}`} />,
}))

import { HeroSection } from './HeroSection'
import type { HeroContent } from '@/lib/payload'

const fullContent: HeroContent = {
  headline: 'Timeless Furniture',
  subtext: 'Crafted for generations',
  ctaText: 'Shop Now',
  ctaHref: '/products',
  imageUrl: 'https://cdn.example.com/hero.jpg',
  editorPickTitle: 'Summer Lighting Edit',
  editorPickHref: '/collections/lighting',
}

describe('HeroSection', () => {
  it('renders a landmark section with label Hero', () => {
    render(<HeroSection content={null} />)
    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
  })

  it('renders the desktop carousel', () => {
    render(<HeroSection content={null} />)
    expect(screen.getByTestId('hero-carousel-desktop')).toBeInTheDocument()
  })

  it('renders the mobile carousel', () => {
    render(<HeroSection content={null} />)
    expect(screen.getByTestId('hero-carousel-mobile')).toBeInTheDocument()
  })

  it("shows default Editor's Pick title when content is null", () => {
    render(<HeroSection content={null} />)
    expect(screen.getByText("Editor's Pick")).toBeInTheDocument()
  })

  it("shows default Editor's Pick href when content is null", () => {
    render(<HeroSection content={null} />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toHaveAttribute('href', '/collections')
  })

  it('shows the editor pick title from content', () => {
    render(<HeroSection content={fullContent} />)
    expect(screen.getByText('Summer Lighting Edit')).toBeInTheDocument()
  })

  it('uses the editor pick href from content', () => {
    render(<HeroSection content={fullContent} />)
    const link = screen.getByRole('link', { name: /explore/i })
    expect(link).toHaveAttribute('href', '/collections/lighting')
  })

  it("renders the Editor's Pick badge label", () => {
    render(<HeroSection content={fullContent} />)
    expect(screen.getByText(/editor.s pick/i)).toBeInTheDocument()
  })

  it('renders the editor pick image', () => {
    render(<HeroSection content={fullContent} />)
    const img = screen.getByAltText("Editor's pick — lighting collection")
    expect(img).toBeInTheDocument()
  })
})
