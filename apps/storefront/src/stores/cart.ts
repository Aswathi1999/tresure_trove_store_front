'use client'

import { create } from 'zustand'
import type { HttpTypes } from '@medusajs/types'
import type { CartLineItem } from '@/lib/cart-types'
import { mapMedusaCart } from '@/lib/cart-types'
import { getCartAction, addItemAction, updateItemAction, removeItemAction } from '@/actions/cart'

interface CartStore {
  cartId: string | null
  items: CartLineItem[]
  selectedIds: string[]
  isLoading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  setCart: (cart: HttpTypes.StoreCart) => void
  initCart: () => Promise<void>
  addItem: (variantId: string, quantity: number) => Promise<void>
  addItemLocal: (item: CartLineItem) => void
  removeItem: (lineItemId: string) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  toggleSelected: (lineItemId: string) => void
  selectAll: () => void
  deselectAll: () => void
}

// Keep selectedIds in sync when the underlying items list changes:
// drop any selectedIds whose line item is no longer present, and auto-select
// only line items that are GENUINELY NEW (not present before this update).
//
// "Newly added" is computed against the previous ITEM set, not the previous
// SELECTION. Using the selection would treat every deselected item as new, so
// deselecting items and then changing a quantity (or any cart refresh) would
// wrongly re-select everything — the bug this guards against.
function syncSelection(
  prevSelected: string[],
  prevItems: CartLineItem[],
  nextItems: CartLineItem[],
): string[] {
  const nextIds = new Set(nextItems.map((i) => i.id))
  const prevItemIds = new Set(prevItems.map((i) => i.id))
  const kept = prevSelected.filter((id) => nextIds.has(id))
  const newlyAdded = nextItems.map((i) => i.id).filter((id) => !prevItemIds.has(id))
  return Array.from(new Set([...kept, ...newlyAdded]))
}

export const useCartStore = create<CartStore>((set) => ({
  cartId: null,
  items: [],
  selectedIds: [],
  isLoading: false,
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCart: (cart) =>
    set((state) => {
      const items = mapMedusaCart(cart)
      return {
        cartId: cart.id,
        items,
        selectedIds: syncSelection(state.selectedIds, state.items, items),
      }
    }),
  initCart: async () => {
    set({ isLoading: true })
    try {
      const cart = await getCartAction()
      if (cart) {
        set((state) => {
          const items = mapMedusaCart(cart)
          return {
            cartId: cart.id,
            items,
            selectedIds: syncSelection(state.selectedIds, state.items, items),
          }
        })
      } else {
        // No cart for the current session — wipe in-memory state so a previous
        // user's items don't linger after logout / user-switch.
        set({ cartId: null, items: [], selectedIds: [] })
      }
    } finally {
      set({ isLoading: false })
    }
  },
  addItemLocal: (item) =>
    set((state) => ({
      items: [...state.items, item],
      selectedIds: [...state.selectedIds, item.id],
      isOpen: true,
    })),
  addItem: async (variantId, quantity) => {
    set({ isLoading: true })
    try {
      const cart = await addItemAction(variantId, quantity)
      set((state) => {
        const items = mapMedusaCart(cart)
        return {
          cartId: cart.id,
          items,
          selectedIds: syncSelection(state.selectedIds, state.items, items),
        }
      })
    } finally {
      set({ isLoading: false })
    }
  },
  removeItem: async (lineItemId) => {
    set({ isLoading: true })
    try {
      const cart = await removeItemAction(lineItemId)
      set((state) => {
        const items = mapMedusaCart(cart)
        return { items, selectedIds: syncSelection(state.selectedIds, state.items, items) }
      })
    } finally {
      set({ isLoading: false })
    }
  },
  updateQuantity: async (lineItemId, quantity) => {
    set({ isLoading: true })
    try {
      const cart = await updateItemAction(lineItemId, quantity)
      set((state) => {
        const items = mapMedusaCart(cart)
        return { items, selectedIds: syncSelection(state.selectedIds, state.items, items) }
      })
    } finally {
      set({ isLoading: false })
    }
  },
  toggleSelected: (lineItemId) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(lineItemId)
        ? state.selectedIds.filter((id) => id !== lineItemId)
        : [...state.selectedIds, lineItemId],
    })),
  selectAll: () => set((state) => ({ selectedIds: state.items.map((i) => i.id) })),
  deselectAll: () => set({ selectedIds: [] }),
}))
