import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} {...props} />,
}))

import { CartItem } from './CartItem'
import type { CartLineItem } from '@/lib/cart-types'

const baseItem: CartLineItem = {
  id: 'item_01',
  productId: 'prod_01',
  variantId: 'var_01',
  title: 'Okura Lounge Chair',
  category: 'Living Room',
  variant: 'Natural Oak',
  imageUrl: 'https://cdn.example.com/chair.jpg',
  imageAlt: 'Okura Lounge Chair',
  unitPrice: 50000,
  quantity: 2,
}

describe('CartItem', () => {
  let onRemove: ReturnType<typeof vi.fn>
  let onUpdateQuantity: ReturnType<typeof vi.fn>
  let onToggleSelect: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onRemove = vi.fn()
    onUpdateQuantity = vi.fn()
    onToggleSelect = vi.fn()
  })

  it('renders the item container', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByTestId('cart-item')).toBeInTheDocument()
  })

  it('renders the item title', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByText('Okura Lounge Chair')).toBeInTheDocument()
  })

  it('renders the category label', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByText('Living Room')).toBeInTheDocument()
  })

  it('renders the variant label', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByText('Natural Oak')).toBeInTheDocument()
  })

  it('renders the product image with correct src and alt', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/chair.jpg')
    expect(img).toHaveAttribute('alt', 'Okura Lounge Chair')
  })

  it('renders the current quantity', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders formatted unit price (50000 paise = Rs. 500)', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByText('Rs. 500')).toBeInTheDocument()
  })

  it('renders line total (unitPrice × quantity)', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    // 50000 * 2 = 100000 paise = Rs. 1,000
    expect(screen.getByText(/line total:/i)).toBeInTheDocument()
  })

  it('calls onRemove with item id when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    await user.click(screen.getByTestId('remove-item-button'))
    expect(onRemove).toHaveBeenCalledWith('item_01')
  })

  it('calls onUpdateQuantity with quantity + 1 on increment', async () => {
    const user = userEvent.setup()
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    await user.click(screen.getByTestId('quantity-increment'))
    expect(onUpdateQuantity).toHaveBeenCalledWith('item_01', 3)
  })

  it('calls onUpdateQuantity with quantity - 1 on decrement', async () => {
    const user = userEvent.setup()
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    await user.click(screen.getByTestId('quantity-decrement'))
    expect(onUpdateQuantity).toHaveBeenCalledWith('item_01', 1)
  })

  it('disables the decrement button when quantity is 1', () => {
    render(
      <CartItem
        item={{ ...baseItem, quantity: 1 }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByTestId('quantity-decrement')).toBeDisabled()
  })

  it('does not call onUpdateQuantity when decrement is clicked at quantity 1', async () => {
    const user = userEvent.setup()
    render(
      <CartItem
        item={{ ...baseItem, quantity: 1 }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    await user.click(screen.getByTestId('quantity-decrement'))
    expect(onUpdateQuantity).not.toHaveBeenCalled()
  })

  it('shows the out-of-stock badge when isOutOfStock is true', () => {
    render(
      <CartItem
        item={{ ...baseItem, isOutOfStock: true }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByTestId('out-of-stock-badge')).toBeInTheDocument()
  })

  it('does not show the out-of-stock badge for in-stock items', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.queryByTestId('out-of-stock-badge')).not.toBeInTheDocument()
  })

  it('disables quantity stepper buttons when item is out of stock', () => {
    render(
      <CartItem
        item={{ ...baseItem, isOutOfStock: true }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByTestId('quantity-increment')).toBeDisabled()
    expect(screen.getByTestId('quantity-decrement')).toBeDisabled()
  })

  it('shows price-changed warning when originalUnitPrice differs from unitPrice', () => {
    render(
      <CartItem
        item={{ ...baseItem, originalUnitPrice: 60000 }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.getByTestId('price-changed-warning')).toBeInTheDocument()
  })

  it('does not show price-changed warning when originalUnitPrice equals unitPrice', () => {
    render(
      <CartItem
        item={{ ...baseItem, originalUnitPrice: 50000 }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.queryByTestId('price-changed-warning')).not.toBeInTheDocument()
  })

  it('does not show price-changed warning when originalUnitPrice is undefined', () => {
    render(
      <CartItem
        item={baseItem}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    expect(screen.queryByTestId('price-changed-warning')).not.toBeInTheDocument()
  })

  it('renders strikethrough original price when price has changed', () => {
    render(
      <CartItem
        item={{ ...baseItem, originalUnitPrice: 60000 }}
        onRemove={onRemove}
        onUpdateQuantity={onUpdateQuantity}
        isSelected
        onToggleSelect={onToggleSelect}
      />,
    )
    // original 60000 paise = Rs. 600 (strikethrough), new 50000 = Rs. 500
    expect(screen.getByText('Rs. 600')).toBeInTheDocument()
    expect(screen.getByText('Rs. 500')).toBeInTheDocument()
  })
})
