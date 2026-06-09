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

import { CategoryHero } from './CategoryHero'

describe('CategoryHero', () => {
  it('renders the title as an h1 heading', () => {
    render(<CategoryHero title="Lighting" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Lighting' })).toBeInTheDocument()
  })

  it('renders the subtitle when provided', () => {
    render(<CategoryHero title="Lighting" subtitle="Illuminate your space" />)
    expect(screen.getByText('Illuminate your space')).toBeInTheDocument()
  })

  it('does not render a subtitle when not provided', () => {
    render(<CategoryHero title="Lighting" />)
    expect(screen.queryByText('Illuminate your space')).not.toBeInTheDocument()
  })

  it('renders the image with src and alt when imageUrl is provided', () => {
    render(<CategoryHero title="Decor" imageUrl="https://cdn.example.com/decor.jpg" />)
    const img = screen.getByAltText('Decor')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/decor.jpg')
  })

  it('does not render an image when imageUrl is not provided', () => {
    render(<CategoryHero title="Decor" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a section element as the root', () => {
    const { container } = render(<CategoryHero title="Furniture" />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('renders with both subtitle and image together', () => {
    render(
      <CategoryHero
        title="Marble"
        subtitle="Natural stone collection"
        imageUrl="https://cdn.example.com/marble.jpg"
      />,
    )
    expect(screen.getByRole('heading', { name: 'Marble' })).toBeInTheDocument()
    expect(screen.getByText('Natural stone collection')).toBeInTheDocument()
    expect(screen.getByAltText('Marble')).toHaveAttribute(
      'src',
      'https://cdn.example.com/marble.jpg',
    )
  })
})
