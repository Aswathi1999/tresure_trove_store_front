'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ShieldCheck, X, Loader2 } from 'lucide-react'
import { formatPrice, calcGst } from '@/lib/cart-types'
import { useCartStore } from '@/stores/cart'
import {
  applyPromotionAction,
  removePromotionAction,
  getAppliedPromotionsAction,
} from '@/actions/checkout'
import type { MockShippingOption } from '@/lib/checkout.mock'

interface Props {
  shippingOption: MockShippingOption | null
}

export default function OrderSummary({ shippingOption }: Props): React.JSX.Element {
  const [promoCode, setPromoCode] = useState('')
  const [appliedCodes, setAppliedCodes] = useState<string[]>([])
  const [discount, setDiscount] = useState(0) // pre-tax discount on goods
  const [shippingDiscount, setShippingDiscount] = useState(0) // pre-tax discount on shipping
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoNote, setPromoNote] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const allItems = useCartStore((state) => state.items)
  const selectedIds = useCartStore((state) => state.selectedIds)
  const cartId = useCartStore((state) => state.cartId)
  const items = allItems.filter((i) => selectedIds.includes(i.id))

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const shippingPrice = shippingOption?.price ?? 0
  // Discounts are pre-tax. An item discount reduces the taxable goods; a
  // free-shipping promo reduces shipping. GST is charged on the discounted base,
  // so the amounts shown equal what Medusa actually charges.
  const effectiveShipping = Math.max(0, shippingPrice - shippingDiscount)
  const taxable = Math.max(0, subtotal - discount)
  const gst = calcGst(taxable + effectiveShipping)
  const total = taxable + gst + effectiveShipping

  // Split Medusa's pre-tax discount into its goods and shipping portions.
  function applyResult(res: {
    appliedCodes: string[]
    discountSubtotal: number
    shippingDiscount: number
  }) {
    setAppliedCodes(res.appliedCodes)
    setShippingDiscount(res.shippingDiscount)
    setDiscount(Math.max(0, res.discountSubtotal - res.shippingDiscount))
  }

  // Reflect promotions already on the cart, and apply a queued free-shipping code
  // once a delivery option exists (shipping promos can't attach before then).
  useEffect(() => {
    if (!cartId) return
    let live = true
    ;(async () => {
      if (pendingCode && shippingOption) {
        const res = await applyPromotionAction(cartId, pendingCode)
        if (!live) return
        setPendingCode(null)
        setPromoNote(null)
        applyResult(res)
        if (!res.ok) setPromoError(res.error ?? 'Could not apply the promo code.')
        return
      }
      const res = await getAppliedPromotionsAction(cartId)
      if (!live) return
      applyResult(res)
    })()
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId, shippingOption?.id, pendingCode])

  async function handleApplyPromo() {
    if (!cartId || !promoCode.trim() || promoLoading) return
    setPromoLoading(true)
    setPromoError(null)
    setPromoNote(null)
    const code = promoCode.trim()
    const res = await applyPromotionAction(cartId, code)
    applyResult(res)
    if (res.ok) {
      setPromoCode('')
    } else if (!shippingOption) {
      // Likely a shipping-only code (e.g. free shipping): it can't attach until a
      // delivery option is chosen, so queue it and apply automatically then.
      setPendingCode(code)
      setPromoCode('')
      setPromoNote(`"${code}" will be applied once you choose a delivery option.`)
    } else {
      setPromoError(res.error ?? 'Could not apply the promo code.')
    }
    setPromoLoading(false)
  }

  async function handleRemovePromo(code: string) {
    if (!cartId || promoLoading) return
    setPromoLoading(true)
    setPromoError(null)
    const res = await removePromotionAction(cartId, code)
    applyResult(res)
    if (!res.ok) setPromoError(res.error ?? 'Could not remove the promo code.')
    setPromoLoading(false)
  }

  return (
    <div data-testid="order-summary">
      <div className="bg-[var(--color-tt-surface-container)] p-6 sm:p-8 space-y-8 rounded-sm">
        <h3 className="text-base font-bold tracking-[0.15em] uppercase border-b border-[var(--color-tt-outline-variant)] pb-4 text-[var(--color-tt-ink)]">
          ORDER SUMMARY
        </h3>

        {/* Product rows */}
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-20 h-24 bg-[var(--color-tt-surface-container-lowest)] shrink-0 overflow-hidden rounded-sm relative flex items-center justify-center">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="text-[var(--color-tt-outline-variant)] text-xs text-center px-2">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between py-1 min-w-0">
                <div>
                  <h4 className="text-[13px] font-bold tracking-wider uppercase text-[var(--color-tt-ink)] leading-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[var(--color-tt-ink-muted)] mt-1 uppercase tracking-wider">
                    QTY: {item.quantity}
                    {item.variant ? ` · ${item.variant}` : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold tracking-wider text-[var(--color-tt-ink)]">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="pt-6 border-t border-[var(--color-tt-outline-variant)] space-y-3">
          <div className="flex justify-between text-sm tracking-wide">
            <span className="text-[var(--color-tt-ink-muted)] uppercase">Subtotal</span>
            <span className="font-medium text-[var(--color-tt-ink)]">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div
              className="flex justify-between text-sm tracking-wide"
              data-testid="order-summary-discount"
            >
              <span className="text-[var(--color-tt-brown)] uppercase">Discount</span>
              <span className="font-medium text-[var(--color-tt-brown)]">
                −{formatPrice(discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm tracking-wide">
            <span className="text-[var(--color-tt-ink-muted)] uppercase">GST (12%)</span>
            <span className="font-medium text-[var(--color-tt-ink)]">{formatPrice(gst)}</span>
          </div>
          <div className="flex justify-between text-sm tracking-wide">
            <span className="text-[var(--color-tt-ink-muted)] uppercase">Shipping</span>
            {shippingOption ? (
              <span className="font-medium uppercase">
                {shippingDiscount > 0 && shippingPrice > 0 && (
                  <span className="line-through text-[var(--color-tt-ink-muted)] mr-2 normal-case">
                    {formatPrice(shippingPrice)}
                  </span>
                )}
                <span
                  className={
                    effectiveShipping === 0
                      ? 'text-[var(--color-tt-brown)]'
                      : 'text-[var(--color-tt-ink)]'
                  }
                >
                  {effectiveShipping === 0 ? 'FREE' : formatPrice(effectiveShipping)}
                </span>
              </span>
            ) : (
              <span className="text-[var(--color-tt-ink-muted)] text-xs italic">
                Calculated next
              </span>
            )}
          </div>
          <div className="flex justify-between pt-4 text-base font-bold tracking-widest border-t border-[var(--color-tt-outline-variant)]">
            <span className="uppercase text-[var(--color-tt-ink)]">Total</span>
            <span className="text-[var(--color-tt-ink)]">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Promo code */}
        <div className="pt-4 space-y-3">
          {appliedCodes.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="applied-promos">
              {appliedCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-2 bg-[var(--color-tt-surface-container-high)] border border-[var(--color-tt-gold)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-sm text-[var(--color-tt-ink)]"
                  data-testid={`applied-promo-${code}`}
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => handleRemovePromo(code)}
                    disabled={promoLoading}
                    aria-label={`Remove promo code ${code}`}
                    className="text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-danger)] transition-colors disabled:opacity-40"
                    data-testid={`promo-remove-${code}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleApplyPromo()
                }
              }}
              placeholder="PROMO CODE"
              className="flex-1 bg-white border border-[var(--color-tt-outline-variant)] text-[11px] font-bold tracking-[0.1em] px-4 py-3 outline-none uppercase text-[var(--color-tt-ink)] placeholder:text-[var(--color-tt-outline-variant)] focus:border-[var(--color-tt-gold)]"
              data-testid="promo-code-input"
              suppressHydrationWarning
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoCode.trim()}
              className="bg-[var(--color-tt-ink)] text-white px-6 text-[11px] font-bold tracking-widest uppercase hover:opacity-90 transition-opacity rounded-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[72px]"
              data-testid="promo-code-apply"
            >
              {promoLoading ? <Loader2 size={14} className="animate-spin" /> : 'APPLY'}
            </button>
          </div>

          {promoError && (
            <p
              className="text-[11px] font-medium text-[var(--color-tt-danger)]"
              data-testid="promo-error"
              role="alert"
            >
              {promoError}
            </p>
          )}

          {promoNote && !promoError && (
            <p
              className="text-[11px] font-medium text-[var(--color-tt-brown)]"
              data-testid="promo-note"
            >
              {promoNote}
            </p>
          )}
        </div>
      </div>

      {/* Authenticity badge */}
      <div className="mt-4 flex items-start gap-4 p-4 border border-[var(--color-tt-outline-variant)]/30 bg-white rounded-sm">
        <ShieldCheck size={20} className="text-[var(--color-tt-gold)] shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-tt-ink)]">
            Authenticity Guaranteed
          </p>
          <p className="text-[10px] text-[var(--color-tt-ink-muted)] leading-relaxed mt-1">
            All Treasure Trove heirlooms are verified for origin and quality craftsmanship.
          </p>
        </div>
      </div>
    </div>
  )
}
