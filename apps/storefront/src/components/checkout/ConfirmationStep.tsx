'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, CreditCard } from 'lucide-react'
import { formatPrice, calcGst } from '@/lib/cart-types'
import type { MockOrder } from '@/lib/checkout.mock'

interface Props {
  order: MockOrder
}

export default function ConfirmationStep({ order }: Props) {
  const { address } = order
  const discount = order.discount ?? 0
  // `discount` is the PRE-TAX promo discount, so GST is charged on the discounted
  // goods + shipping — matching how Medusa totals the order.
  const taxable = Math.max(0, order.subtotal - discount)
  const gst = calcGst(taxable + order.shipping)
  const grandTotal = taxable + gst + order.shipping

  function handleViewOrder() {
    const detailsSection = document.getElementById('order-details')
    if (detailsSection) {
      detailsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div data-testid="confirmation-step">
      {/* Hero success band */}
      <section className="bg-[var(--color-tt-surface-container)] py-16 sm:py-24 rounded-sm mb-12">
        <div className="max-w-2xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-tt-gold)] flex items-center justify-center mb-8">
            <Check size={28} strokeWidth={3} className="text-[var(--color-tt-ink)]" />
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-tt-ink)] mb-4 tracking-[0.06em] uppercase"
            data-testid="confirmation-heading"
          >
            Order Placed.
          </h1>
          <p className="text-base text-[var(--color-tt-ink-muted)] max-w-lg mb-2">
            Thank you. Your order{' '}
            <span
              className="font-semibold text-[var(--color-tt-ink)]"
              data-testid="confirmation-order-id"
            >
              #{order.id}
            </span>{' '}
            is confirmed. We&apos;re preparing your treasures for their journey home.
          </p>
          <p className="text-[15px] text-[var(--color-tt-ink-muted)] mt-2 leading-relaxed">
            A copy of your invoice has been sent to your email address.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full justify-center">
            <Link
              href="/products"
              className="px-8 py-4 border border-[var(--color-tt-outline-variant)] text-sm font-bold tracking-[0.10em] uppercase hover:bg-[var(--color-tt-surface-container-highest,#ebe1d7)] transition-all text-center"
              data-testid="continue-shopping-link"
            >
              CONTINUE SHOPPING
            </Link>
            <button
              type="button"
              onClick={handleViewOrder}
              className="px-8 py-4 border border-[var(--color-tt-outline-variant)] text-sm font-bold tracking-[0.10em] uppercase hover:bg-[var(--color-tt-surface-container-highest,#ebe1d7)] transition-all"
              data-testid="view-order-button"
            >
              VIEW ORDER
            </button>
          </div>
        </div>
      </section>

      {/* Details grid */}
      <section id="order-details" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: delivery details */}
        <div className="lg:col-span-7">
          <h2 className="text-xl font-bold tracking-[0.10em] uppercase border-b border-[var(--color-tt-outline-variant)] pb-4 mb-10 text-[var(--color-tt-ink)]">
            Delivery Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.10em] uppercase text-[var(--color-tt-gold)] mb-3">
                Shipping Address
              </p>
              <address className="not-italic text-[var(--color-tt-ink-muted)] text-sm leading-relaxed">
                {address.fullName}
                <br />
                {address.addressLine1}
                {address.addressLine2 && (
                  <>
                    <br />
                    {address.addressLine2}
                  </>
                )}
                <br />
                {address.city}, {address.state}
                <br />
                {address.pincode}, {address.country}
              </address>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.10em] uppercase text-[var(--color-tt-gold)] mb-3">
                Estimated Arrival
              </p>
              <p className="text-[var(--color-tt-ink-muted)] text-sm">
                {order.shippingOption.estimatedDelivery}
              </p>
              <p className="text-[11px] mt-2 text-[var(--color-tt-brown)] font-semibold tracking-[0.10em] uppercase">
                {order.shippingOption.name}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.10em] uppercase text-[var(--color-tt-gold)] mb-3">
                Payment Method
              </p>
              <div className="flex items-center gap-3 text-[var(--color-tt-ink-muted)] text-sm">
                <CreditCard size={18} />
                <span>Secure payment via {order.currency === 'INR' ? 'Razorpay' : 'Stripe'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-5">
          <div
            className="bg-white border border-[var(--color-tt-outline-variant)]/40 p-8 shadow-[0_20px_40px_rgba(31,27,22,0.05)]"
            data-testid="confirmation-order-summary"
          >
            <h2 className="text-xl font-bold tracking-[0.10em] uppercase mb-8 text-[var(--color-tt-ink)]">
              Order Summary
            </h2>

            <div className="space-y-6 mb-8">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-[var(--color-tt-surface-container)] overflow-hidden rounded-sm shrink-0 relative flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <span className="text-[10px] text-[var(--color-tt-outline-variant)] text-center px-1">
                          No image
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-wider uppercase text-[var(--color-tt-ink)]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--color-tt-ink-muted)] tracking-wider uppercase mt-0.5">
                        QTY: {item.quantity}
                        {item.variant ? ` · ${item.variant}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-tt-ink)] shrink-0 ml-4">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-[var(--color-tt-outline-variant)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-tt-ink-muted)] tracking-wider uppercase">
                  Subtotal
                </span>
                <span className="font-medium text-[var(--color-tt-ink)]">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm" data-testid="confirmation-discount">
                  <span className="text-[var(--color-tt-brown)] tracking-wider uppercase">
                    Discount
                  </span>
                  <span className="font-medium text-[var(--color-tt-brown)]">
                    −{formatPrice(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-tt-ink-muted)] tracking-wider uppercase">
                  GST (12%)
                </span>
                <span className="font-medium text-[var(--color-tt-ink)]">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-tt-ink-muted)] tracking-wider uppercase">
                  Shipping
                </span>
                <span className="font-medium text-[var(--color-tt-brown)] uppercase">
                  {order.shipping === 0 ? 'Complimentary' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4 border-t border-[var(--color-tt-outline-variant)]">
                <span className="tracking-widest uppercase text-[var(--color-tt-ink)]">Total</span>
                <span className="text-[var(--color-tt-gold)]">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
