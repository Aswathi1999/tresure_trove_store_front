import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'
import type { HttpTypes } from '@medusajs/types'

const getCartActionMock = vi.fn()
const addItemActionMock = vi.fn()
const updateItemActionMock = vi.fn()
const removeItemActionMock = vi.fn()

vi.mock('@/actions/cart', () => ({
  getCartAction: (...args: unknown[]) => getCartActionMock(...args),
  addItemAction: (...args: unknown[]) => addItemActionMock(...args),
  updateItemAction: (...args: unknown[]) => updateItemActionMock(...args),
  removeItemAction: (...args: unknown[]) => removeItemActionMock(...args),
}))

import { useCartStore } from './cart'

const mockCart = {
  id: 'cart_01',
  items: [
    {
      id: 'item_01',
      title: 'Test Chair',
      variant_id: 'var_01',
      unit_price: 50000,
      quantity: 1,
      variant: {
        id: 'var_01',
        title: 'Natural Oak',
        product: {
          id: 'prod_01',
          title: 'Test Chair',
          thumbnail: 'https://cdn.example.com/chair.jpg',
          collection: { title: 'Living Room' },
        },
      },
    },
  ],
} as unknown as HttpTypes.StoreCart

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ cartId: null, items: [], isLoading: false, isOpen: false })
    getCartActionMock.mockReset()
    addItemActionMock.mockReset()
    updateItemActionMock.mockReset()
    removeItemActionMock.mockReset()
  })

  describe('drawer actions', () => {
    it('openCart sets isOpen to true', () => {
      useCartStore.getState().openCart()
      expect(useCartStore.getState().isOpen).toBe(true)
    })

    it('closeCart sets isOpen to false', () => {
      useCartStore.setState({ isOpen: true })
      useCartStore.getState().closeCart()
      expect(useCartStore.getState().isOpen).toBe(false)
    })

    it('toggleCart flips isOpen from false to true', () => {
      useCartStore.getState().toggleCart()
      expect(useCartStore.getState().isOpen).toBe(true)
    })

    it('toggleCart flips isOpen from true to false', () => {
      useCartStore.setState({ isOpen: true })
      useCartStore.getState().toggleCart()
      expect(useCartStore.getState().isOpen).toBe(false)
    })
  })

  describe('setCart', () => {
    it('sets cartId from the provided cart', () => {
      useCartStore.getState().setCart(mockCart)
      expect(useCartStore.getState().cartId).toBe('cart_01')
    })

    it('maps and stores cart items', () => {
      useCartStore.getState().setCart(mockCart)
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].title).toBe('Test Chair')
      expect(items[0].unitPrice).toBe(50000)
    })
  })

  describe('initCart', () => {
    it('fetches the cart and populates state', async () => {
      getCartActionMock.mockResolvedValueOnce(mockCart)
      await act(async () => {
        await useCartStore.getState().initCart()
      })
      expect(useCartStore.getState().cartId).toBe('cart_01')
      expect(useCartStore.getState().items).toHaveLength(1)
    })

    it('sets isLoading to false after success', async () => {
      getCartActionMock.mockResolvedValueOnce(mockCart)
      await act(async () => {
        await useCartStore.getState().initCart()
      })
      expect(useCartStore.getState().isLoading).toBe(false)
    })

    it('does nothing when getCartAction returns null', async () => {
      getCartActionMock.mockResolvedValueOnce(null)
      await act(async () => {
        await useCartStore.getState().initCart()
      })
      expect(useCartStore.getState().cartId).toBeNull()
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('sets isLoading to false even when getCartAction throws', async () => {
      getCartActionMock.mockRejectedValueOnce(new Error('Network error'))
      await act(async () => {
        try {
          await useCartStore.getState().initCart()
        } catch {
          // expected
        }
      })
      expect(useCartStore.getState().isLoading).toBe(false)
    })
  })

  describe('addItem', () => {
    it('calls addItemAction with variantId and quantity', async () => {
      addItemActionMock.mockResolvedValueOnce(mockCart)
      await act(async () => {
        await useCartStore.getState().addItem('var_01', 1)
      })
      expect(addItemActionMock).toHaveBeenCalledWith('var_01', 1)
    })

    it('updates cartId and items after adding', async () => {
      addItemActionMock.mockResolvedValueOnce(mockCart)
      await act(async () => {
        await useCartStore.getState().addItem('var_01', 1)
      })
      expect(useCartStore.getState().cartId).toBe('cart_01')
      expect(useCartStore.getState().items).toHaveLength(1)
    })

    it('sets isLoading to false after adding', async () => {
      addItemActionMock.mockResolvedValueOnce(mockCart)
      await act(async () => {
        await useCartStore.getState().addItem('var_01', 1)
      })
      expect(useCartStore.getState().isLoading).toBe(false)
    })
  })

  describe('removeItem', () => {
    it('calls removeItemAction with the lineItemId', async () => {
      const emptyCart = { ...mockCart, items: [] } as unknown as HttpTypes.StoreCart
      removeItemActionMock.mockResolvedValueOnce(emptyCart)
      useCartStore.setState({ cartId: 'cart_01' })
      await act(async () => {
        await useCartStore.getState().removeItem('item_01')
      })
      expect(removeItemActionMock).toHaveBeenCalledWith('item_01')
    })

    it('updates items after removal', async () => {
      const emptyCart = { ...mockCart, items: [] } as unknown as HttpTypes.StoreCart
      removeItemActionMock.mockResolvedValueOnce(emptyCart)
      useCartStore.setState({ cartId: 'cart_01' })
      await act(async () => {
        await useCartStore.getState().removeItem('item_01')
      })
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('sets isLoading to false after removal', async () => {
      const emptyCart = { ...mockCart, items: [] } as unknown as HttpTypes.StoreCart
      removeItemActionMock.mockResolvedValueOnce(emptyCart)
      useCartStore.setState({ cartId: 'cart_01' })
      await act(async () => {
        await useCartStore.getState().removeItem('item_01')
      })
      expect(useCartStore.getState().isLoading).toBe(false)
    })
  })

  describe('updateQuantity', () => {
    it('calls updateItemAction with lineItemId and quantity', async () => {
      const updatedCart = {
        ...mockCart,
        items: [{ ...mockCart.items![0], quantity: 3 }],
      } as unknown as HttpTypes.StoreCart
      updateItemActionMock.mockResolvedValueOnce(updatedCart)
      useCartStore.setState({ cartId: 'cart_01' })
      await act(async () => {
        await useCartStore.getState().updateQuantity('item_01', 3)
      })
      expect(updateItemActionMock).toHaveBeenCalledWith('item_01', 3)
    })

    it('updates item quantity in state', async () => {
      const updatedCart = {
        ...mockCart,
        items: [{ ...mockCart.items![0], quantity: 3 }],
      } as unknown as HttpTypes.StoreCart
      updateItemActionMock.mockResolvedValueOnce(updatedCart)
      useCartStore.setState({ cartId: 'cart_01' })
      await act(async () => {
        await useCartStore.getState().updateQuantity('item_01', 3)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('sets isLoading to false after update', async () => {
      const updatedCart = {
        ...mockCart,
        items: [{ ...mockCart.items![0], quantity: 3 }],
      } as unknown as HttpTypes.StoreCart
      updateItemActionMock.mockResolvedValueOnce(updatedCart)
      useCartStore.setState({ cartId: 'cart_01' })
      await act(async () => {
        await useCartStore.getState().updateQuantity('item_01', 3)
      })
      expect(useCartStore.getState().isLoading).toBe(false)
    })
  })
})
