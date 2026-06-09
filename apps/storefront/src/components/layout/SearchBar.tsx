'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useSearchStore } from '@/stores/search'

interface SearchBarProps {
  onClose?: () => void
  autoFocus?: boolean
}

export function SearchBar({ onClose, autoFocus = false }: SearchBarProps): React.JSX.Element {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    query,
    setQuery,
    fetchSuggestions,
    closeDropdown,
    moveSelection,
    selectedIndex,
    suggestions,
  } = useSearchStore()

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  const navigate = (q: string) => {
    closeDropdown()
    onClose?.()
    setQuery('')
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selected = suggestions[selectedIndex]
    if (selected) {
      navigate(selected.title)
    } else if (query.trim()) {
      navigate(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeDropdown()
      onClose?.()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveSelection('down')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveSelection('up')
    }
  }

  const handleClear = () => {
    setQuery('')
    closeDropdown()
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-b border-[var(--color-tt-outline-variant)] pb-4"
    >
      <Search size={20} className="text-[var(--color-tt-outline)] shrink-0" />
      <input
        ref={inputRef}
        data-testid="search-bar-input"
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search our collection…"
        className="flex-1 text-base text-[var(--color-tt-ink)] outline-none placeholder:text-[var(--color-tt-outline)] bg-transparent"
      />
      {query && (
        <button
          type="button"
          data-testid="search-bar-clear"
          onClick={handleClear}
          aria-label="Clear search"
          className="text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </form>
  )
}
