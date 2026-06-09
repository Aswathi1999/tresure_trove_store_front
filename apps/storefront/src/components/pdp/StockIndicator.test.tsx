import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StockIndicator } from './StockIndicator'

describe('StockIndicator', () => {
  describe('out of stock (inventory = 0)', () => {
    it('renders the out-of-stock indicator', () => {
      render(<StockIndicator inventory={0} />)
      expect(screen.getByTestId('stock-indicator-out')).toBeInTheDocument()
    })

    it('shows "Out of Stock" text', () => {
      render(<StockIndicator inventory={0} />)
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    })

    it('does not render low-stock or in-stock indicators', () => {
      render(<StockIndicator inventory={0} />)
      expect(screen.queryByTestId('stock-indicator-low')).not.toBeInTheDocument()
      expect(screen.queryByTestId('stock-indicator-in')).not.toBeInTheDocument()
    })
  })

  describe('low stock (inventory 1–5)', () => {
    it('renders the low-stock indicator when inventory is 1', () => {
      render(<StockIndicator inventory={1} />)
      expect(screen.getByTestId('stock-indicator-low')).toBeInTheDocument()
    })

    it('renders the low-stock indicator when inventory is 5', () => {
      render(<StockIndicator inventory={5} />)
      expect(screen.getByTestId('stock-indicator-low')).toBeInTheDocument()
    })

    it('shows the exact remaining count in the message', () => {
      render(<StockIndicator inventory={3} />)
      expect(screen.getByText(/only 3 left/i)).toBeInTheDocument()
    })

    it('does not render out-of-stock or in-stock indicators', () => {
      render(<StockIndicator inventory={4} />)
      expect(screen.queryByTestId('stock-indicator-out')).not.toBeInTheDocument()
      expect(screen.queryByTestId('stock-indicator-in')).not.toBeInTheDocument()
    })
  })

  describe('in stock (inventory > 5)', () => {
    it('renders the in-stock indicator when inventory is 6', () => {
      render(<StockIndicator inventory={6} />)
      expect(screen.getByTestId('stock-indicator-in')).toBeInTheDocument()
    })

    it('renders the in-stock indicator when inventory is high', () => {
      render(<StockIndicator inventory={100} />)
      expect(screen.getByTestId('stock-indicator-in')).toBeInTheDocument()
    })

    it('shows "In Stock" text', () => {
      render(<StockIndicator inventory={20} />)
      expect(screen.getByText(/in stock/i)).toBeInTheDocument()
    })

    it('does not render out-of-stock or low-stock indicators', () => {
      render(<StockIndicator inventory={10} />)
      expect(screen.queryByTestId('stock-indicator-out')).not.toBeInTheDocument()
      expect(screen.queryByTestId('stock-indicator-low')).not.toBeInTheDocument()
    })
  })
})
