'use client'

import { create } from 'zustand'

interface CollectionFilterStore {
  selectedMaterial: string | null
  maxPrice: number
  setMaterial: (material: string | null) => void
  setMaxPrice: (price: number) => void
  clearFilters: () => void
}

const MAX_PRICE_DEFAULT = 100000

export const useCollectionFilterStore = create<CollectionFilterStore>((set) => ({
  selectedMaterial: null,
  maxPrice: MAX_PRICE_DEFAULT,
  setMaterial: (material) => set({ selectedMaterial: material }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  clearFilters: () => set({ selectedMaterial: null, maxPrice: MAX_PRICE_DEFAULT }),
}))

export { MAX_PRICE_DEFAULT }
