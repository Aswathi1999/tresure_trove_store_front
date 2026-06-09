'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSearchStore } from '@/stores/search'
import type { SearchProduct } from '@/lib/search.mock'

interface AutocompleteDropdownProps {
  onClose?: () => void
}

export function AutocompleteDropdown({ onClose }: AutocompleteDropdownProps) {
  const router = useRouter()
  const { suggestions, isDropdownOpen, selectedIndex, closeDropdown, setQuery } = useSearchStore()

  if (!isDropdownOpen || suggestions.length === 0) return null

  const handleSelect = (product: SearchProduct) => {
    closeDropdown()
    setQuery('')
    onClose?.()
    router.push(`/search?q=${encodeURIComponent(product.title)}`)
  }

  return (
    <div data-testid="autocomplete-dropdown" className="mt-2 space-y-0.5">
      {suggestions.map((product, i) => (
        <button
          key={product.id}
          data-testid={`autocomplete-item-${i}`}
          onClick={() => handleSelect(product)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-sm transition-colors ${
            i === selectedIndex
              ? 'bg-[var(--color-tt-surface-container)]'
              : 'hover:bg-[var(--color-tt-surface-container)]'
          }`}
        >
          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-sm bg-[var(--color-tt-surface-container-high)]">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="40px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] truncate">
              {product.title}
            </p>
            <p className="text-[10px] text-[var(--color-tt-outline)] font-medium mt-0.5">
              {product.price}
            </p>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-[var(--color-tt-outline-variant)] shrink-0">
            {product.category}
          </span>
        </button>
      ))}
    </div>
  )
}
