import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarqueeBar } from './MarqueeBar'

const items = ['Free shipping over ₹10,000', 'Handcrafted in India', 'Easy 30-day returns']

describe('MarqueeBar', () => {
  it('renders the marquee container', () => {
    render(<MarqueeBar items={items} />)
    expect(screen.getByTestId('marquee-container')).toBeInTheDocument()
  })

  it('renders all items in the text', () => {
    render(<MarqueeBar items={items} />)
    expect(screen.getByTestId('marquee-container')).toBeInTheDocument()
    const container = screen.getByTestId('marquee-container')
    for (const item of items) {
      expect(container.textContent).toContain(item)
    }
  })

  it('joins items with the separator · ', () => {
    render(<MarqueeBar items={['A', 'B', 'C']} />)
    const container = screen.getByTestId('marquee-container')
    expect(container.textContent).toContain('A · B · C')
  })

  it('renders text twice for the seamless loop', () => {
    render(<MarqueeBar items={['Loop me']} />)
    const container = screen.getByTestId('marquee-container')
    const text = container.textContent ?? ''
    const occurrences = text.split('Loop me').length - 1
    expect(occurrences).toBeGreaterThanOrEqual(2)
  })

  it('renders with an empty items array without crashing', () => {
    render(<MarqueeBar items={[]} />)
    expect(screen.getByTestId('marquee-container')).toBeInTheDocument()
  })

  it('renders a single item', () => {
    render(<MarqueeBar items={['Only one']} />)
    const container = screen.getByTestId('marquee-container')
    expect(container.textContent).toContain('Only one')
  })

  it('injects the marquee keyframe style tag', () => {
    const { container } = render(<MarqueeBar items={items} />)
    const style = container.querySelector('style')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('marquee')
  })
})
