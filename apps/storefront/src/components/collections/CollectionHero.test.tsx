import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _p,
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

import { CollectionHero } from './CollectionHero'

describe('CollectionHero', () => {
  describe('structure', () => {
    it('renders the hero container', () => {
      render(<CollectionHero title="Living Room" subtitle="Where comfort meets craft" />)
      expect(screen.getByTestId('collection-hero')).toBeInTheDocument()
    })

    it('renders the title', () => {
      render(<CollectionHero title="Dining" subtitle="Gather around" />)
      expect(screen.getByTestId('collection-hero-title')).toHaveTextContent('Dining')
    })

    it('renders the subtitle', () => {
      render(<CollectionHero title="Dining" subtitle="Gather around" />)
      expect(screen.getByTestId('collection-hero-subtitle')).toHaveTextContent('Gather around')
    })

    it('title is an h1', () => {
      render(<CollectionHero title="Bedroom" subtitle="Rest well" />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bedroom')
    })
  })

  describe('image', () => {
    it('renders a next/image when imageUrl is provided', () => {
      render(
        <CollectionHero title="Outdoor" subtitle="Into the wild" imageUrl="/images/outdoor.jpg" />,
      )
      expect(screen.getByAltText('Outdoor')).toBeInTheDocument()
      expect(screen.getByAltText('Outdoor')).toHaveAttribute('src', '/images/outdoor.jpg')
    })

    it('does not render an img when imageUrl is omitted', () => {
      render(<CollectionHero title="Outdoor" subtitle="Into the wild" />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders the dark fallback background when imageUrl is not provided', () => {
      const { container } = render(<CollectionHero title="Test" subtitle="Sub" />)
      // Fallback is a div with bg-[var(--color-tt-ink)] inside the section
      const section = container.querySelector('[data-testid="collection-hero"]')
      expect(section?.querySelector('div.absolute.inset-0')).toBeInTheDocument()
    })
  })
})
