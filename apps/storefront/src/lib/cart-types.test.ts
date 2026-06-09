import { describe, it, expect } from 'vitest'
import type { HttpTypes } from '@medusajs/types'
import { formatPrice, mapMedusaCart } from './cart-types'

describe('formatPrice', () => {
  it('converts 100 paise to Rs. 1', () => {
    expect(formatPrice(100)).toBe('Rs. 1')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('Rs. 0')
  })

  it('converts 50000 paise to Rs. 500', () => {
    expect(formatPrice(50000)).toBe('Rs. 500')
  })

  it('includes decimal when paise is not a round rupee', () => {
    expect(formatPrice(150)).toBe('Rs. 1.5')
  })

  it('starts with Rs. prefix', () => {
    expect(formatPrice(10000)).toMatch(/^Rs\./)
  })
})

describe('mapMedusaCart', () => {
  it('returns empty array when items is undefined', () => {
    const cart = {} as HttpTypes.StoreCart
    expect(mapMedusaCart(cart)).toEqual([])
  })

  it('returns empty array for empty items list', () => {
    const cart = { items: [] } as unknown as HttpTypes.StoreCart
    expect(mapMedusaCart(cart)).toEqual([])
  })

  it('maps a full line item correctly', () => {
    const cart = {
      items: [
        {
          id: 'item_01',
          title: 'Okura Chair',
          variant_id: 'var_01',
          unit_price: 50000,
          quantity: 2,
          variant: {
            id: 'var_01',
            title: 'Natural Oak',
            product: {
              id: 'prod_01',
              title: 'Okura Chair',
              thumbnail: 'https://cdn.example.com/chair.jpg',
              collection: { title: 'Living Room' },
            },
          },
        },
      ],
    } as unknown as HttpTypes.StoreCart

    const result = mapMedusaCart(cart)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'item_01',
      productId: 'prod_01',
      variantId: 'var_01',
      title: 'Okura Chair',
      category: 'Living Room',
      variant: 'Natural Oak',
      imageUrl: 'https://cdn.example.com/chair.jpg',
      imageAlt: 'Okura Chair',
      unitPrice: 50000,
      quantity: 2,
    })
  })

  it('falls back to empty strings when optional fields are missing', () => {
    const cart = {
      items: [
        {
          id: 'item_02',
          title: 'Bare Item',
          quantity: 1,
          unit_price: 100000,
        },
      ],
    } as unknown as HttpTypes.StoreCart

    const result = mapMedusaCart(cart)
    expect(result[0].variantId).toBe('')
    expect(result[0].category).toBe('')
    expect(result[0].variant).toBe('')
    expect(result[0].imageUrl).toBe('')
  })

  it('maps multiple items', () => {
    const cart = {
      items: [
        { id: 'a', title: 'A', quantity: 1, unit_price: 1000 },
        { id: 'b', title: 'B', quantity: 2, unit_price: 2000 },
      ],
    } as unknown as HttpTypes.StoreCart

    const result = mapMedusaCart(cart)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('a')
    expect(result[1].id).toBe('b')
  })
})
