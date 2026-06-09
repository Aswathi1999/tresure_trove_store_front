'use client'

import { create } from 'zustand'

export interface WishlistItem {
  id: string // Medusa product id — also the storage key
  title: string
  handle: string
  price: number // INR amount in rupees (matches getBasePrice output)
  originalPrice?: number
  imageUrl: string
}

// Per-user localStorage namespace. Guests share `tt-wishlist:guest`; logged-in
// customers each get `tt-wishlist:<customerId>`. The active key is determined
// by the store's `userId` state, set via setUser on login/logout.
const GUEST_KEY = 'tt-wishlist:guest'
const keyFor = (userId: string | null) => (userId ? `tt-wishlist:${userId}` : GUEST_KEY)

function readFromStorage(userId: string | null): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(keyFor(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : []
  } catch {
    return []
  }
}

function writeToStorage(userId: string | null, items: WishlistItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(items))
  } catch {
    // localStorage full or unavailable — silently drop
  }
}

interface WishlistStore {
  items: WishlistItem[]
  /** null = anonymous/guest; non-null = logged-in customer id */
  userId: string | null
  /** Switch the active user. Loads that user's saved wishlist from localStorage. */
  setUser: (userId: string | null) => void
  add: (item: WishlistItem) => void
  remove: (id: string) => void
  toggle: (item: WishlistItem) => void
  has: (id: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  userId: null,
  setUser: (userId) => {
    // No-op when the active user hasn't actually changed — avoids needless
    // re-renders if a session-sync component re-runs.
    if (userId === get().userId) return
    set({ userId, items: readFromStorage(userId) })
  },
  add: (item) =>
    set((state) => {
      if (state.items.some((i) => i.id === item.id)) return state
      const items = [...state.items, item]
      writeToStorage(state.userId, items)
      return { items }
    }),
  remove: (id) =>
    set((state) => {
      const items = state.items.filter((i) => i.id !== id)
      writeToStorage(state.userId, items)
      return { items }
    }),
  toggle: (item) =>
    set((state) => {
      const existing = state.items.some((i) => i.id === item.id)
      const items = existing ? state.items.filter((i) => i.id !== item.id) : [...state.items, item]
      writeToStorage(state.userId, items)
      return { items }
    }),
  has: (id) => get().items.some((i) => i.id === id),
  clear: () =>
    set((state) => {
      writeToStorage(state.userId, [])
      return { items: [] }
    }),
}))
