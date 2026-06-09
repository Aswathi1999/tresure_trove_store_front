interface StockIndicatorProps {
  inventory: number
}

export function StockIndicator({ inventory }: StockIndicatorProps) {
  if (inventory === 0) {
    return (
      <p
        className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-danger)]"
        data-testid="stock-indicator-out"
      >
        Out of Stock
      </p>
    )
  }

  if (inventory <= 5) {
    return (
      <p
        className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-orange)]"
        data-testid="stock-indicator-low"
      >
        Only {inventory} left
      </p>
    )
  }

  return (
    <p
      className="text-[11px] font-bold tracking-widest uppercase"
      style={{ color: 'var(--color-tt-brown)' }}
      data-testid="stock-indicator-in"
    >
      In Stock
    </p>
  )
}
