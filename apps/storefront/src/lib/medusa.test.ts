import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these fn references are available inside the vi.mock factory
// even though vi.mock calls are hoisted above regular imports.
const cartMocks = vi.hoisted(() => ({
  create: vi.fn(),
  retrieve: vi.fn(),
  createLineItem: vi.fn(),
  updateLineItem: vi.fn(),
  deleteLineItem: vi.fn(),
}))

vi.mock('@medusajs/js-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    store: {
      cart: {
        create: cartMocks.create,
        retrieve: cartMocks.retrieve,
        createLineItem: cartMocks.createLineItem,
        updateLineItem: cartMocks.updateLineItem,
        deleteLineItem: cartMocks.deleteLineItem,
      },
    },
  })),
}))

import { createCart, getCart, addCartItem, updateCartItem, removeCartItem } from './medusa'

// Minimal cart shape used as mock return value across all tests.
const mockCart = {
  id: 'cart_01',
  region_id: 'reg_01',
  currency_code: 'inr',
  subtotal: 10000,
  tax_total: 1800,
  total: 11800,
  items: [],
}

describe('cart SDK wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── createCart ────────────────────────────────────────────────────────────

  describe('createCart', () => {
    it('calls medusa.store.cart.create with the supplied region_id', async () => {
      cartMocks.create.mockResolvedValueOnce({ cart: mockCart })
      await createCart('reg_01')
      expect(cartMocks.create).toHaveBeenCalledOnce()
      expect(cartMocks.create).toHaveBeenCalledWith({ region_id: 'reg_01' })
    })

    it('forwards the auth header so the cart is created for the logged-in customer', async () => {
      cartMocks.create.mockResolvedValueOnce({ cart: mockCart })
      await createCart('reg_01', { authorization: 'Bearer tok_123' })
      expect(cartMocks.create).toHaveBeenCalledWith(
        { region_id: 'reg_01' },
        {},
        { authorization: 'Bearer tok_123' },
      )
    })

    it('returns the cart from the API response', async () => {
      cartMocks.create.mockResolvedValueOnce({ cart: mockCart })
      const result = await createCart('reg_01')
      expect(result).toBe(mockCart)
    })

    it('propagates errors thrown by the SDK', async () => {
      cartMocks.create.mockRejectedValueOnce(new Error('network error'))
      await expect(createCart('reg_01')).rejects.toThrow('network error')
    })
  })

  // ─── getCart ───────────────────────────────────────────────────────────────

  describe('getCart', () => {
    it('calls medusa.store.cart.retrieve with the supplied cartId', async () => {
      cartMocks.retrieve.mockResolvedValueOnce({ cart: mockCart })
      await getCart('cart_01')
      expect(cartMocks.retrieve).toHaveBeenCalledOnce()
      expect(cartMocks.retrieve).toHaveBeenCalledWith('cart_01', expect.any(Object))
    })

    it('requests id, region_id, currency_code, subtotal, tax_total, and total fields', async () => {
      cartMocks.retrieve.mockResolvedValueOnce({ cart: mockCart })
      await getCart('cart_01')
      const [, options] = cartMocks.retrieve.mock.calls[0] as [string, { fields: string }]
      expect(options.fields).toContain('id')
      expect(options.fields).toContain('region_id')
      expect(options.fields).toContain('currency_code')
      expect(options.fields).toContain('subtotal')
      expect(options.fields).toContain('tax_total')
      expect(options.fields).toContain('total')
    })

    it('requests line items with variant and product expansion', async () => {
      cartMocks.retrieve.mockResolvedValueOnce({ cart: mockCart })
      await getCart('cart_01')
      const [, options] = cartMocks.retrieve.mock.calls[0] as [string, { fields: string }]
      expect(options.fields).toContain('*items')
      expect(options.fields).toContain('*items.variant')
      expect(options.fields).toContain('*items.variant.product')
    })

    it('returns the cart from the API response', async () => {
      cartMocks.retrieve.mockResolvedValueOnce({ cart: mockCart })
      const result = await getCart('cart_01')
      expect(result).toBe(mockCart)
    })

    it('propagates errors thrown by the SDK', async () => {
      cartMocks.retrieve.mockRejectedValueOnce(new Error('not found'))
      await expect(getCart('cart_01')).rejects.toThrow('not found')
    })
  })

  // ─── addCartItem ───────────────────────────────────────────────────────────

  describe('addCartItem', () => {
    it('calls medusa.store.cart.createLineItem with correct cartId, variant_id, and quantity', async () => {
      cartMocks.createLineItem.mockResolvedValueOnce({ cart: mockCart })
      await addCartItem('cart_01', 'variant_01', 2)
      expect(cartMocks.createLineItem).toHaveBeenCalledOnce()
      expect(cartMocks.createLineItem).toHaveBeenCalledWith('cart_01', {
        variant_id: 'variant_01',
        quantity: 2,
      })
    })

    it('returns the updated cart from the API response', async () => {
      cartMocks.createLineItem.mockResolvedValueOnce({ cart: mockCart })
      const result = await addCartItem('cart_01', 'variant_01', 1)
      expect(result).toBe(mockCart)
    })

    it('propagates errors thrown by the SDK', async () => {
      cartMocks.createLineItem.mockRejectedValueOnce(new Error('variant not found'))
      await expect(addCartItem('cart_01', 'variant_bad', 1)).rejects.toThrow('variant not found')
    })
  })

  // ─── updateCartItem ────────────────────────────────────────────────────────

  describe('updateCartItem', () => {
    it('calls medusa.store.cart.updateLineItem with correct cartId, lineItemId, and quantity', async () => {
      cartMocks.updateLineItem.mockResolvedValueOnce({ cart: mockCart })
      await updateCartItem('cart_01', 'li_01', 3)
      expect(cartMocks.updateLineItem).toHaveBeenCalledOnce()
      expect(cartMocks.updateLineItem).toHaveBeenCalledWith('cart_01', 'li_01', { quantity: 3 })
    })

    it('returns the updated cart from the API response', async () => {
      cartMocks.updateLineItem.mockResolvedValueOnce({ cart: mockCart })
      const result = await updateCartItem('cart_01', 'li_01', 3)
      expect(result).toBe(mockCart)
    })

    it('propagates errors thrown by the SDK', async () => {
      cartMocks.updateLineItem.mockRejectedValueOnce(new Error('line item not found'))
      await expect(updateCartItem('cart_01', 'li_bad', 1)).rejects.toThrow('line item not found')
    })
  })

  // ─── removeCartItem ────────────────────────────────────────────────────────

  describe('removeCartItem', () => {
    it('calls medusa.store.cart.deleteLineItem with correct cartId and lineItemId', async () => {
      cartMocks.deleteLineItem.mockResolvedValueOnce({ parent: mockCart })
      await removeCartItem('cart_01', 'li_01')
      expect(cartMocks.deleteLineItem).toHaveBeenCalledOnce()
      expect(cartMocks.deleteLineItem).toHaveBeenCalledWith('cart_01', 'li_01')
    })

    it('returns the parent cart from the API response', async () => {
      cartMocks.deleteLineItem.mockResolvedValueOnce({ parent: mockCart })
      const result = await removeCartItem('cart_01', 'li_01')
      expect(result).toBe(mockCart)
    })

    it('throws an error when the response contains no parent cart', async () => {
      cartMocks.deleteLineItem.mockResolvedValueOnce({ parent: undefined })
      await expect(removeCartItem('cart_01', 'li_01')).rejects.toThrow(
        'Cart cart_01 not found after line item deletion',
      )
    })

    it('throws an error when parent is null', async () => {
      cartMocks.deleteLineItem.mockResolvedValueOnce({ parent: null })
      await expect(removeCartItem('cart_01', 'li_01')).rejects.toThrow(
        'Cart cart_01 not found after line item deletion',
      )
    })

    it('propagates errors thrown by the SDK', async () => {
      cartMocks.deleteLineItem.mockRejectedValueOnce(new Error('cart not found'))
      await expect(removeCartItem('cart_01', 'li_01')).rejects.toThrow('cart not found')
    })
  })
})
