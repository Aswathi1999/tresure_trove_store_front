import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderStatusBadge } from './OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it('renders Processing badge with correct testid and text', () => {
    render(<OrderStatusBadge status="Processing" />)
    const badge = screen.getByTestId('status-badge-processing')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Processing')
  })

  it('renders Shipped badge with correct testid and text', () => {
    render(<OrderStatusBadge status="Shipped" />)
    const badge = screen.getByTestId('status-badge-shipped')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Shipped')
  })

  it('renders Delivered badge with correct testid and text', () => {
    render(<OrderStatusBadge status="Delivered" />)
    const badge = screen.getByTestId('status-badge-delivered')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Delivered')
  })

  it('renders Cancelled badge with correct testid and text', () => {
    render(<OrderStatusBadge status="Cancelled" />)
    const badge = screen.getByTestId('status-badge-cancelled')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Cancelled')
  })
})
