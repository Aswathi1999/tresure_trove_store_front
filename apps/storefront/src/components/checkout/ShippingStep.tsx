'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/cart-types'
import { getShippingOptionsAction, addShippingMethodAction } from '@/actions/checkout'
import type { MockShippingOption } from '@/lib/checkout.mock'

interface Props {
  onNext: (option: MockShippingOption) => void
  onBack: () => void
  /** Pre-select this shipping option when the user navigates back to this step. */
  initialSelectedId?: string | null
}

export default function ShippingStep({ onNext, onBack, initialSelectedId }: Props) {
  const [options, setOptions] = useState<MockShippingOption[]>([])
  const [selected, setSelected] = useState<string | null>(initialSelectedId ?? null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getShippingOptionsAction()
      .then((opts) => {
        setOptions(opts)
        // Honor the previously-selected option if it still exists; otherwise
        // default to the first option as before.
        setSelected((prev) => {
          if (prev && opts.some((o) => o.id === prev)) return prev
          return opts[0]?.id ?? null
        })
      })
      .catch(() => setError('Failed to load shipping options. Please refresh and try again.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedOption = options.find((o) => o.id === selected)

  async function handleContinue() {
    if (!selectedOption) return
    setSubmitting(true)
    setError(null)
    try {
      await addShippingMethodAction(selectedOption.id)
      onNext(selectedOption)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save shipping method. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section data-testid="shipping-step">
      <div className="flex items-center gap-6 mb-8">
        <span className="w-8 h-8 flex items-center justify-center bg-[var(--color-tt-ink)] text-white font-bold text-sm shrink-0">
          2
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-[var(--color-tt-ink)]">
          Shipping Method
        </h2>
      </div>

      <div className="pl-0 sm:pl-14 space-y-6">
        {error && (
          <div
            className="p-4 border border-[var(--color-tt-danger)] bg-red-50 text-sm text-[var(--color-tt-danger)] font-medium"
            data-testid="shipping-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-[var(--color-tt-ink-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm tracking-widest uppercase">Loading shipping options…</span>
          </div>
        ) : options.length === 0 ? (
          <p className="py-8 text-sm text-[var(--color-tt-ink-muted)]">
            No shipping options are available for your address. Please contact support.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Shipping options">
            {options.map((opt) => {
              const isSelected = selected === opt.id
              return (
                <label
                  key={opt.id}
                  className={[
                    'flex items-center justify-between p-4 sm:p-5 border cursor-pointer transition-all group rounded-sm',
                    isSelected
                      ? 'border-[var(--color-tt-gold)] bg-[var(--color-tt-surface-container)]'
                      : 'border-[var(--color-tt-outline-variant)] hover:bg-[var(--color-tt-surface-container)]',
                  ].join(' ')}
                  data-testid={`shipping-option-${opt.id}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setSelected(opt.id)}
                      className="mt-0.5 accent-[var(--color-tt-gold)]"
                      data-testid={`shipping-radio-${opt.id}`}
                    />
                    <div>
                      <p className="text-sm font-bold tracking-wider uppercase text-[var(--color-tt-ink)]">
                        {opt.name}
                      </p>
                      <p className="text-[11px] text-[var(--color-tt-ink-muted)] mt-0.5 tracking-wide">
                        {opt.carrier} · {opt.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  <span
                    className={[
                      'text-sm font-semibold tracking-wider shrink-0 ml-4',
                      opt.price === 0
                        ? 'text-[var(--color-tt-brown)]'
                        : 'text-[var(--color-tt-ink)]',
                    ].join(' ')}
                  >
                    {opt.price === 0 ? 'FREE' : formatPrice(opt.price)}
                  </span>
                </label>
              )
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink-muted)] px-8 py-4 text-xs font-bold tracking-[0.20em] uppercase hover:bg-[var(--color-tt-surface-container)] transition-colors disabled:opacity-40"
            data-testid="shipping-back-button"
          >
            BACK
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedOption || submitting}
            className="bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] px-10 py-4 text-xs font-bold tracking-[0.20em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="shipping-continue-button"
          >
            {submitting ? 'SAVING…' : 'CONTINUE TO PAYMENT'}
          </button>
        </div>
      </div>
    </section>
  )
}
