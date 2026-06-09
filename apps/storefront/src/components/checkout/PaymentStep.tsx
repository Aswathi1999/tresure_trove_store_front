'use client'

import { useEffect, useState } from 'react'
import { Loader2, CreditCard, Wallet, Building2, Banknote, AlertCircle } from 'lucide-react'
import { formatPrice, calcGst } from '@/lib/cart-types'
import { useCartStore } from '@/stores/cart'
import {
  completeOrderAction,
  getAppliedPromotionsAction,
  initiateRazorpaySession,
  restoreCartItemsAction,
} from '@/actions/checkout'
import { loadRazorpayScript, openRazorpayCheckout, RazorpayDismissedError } from '@/lib/razorpay'
import type { MockAddress, MockShippingOption, MockOrder } from '@/lib/checkout.mock'

const INR_METHODS = [
  { id: 'upi', label: 'UPI (GPay, PhonePe)', icon: Wallet },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
] as const

interface Props {
  address: MockAddress
  shippingOption: MockShippingOption
  onSuccess: (order: MockOrder) => void
  onBack: () => void
  currency?: 'INR' | 'USD' | 'AED'
}

export default function PaymentStep({
  address,
  shippingOption,
  onSuccess,
  onBack,
  currency = 'INR',
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string>(
    currency === 'INR' ? 'card' : 'stripe',
  )
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const allItems = useCartStore((state) => state.items)
  const selectedIds = useCartStore((state) => state.selectedIds)
  const cartId = useCartStore((state) => state.cartId)
  const items = allItems.filter((i) => selectedIds.includes(i.id))
  const unselectedLineItemIds = allItems.filter((i) => !selectedIds.includes(i.id)).map((i) => i.id)
  // Same unselected items as variant + quantity, so a completed order can keep
  // them in the cart for next time.
  const unselectedItems = allItems
    .filter((i) => !selectedIds.includes(i.id))
    .map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  // Pre-tax promo discounts (goods + shipping); GST is charged on the discounted
  // base and shipping is reduced by any free-shipping promo, to match Medusa.
  const [discount, setDiscount] = useState(0)
  const [shippingDiscount, setShippingDiscount] = useState(0)
  const taxable = Math.max(0, subtotal - discount)
  const effectiveShipping = Math.max(0, shippingOption.price - shippingDiscount)
  const total = taxable + calcGst(taxable + effectiveShipping) + effectiveShipping

  // Reflect any promo discount applied to the cart on the Place Order total.
  useEffect(() => {
    if (!cartId) return
    let live = true
    getAppliedPromotionsAction(cartId).then((res) => {
      if (!live) return
      setShippingDiscount(res.shippingDiscount)
      setDiscount(Math.max(0, res.discountSubtotal - res.shippingDiscount))
    })
    return () => {
      live = false
    }
  }, [cartId])

  async function handlePlaceOrder() {
    setProcessing(true)
    setPaymentError(null)
    // Items the Razorpay path trimmed from the cart to match the selected
    // subtotal. If payment doesn't go through, we put them back below.
    let removedItems: { variantId: string; quantity: number }[] = []
    try {
      let razorpay: { paymentId: string; orderId: string; signature: string } | undefined

      // INR online methods (UPI / Card / Net Banking) pay via the Razorpay modal
      // before the order is completed. COD and non-INR (Stripe) skip this.
      if (currency === 'INR' && selectedMethod !== 'cod') {
        if (!process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID']) {
          throw new Error(
            'Online payments are not configured yet. Please choose Cash on Delivery, or contact support.',
          )
        }
        if (!cartId) {
          throw new Error('Your cart could not be found. Please refresh and try again.')
        }
        await loadRazorpayScript()
        // Pass the unselected items so the Razorpay order is created for the
        // SELECTED subtotal only — not the whole cart.
        const session = await initiateRazorpaySession(cartId, unselectedLineItemIds)
        removedItems = session.removedItems ?? []
        const tokens = await openRazorpayCheckout({
          orderId: session.razorpayOrderId,
          amount: session.amount,
          currency: session.currency,
          prefill: {
            name: address.fullName,
            email: address.email,
            contact: address.phone,
          },
        })
        razorpay = {
          paymentId: tokens.razorpay_payment_id,
          orderId: tokens.razorpay_order_id,
          signature: tokens.razorpay_signature,
        }
      }

      const order = await completeOrderAction(
        address,
        shippingOption,
        items,
        currency,
        selectedMethod,
        unselectedLineItemIds,
        razorpay,
        unselectedItems,
      )
      // Reload the cart from the server: it now contains only the items left
      // unchecked (or is empty if everything was ordered). Re-select them so
      // they're ready for the next checkout.
      await useCartStore.getState().initCart()
      useCartStore.getState().selectAll()
      onSuccess(order)
    } catch (err) {
      // Payment didn't complete: restore any items we trimmed for the Razorpay
      // order so the customer doesn't lose them. Keep them DESELECTED (initCart
      // auto-selects new lines) so a retry still charges only the original
      // selection.
      if (removedItems.length > 0 && cartId) {
        await restoreCartItemsAction(cartId, removedItems).catch(() => {})
        await useCartStore.getState().initCart()
        const present = new Set(useCartStore.getState().items.map((i) => i.id))
        useCartStore.setState({ selectedIds: selectedIds.filter((id) => present.has(id)) })
      }
      if (err instanceof RazorpayDismissedError) {
        setPaymentError('Payment cancelled. Please try again.')
      } else {
        setPaymentError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section data-testid="payment-step">
      <div className="flex items-center gap-6 mb-8">
        <span className="w-8 h-8 flex items-center justify-center bg-[var(--color-tt-ink)] text-white font-bold text-sm shrink-0">
          3
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-[var(--color-tt-ink)]">
          Payment
        </h2>
      </div>

      <div className="pl-0 sm:pl-14 space-y-6">
        {/* Payment failure error */}
        {paymentError && (
          <div
            className="flex items-start gap-3 p-4 border border-[var(--color-tt-danger)] bg-red-50"
            data-testid="payment-error"
            role="alert"
          >
            <AlertCircle size={18} className="text-[var(--color-tt-danger)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-tt-danger)]">Payment failed</p>
              <p className="text-xs text-[var(--color-tt-danger)]/80 mt-0.5">{paymentError}</p>
            </div>
          </div>
        )}

        {/* INR: Razorpay-style method selector */}
        {currency === 'INR' && (
          <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Payment method">
            {INR_METHODS.map(({ id, label, icon: Icon }) => {
              const isSelected = selectedMethod === id
              return (
                <label
                  key={id}
                  className={[
                    'flex items-center justify-between p-4 border cursor-pointer transition-all rounded-sm',
                    isSelected
                      ? 'border-[var(--color-tt-gold)] bg-[var(--color-tt-surface-container)]'
                      : 'border-[var(--color-tt-outline-variant)] hover:bg-[var(--color-tt-surface-container)]',
                  ].join(' ')}
                  data-testid={`payment-method-${id}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={isSelected}
                      onChange={() => setSelectedMethod(id)}
                      className="accent-[var(--color-tt-gold)]"
                      data-testid={`payment-radio-${id}`}
                    />
                    <span className="text-sm font-semibold tracking-widest uppercase text-[var(--color-tt-ink)]">
                      {label}
                    </span>
                  </div>
                  <Icon
                    size={20}
                    className={
                      isSelected
                        ? 'text-[var(--color-tt-gold)]'
                        : 'text-[var(--color-tt-ink-muted)]'
                    }
                  />
                </label>
              )
            })}
          </div>
        )}

        {/* USD / AED: Stripe card element */}
        {currency !== 'INR' && (
          <div
            className="border border-[var(--color-tt-outline-variant)] p-5 space-y-4"
            data-testid="stripe-card-element"
          >
            <p className="text-[11px] font-bold tracking-[0.15em] text-[var(--color-tt-ink-muted)] uppercase">
              Card Details (Stripe)
            </p>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full bg-white border border-[var(--color-tt-outline-variant)] px-4 py-3 text-sm text-[var(--color-tt-ink)] outline-none focus:border-[var(--color-tt-gold)] rounded-sm"
              data-testid="stripe-card-number"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM / YY"
                className="w-full bg-white border border-[var(--color-tt-outline-variant)] px-4 py-3 text-sm text-[var(--color-tt-ink)] outline-none focus:border-[var(--color-tt-gold)] rounded-sm"
                data-testid="stripe-card-expiry"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full bg-white border border-[var(--color-tt-outline-variant)] px-4 py-3 text-sm text-[var(--color-tt-ink)] outline-none focus:border-[var(--color-tt-gold)] rounded-sm"
                data-testid="stripe-card-cvv"
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={processing}
            className="w-full bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] py-5 text-sm font-bold tracking-[0.25em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            data-testid="place-order-button"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                PROCESSING…
              </>
            ) : (
              `PLACE ORDER — ${formatPrice(total)}`
            )}
          </button>

          {paymentError && (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] py-4 text-xs font-bold tracking-[0.20em] uppercase hover:bg-[var(--color-tt-surface-container)] transition-colors disabled:opacity-50"
              data-testid="retry-payment-button"
            >
              TRY AGAIN
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="block text-xs font-bold tracking-widest text-[var(--color-tt-ink-muted)] uppercase hover:text-[var(--color-tt-ink)] transition-colors"
            data-testid="payment-back-button"
          >
            ← BACK TO SHIPPING
          </button>
        </div>

        <p className="text-[10px] text-center text-[var(--color-tt-ink-muted)] tracking-[0.05em]">
          By clicking &quot;Place Order&quot; you agree to Treasure Trove&apos;s Terms of Service
          and Privacy Policy.
        </p>
      </div>
    </section>
  )
}
