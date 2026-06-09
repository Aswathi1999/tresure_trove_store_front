import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCartStore } from '@/stores/cart'

vi.mock('@/stores/cart', () => ({
  useCartStore: vi.fn(),
}))

import { AddToCartButton } from './AddToCartButton'

const baseProps = {
  variantId: 'var_01',
  quantity: 1,
  outOfStock: false,
  productTitle: 'Ōkura Lounge Chair',
  price: 50000,
  imageUrl: 'https://cdn.example.com/chair.jpg',
}

describe('AddToCartButton', () => {
  const mockAddItemLocal = vi.fn()
  const mockOpenCart = vi.fn()
  const mockAddItem = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCartStore).mockReturnValue({
      isLoading: false,
      addItem: mockAddItem,
      openCart: mockOpenCart,
      addItemLocal: mockAddItemLocal,
    } as unknown as ReturnType<typeof useCartStore>)
  })

  it('renders the add-to-cart button when in stock', () => {
    render(<AddToCartButton {...baseProps} />)
    expect(screen.getByTestId('add-to-cart-button')).toBeInTheDocument()
  })

  it('renders the unavailable element when out of stock', () => {
    render(<AddToCartButton {...baseProps} outOfStock={true} />)
    expect(screen.getByTestId('add-to-cart-disabled')).toBeInTheDocument()
  })

  it('does not render the button when out of stock', () => {
    render(<AddToCartButton {...baseProps} outOfStock={true} />)
    expect(screen.queryByTestId('add-to-cart-button')).not.toBeInTheDocument()
  })

  it('shows "Currently Unavailable" when out of stock', () => {
    render(<AddToCartButton {...baseProps} outOfStock={true} />)
    expect(screen.getByText(/currently unavailable/i)).toBeInTheDocument()
  })

  it('shows "Add to Cart" label when in stock', () => {
    render(<AddToCartButton {...baseProps} />)
    expect(screen.getByText(/add to cart/i)).toBeInTheDocument()
  })

  it('button is disabled when the cart is loading', () => {
    vi.mocked(useCartStore).mockReturnValue({
      isLoading: true,
      addItem: mockAddItem,
      openCart: mockOpenCart,
      addItemLocal: mockAddItemLocal,
    } as unknown as ReturnType<typeof useCartStore>)

    render(<AddToCartButton {...baseProps} />)
    expect(screen.getByTestId('add-to-cart-button')).toBeDisabled()
  })

  it('shows the loading spinner when the cart is loading', () => {
    vi.mocked(useCartStore).mockReturnValue({
      isLoading: true,
      addItem: mockAddItem,
      openCart: mockOpenCart,
      addItemLocal: mockAddItemLocal,
    } as unknown as ReturnType<typeof useCartStore>)

    render(<AddToCartButton {...baseProps} />)
    expect(screen.getByTestId('cart-loading-spinner')).toBeInTheDocument()
  })

  it('calls addItemLocal and openCart when the button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton {...baseProps} />)
    await user.click(screen.getByTestId('add-to-cart-button'))
    expect(mockAddItemLocal).toHaveBeenCalledOnce()
    expect(mockOpenCart).toHaveBeenCalledOnce()
  })

  it('passes the correct product details to addItemLocal', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton {...baseProps} quantity={2} />)
    await user.click(screen.getByTestId('add-to-cart-button'))
    expect(mockAddItemLocal).toHaveBeenCalledWith(
      expect.objectContaining({
        variantId: 'var_01',
        title: 'Ōkura Lounge Chair',
        unitPrice: 50000,
        quantity: 2,
        imageUrl: 'https://cdn.example.com/chair.jpg',
      }),
    )
  })

  it('does not call addItemLocal when out of stock', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton {...baseProps} outOfStock={true} />)
    // The button is replaced by the disabled div — no clickable add-to-cart-button exists
    expect(screen.queryByTestId('add-to-cart-button')).not.toBeInTheDocument()
    expect(mockAddItemLocal).not.toHaveBeenCalled()
  })
})
