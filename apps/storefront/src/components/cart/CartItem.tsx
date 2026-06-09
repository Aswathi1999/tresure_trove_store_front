'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/cart-types'
import type { CartLineItem } from '@/lib/cart-types'

interface CartItemProps {
  item: CartLineItem
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
  isSelected,
  onToggleSelect,
}: CartItemProps) {
  const lineTotal = item.unitPrice * item.quantity
  const priceChanged =
    item.originalUnitPrice !== undefined && item.originalUnitPrice !== item.unitPrice

  function handleDecrement() {
    if (item.quantity > 1) onUpdateQuantity(item.id, item.quantity - 1)
  }

  function handleIncrement() {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  return (
    <div
      data-testid="cart-item"
      className={`flex gap-4 py-6 ${item.isOutOfStock ? 'opacity-60' : ''}`}
    >
      {/* Selection checkbox */}
      <div className="flex items-start pt-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          disabled={item.isOutOfStock}
          aria-label={`Select ${item.title} for checkout`}
          data-testid="cart-item-select"
          className="w-4 h-4 accent-[var(--color-tt-gold)] cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      {/* Image */}
      <div className="relative w-[88px] h-[110px] flex-shrink-0 rounded-[4px] overflow-hidden bg-[var(--color-tt-surface-container)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            className="object-cover"
            sizes="88px"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-tt-surface-container)]" />
        )}
      </div>

      {/* Details */}
      <div className="flex-grow min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-[9px] tracking-[0.15em] text-[var(--color-tt-gold)] font-bold uppercase mb-0.5">
            {item.category}
          </p>
          <h3 className="text-[13px] font-semibold text-[var(--color-tt-ink)] uppercase tracking-wide leading-tight">
            {item.title}
          </h3>
          <p className="text-[11px] text-[var(--color-tt-outline)] mt-0.5 uppercase tracking-[0.05em]">
            {item.variant}
          </p>

          {item.isOutOfStock && (
            <span
              data-testid="out-of-stock-badge"
              className="inline-block mt-2 px-2 py-0.5 bg-[var(--color-tt-orange)]/10 text-[var(--color-tt-orange)] text-[9px] font-bold tracking-[0.15em] uppercase rounded-[2px]"
            >
              OUT OF STOCK
            </span>
          )}

          {priceChanged && !item.isOutOfStock && (
            <p
              data-testid="price-changed-warning"
              className="mt-1.5 text-[9px] tracking-[0.08em] text-[var(--color-tt-orange)] uppercase font-semibold"
            >
              ⚠ Price updated since added
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-3">
          {priceChanged && item.originalUnitPrice !== undefined ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] text-[var(--color-tt-outline)] line-through">
                {formatPrice(item.originalUnitPrice)}
              </span>
              <span className="text-[13px] font-bold text-[var(--color-tt-ink)]">
                {formatPrice(item.unitPrice)}
              </span>
            </div>
          ) : (
            <span className="text-[13px] font-bold text-[var(--color-tt-ink)]">
              {formatPrice(item.unitPrice)}
            </span>
          )}
          <p className="text-[10px] text-[var(--color-tt-outline)] mt-0.5 uppercase tracking-wider">
            Line total: {formatPrice(lineTotal)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          data-testid="remove-item-button"
          onClick={() => onRemove(item.id)}
          className="text-[var(--color-tt-outline)] hover:text-[var(--color-tt-orange)] transition-colors"
          aria-label={`Remove ${item.title}`}
        >
          <Trash2 size={15} />
        </button>

        <div
          data-testid="quantity-stepper"
          className={`flex items-center border border-[var(--color-tt-outline-variant)] rounded-[2px] ${item.isOutOfStock ? 'pointer-events-none opacity-50' : ''}`}
        >
          <button
            data-testid="quantity-decrement"
            onClick={handleDecrement}
            disabled={item.isOutOfStock || item.quantity <= 1}
            className="px-2 py-1.5 hover:text-[var(--color-tt-gold)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </button>
          <span className="px-2 text-[12px] font-semibold min-w-[1.5rem] text-center">
            {item.quantity}
          </span>
          <button
            data-testid="quantity-increment"
            onClick={handleIncrement}
            disabled={item.isOutOfStock}
            className="px-2 py-1.5 hover:text-[var(--color-tt-gold)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
