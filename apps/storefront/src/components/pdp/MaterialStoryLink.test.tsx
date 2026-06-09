import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

import { MaterialStoryLink } from './MaterialStoryLink'

const baseStory = {
  title: 'The Art of Indian Teak',
  excerpt: 'Discover how centuries-old teak forests shape our finest furniture.',
  href: '/material-stories/indian-teak',
}

describe('MaterialStoryLink', () => {
  it('renders nothing when story is null', () => {
    const { container } = render(<MaterialStoryLink story={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the container when a story is provided', () => {
    render(<MaterialStoryLink story={baseStory} />)
    expect(screen.getByTestId('material-story-link')).toBeInTheDocument()
  })

  it('renders the story title', () => {
    render(<MaterialStoryLink story={baseStory} />)
    expect(screen.getByText('The Art of Indian Teak')).toBeInTheDocument()
  })

  it('renders the story excerpt', () => {
    render(<MaterialStoryLink story={baseStory} />)
    expect(
      screen.getByText('Discover how centuries-old teak forests shape our finest furniture.'),
    ).toBeInTheDocument()
  })

  it('renders a link pointing to the story href', () => {
    render(<MaterialStoryLink story={baseStory} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/material-stories/indian-teak')
  })

  it('renders the "Material Story" label', () => {
    render(<MaterialStoryLink story={baseStory} />)
    expect(screen.getByText(/material story/i)).toBeInTheDocument()
  })
})
