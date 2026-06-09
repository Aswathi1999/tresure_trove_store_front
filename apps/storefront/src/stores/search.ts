'use client'

import { create } from 'zustand'
import type { SearchProduct } from '@/lib/search.mock'
import { getSearchSuggestions } from '@/lib/medusa'

interface SearchStore {
  query: string
  suggestions: SearchProduct[]
  isDropdownOpen: boolean
  selectedIndex: number
  setQuery: (query: string) => void
  fetchSuggestions: (query: string) => Promise<void>
  openDropdown: () => void
  closeDropdown: () => void
  moveSelection: (direction: 'up' | 'down') => void
  resetSearch: () => void
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  suggestions: [],
  isDropdownOpen: false,
  selectedIndex: -1,

  setQuery: (query) => set({ query }),

  fetchSuggestions: async (query) => {
    const suggestions = await getSearchSuggestions(query)
    set({ suggestions, isDropdownOpen: query.length > 0 && suggestions.length > 0 })
  },

  openDropdown: () => set({ isDropdownOpen: true }),

  closeDropdown: () => set({ isDropdownOpen: false, selectedIndex: -1 }),

  moveSelection: (direction) => {
    const { selectedIndex, suggestions } = get()
    const max = suggestions.length - 1
    if (max < 0) return
    if (direction === 'down') {
      set({ selectedIndex: selectedIndex < max ? selectedIndex + 1 : 0 })
    } else {
      set({ selectedIndex: selectedIndex > 0 ? selectedIndex - 1 : max })
    }
  },

  resetSearch: () => set({ query: '', suggestions: [], isDropdownOpen: false, selectedIndex: -1 }),
}))
