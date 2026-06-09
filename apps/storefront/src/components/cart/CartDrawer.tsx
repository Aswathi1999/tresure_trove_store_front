'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { CartItem } from './CartItem'
import { CartSummary } from './CartSummary'
import { EmptyCart } from './EmptyCart'

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    selectedIds,
    removeItem,
    updateQuantity,
    toggleSelected,
    selectAll,
    deselectAll,
    initCart,
    isLoading,
  } = useCartStore()

  const allSelected = items.length > 0 && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length

  useEffect(() => {
    void initCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            data-testid="cart-backdrop"
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[var(--color-tt-ink)]/40"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            data-testid="cart-drawer"
            key="drawer"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 z-50 h-dvh w-full md:w-[420px] bg-[var(--color-tt-surface)] flex flex-col shadow-[0_20px_40px_rgba(31,27,22,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[var(--color-tt-surface-container-lowest)]">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-tt-outline)] font-semibold mb-0.5">
                  Treasure Trove
                </p>
                <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[var(--color-tt-ink)]">
                  Your Cart
                  {itemCount > 0 && (
                    <span
                      data-testid="cart-item-count"
                      className="ml-2 text-[var(--color-tt-gold)]"
                    >
                      ({itemCount})
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {isLoading && (
                  <Loader2
                    data-testid="cart-loading-spinner"
                    size={16}
                    className="animate-spin text-[var(--color-tt-outline)]"
                  />
                )}
                <button
                  data-testid="close-cart-button"
                  onClick={closeCart}
                  className="text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] transition-colors"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <EmptyCart onClose={closeCart} />
            ) : (
              <>
                <div className="flex-grow min-h-0 overflow-y-auto">
                  {items.length > 1 && (
                    <div className="px-6 py-3 border-b border-[var(--color-tt-outline-variant)]/30 bg-[var(--color-tt-surface-container-lowest)] sticky top-0 z-10">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected
                          }}
                          onChange={() => (allSelected ? deselectAll() : selectAll())}
                          aria-label="Select all cart items"
                          data-testid="cart-select-all"
                          className="w-4 h-4 accent-[var(--color-tt-gold)] cursor-pointer"
                        />
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink)]">
                          {allSelected
                            ? `All selected (${selectedIds.length})`
                            : selectedIds.length === 0
                              ? 'Select all'
                              : `${selectedIds.length} of ${items.length} selected`}
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="px-6 divide-y divide-[var(--color-tt-outline-variant)]/20">
                    {items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onRemove={removeItem}
                        onUpdateQuantity={updateQuantity}
                        isSelected={selectedIds.includes(item.id)}
                        onToggleSelect={toggleSelected}
                      />
                    ))}
                  </div>
                </div>

                <CartSummary items={items} selectedIds={selectedIds} />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
