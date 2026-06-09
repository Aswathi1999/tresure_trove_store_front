import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SustainabilityRating } from './SustainabilityRating'

describe('SustainabilityRating', () => {
  it('renders the container with correct testid', () => {
    render(<SustainabilityRating rating={3} />)
    expect(screen.getByTestId('sustainability-rating')).toBeInTheDocument()
  })

  it('renders exactly 5 leaf icons', () => {
    render(<SustainabilityRating rating={3} />)
    const container = screen.getByTestId('sustainability-rating')
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(5)
  })

  it('renders leaf icons with individual testids leaf-1 through leaf-5', () => {
    render(<SustainabilityRating rating={3} />)
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`leaf-${i}`)).toBeInTheDocument()
    }
  })

  it('does not render label when showLabel is omitted (default false)', () => {
    render(<SustainabilityRating rating={4} />)
    expect(screen.queryByText(/sustainability/i)).not.toBeInTheDocument()
  })

  it('renders label with correct text when showLabel is true', () => {
    render(<SustainabilityRating rating={4} showLabel />)
    expect(screen.getByText('4/5 Sustainability')).toBeInTheDocument()
  })

  it('renders correct label for rating 5', () => {
    render(<SustainabilityRating rating={5} showLabel />)
    expect(screen.getByText('5/5 Sustainability')).toBeInTheDocument()
  })

  it('renders correct label for rating 1', () => {
    render(<SustainabilityRating rating={1} showLabel />)
    expect(screen.getByText('1/5 Sustainability')).toBeInTheDocument()
  })

  it('renders correct label for rating 3', () => {
    render(<SustainabilityRating rating={3} showLabel />)
    expect(screen.getByText('3/5 Sustainability')).toBeInTheDocument()
  })
})
