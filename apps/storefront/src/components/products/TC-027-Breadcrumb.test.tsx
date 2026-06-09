import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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

import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbItem } from './Breadcrumb'

const threeItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/collections' },
  { label: 'Lighting' },
]

describe('Breadcrumb', () => {
  it('renders a nav landmark with aria-label Breadcrumb', () => {
    render(<Breadcrumb items={threeItems} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('renders all item labels', () => {
    render(<Breadcrumb items={threeItems} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
    expect(screen.getByText('Lighting')).toBeInTheDocument()
  })

  it('renders items with href as anchor links', () => {
    render(<Breadcrumb items={threeItems} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Collections' })).toHaveAttribute(
      'href',
      '/collections',
    )
  })

  it('renders item without href as a plain span (not a link)', () => {
    render(<Breadcrumb items={threeItems} />)
    expect(screen.queryByRole('link', { name: 'Lighting' })).not.toBeInTheDocument()
    expect(screen.getByText('Lighting')).toBeInTheDocument()
  })

  it('renders exactly 2 links for a 3-item breadcrumb with one plain item', () => {
    render(<Breadcrumb items={threeItems} />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('renders a single item without any links when href is omitted', () => {
    render(<Breadcrumb items={[{ label: 'Products' }]} />)
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders a single linked item correctly', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('renders with an empty items array without crashing', () => {
    render(<Breadcrumb items={[]} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })
})
