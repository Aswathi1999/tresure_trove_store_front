import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CartLineItem } from '@/lib/cart-types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { 'data-testid'?: string }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./CartItem', () => ({
  CartItem: ({ item }: { item: CartLineItem }) => <div data-testid="cart-item">{item.title}</div>,
}))

vi.mock('./CartSummary', () => ({
  CartSummary: () => <div data-testid="cart-summary" />,
}))

vi.mock('./EmptyCart', () => ({
  EmptyCart: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="empty-cart">
      <button onClick={onClose}>close empty</button>
    </div>
  ),
}))

vi.mock('@/stores/cart', () => ({
  useCartStore: vi.fn(),
}))

import { useCartStore } from '@/stores/cart'
import { CartDrawer } from './CartDrawer'

const initCartMock = vi.fn()
const closeCartMock = vi.fn()
const removeItemMock = vi.fn()
const updateQuantityMock = vi.fn()

const defaultState = {
  isOpen: false,
  isLoading: false,
  items: [] as CartLineItem[],
  initCart: initCartMock,
  closeCart: closeCartMock,
  removeItem: removeItemMock,
  updateQuantity: updateQuantityMock,
}

type StoreState = typeof defaultState

function mockStore(overrides: Partial<StoreState> = {}) {
  vi.mocked(useCartStore).mockReturnValue({
    ...defaultState,
    ...overrides,
  } as unknown as ReturnType<typeof useCartStore>)
}

describe('CartDrawer', () => {
  beforeEach(() => {
    initCartMock.mockReset()
    initCartMock.mockResolvedValue(undefined)
    closeCartMock.mockReset()
    removeItemMock.mockReset()
    updateQuantityMock.mockReset()
    mockStore()
  })

  it('renders nothing when isOpen is false', () => {
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-drawer')).not.toBeInTheDocument()
  })

  it('renders the drawer panel when isOpen is true', () => {
    mockStore({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-drawer')).toBeInTheDocument()
  })

  it('renders the backdrop when isOpen is true', () => {
    mockStore({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-backdrop')).toBeInTheDocument()
  })

  it('shows EmptyCart when isOpen and items is empty', () => {
    mockStore({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.getByTestId('empty-cart')).toBeInTheDocument()
  })

  it('shows cart items and summary when items exist', () => {
    const items: CartLineItem[] = [
      {
        id: 'item_01',
        productId: '',
        variantId: '',
        title: 'Test Chair',
        category: 'Furniture',
        variant: 'Oak',
        imageUrl: '',
        imageAlt: '',
        unitPrice: 50000,
        quantity: 1,
      },
    ]
    mockStore({ isOpen: true, items })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-item')).toBeInTheDocument()
    expect(screen.getByTestId('cart-summary')).toBeInTheDocument()
    expect(screen.queryByTestId('empty-cart')).not.toBeInTheDocument()
  })

  it('calls closeCart when the close button is clicked', async () => {
    const user = userEvent.setup()
    mockStore({ isOpen: true })
    render(<CartDrawer />)
    await user.click(screen.getByTestId('close-cart-button'))
    expect(closeCartMock).toHaveBeenCalledTimes(1)
  })

  it('calls closeCart when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    mockStore({ isOpen: true })
    render(<CartDrawer />)
    await user.click(screen.getByTestId('cart-backdrop'))
    expect(closeCartMock).toHaveBeenCalledTimes(1)
  })

  it('calls closeCart when Escape key is pressed', async () => {
    const user = userEvent.setup()
    mockStore({ isOpen: true })
    render(<CartDrawer />)
    await user.keyboard('{Escape}')
    expect(closeCartMock).toHaveBeenCalledTimes(1)
  })

  it('shows the loading spinner when isLoading is true', () => {
    mockStore({ isOpen: true, isLoading: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-loading-spinner')).toBeInTheDocument()
  })

  it('does not show the loading spinner when isLoading is false', () => {
    mockStore({ isOpen: true, isLoading: false })
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-loading-spinner')).not.toBeInTheDocument()
  })

  it('shows total item count badge when items exist', () => {
    const items: CartLineItem[] = [
      {
        id: 'a',
        productId: '',
        variantId: '',
        title: 'A',
        category: '',
        variant: '',
        imageUrl: '',
        imageAlt: '',
        unitPrice: 1000,
        quantity: 2,
      },
      {
        id: 'b',
        productId: '',
        variantId: '',
        title: 'B',
        category: '',
        variant: '',
        imageUrl: '',
        imageAlt: '',
        unitPrice: 2000,
        quantity: 1,
      },
    ]
    mockStore({ isOpen: true, items })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-item-count')).toHaveTextContent('(3)')
  })

  it('does not show item count badge when cart is empty', () => {
    mockStore({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-item-count')).not.toBeInTheDocument()
  })

  it('calls initCart on mount', () => {
    render(<CartDrawer />)
    expect(initCartMock).toHaveBeenCalledTimes(1)
  })
})
