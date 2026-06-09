import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'
import { getCustomerOrder } from '@/lib/account'
import { formatPrice } from '@/lib/cart-types'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = await getCustomerOrder(id)
  if (!order) notFound()

  const addr = order.shippingAddress

  return (
    <div data-testid="order-detail-page">
      {/* Back */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] transition-colors mb-6"
        data-testid="order-back-link"
      >
        <ArrowLeft size={12} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
            Order
          </p>
          <h1 className="text-xl font-bold text-[var(--color-tt-ink)]">{order.number}</h1>
          <p className="text-sm text-[var(--color-tt-ink-muted)] mt-0.5">Placed on {order.date}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: items + address */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Line items */}
          <section
            className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm"
            data-testid="order-items"
          >
            <div className="px-5 py-4 border-b border-[var(--color-tt-outline-variant)]/50">
              <h2 className="text-[12px] font-bold tracking-[0.12em] uppercase text-[var(--color-tt-ink)]">
                Items Ordered
              </h2>
            </div>
            <ul className="divide-y divide-[var(--color-tt-outline-variant)]/40">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  data-testid={`order-item-${item.id}`}
                  className="flex items-start gap-4 px-5 py-4"
                >
                  <div className="w-16 h-16 bg-[var(--color-tt-surface-container)] rounded-sm shrink-0 flex items-center justify-center text-[var(--color-tt-outline)] text-[10px] tracking-wide uppercase">
                    No img
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[var(--color-tt-ink)] leading-snug">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-[13px] text-[var(--color-tt-ink-muted)] mt-0.5">
                        {item.variant}
                      </p>
                    )}
                    <p className="text-[13px] text-[var(--color-tt-ink-muted)] mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-tt-ink)] whitespace-nowrap">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="px-5 py-4 border-t border-[var(--color-tt-outline-variant)]/50 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-[var(--color-tt-ink-muted)]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--color-tt-ink-muted)]">
                <span>Shipping</span>
                {order.shipping > 0 ? (
                  <span>{formatPrice(order.shipping)}</span>
                ) : (
                  <span className="text-green-700 font-semibold">Free</span>
                )}
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm text-[var(--color-tt-ink-muted)]">
                  <span>Tax (GST)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-[var(--color-tt-ink-muted)]">
                  <span>Discount</span>
                  <span className="text-green-700 font-semibold">
                    −{formatPrice(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[var(--color-tt-ink)] pt-2 border-t border-[var(--color-tt-outline-variant)]/50">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Shipping address */}
          {addr && (
            <section
              className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm"
              data-testid="order-shipping-address"
            >
              <div className="px-5 py-4 border-b border-[var(--color-tt-outline-variant)]/50">
                <h2 className="text-[12px] font-bold tracking-[0.12em] uppercase text-[var(--color-tt-ink)]">
                  Shipping Address
                </h2>
              </div>
              <div className="px-5 py-4 text-sm text-[var(--color-tt-ink-muted)] space-y-0.5">
                <p className="font-semibold text-[var(--color-tt-ink)]">{addr.fullName}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.state} — {addr.pin}
                </p>
                <p>{addr.country}</p>
                {addr.phone && <p className="pt-1">{addr.phone}</p>}
              </div>
            </section>
          )}
        </div>

        {/* Right column: status timeline */}
        <div>
          <section
            className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm"
            data-testid="order-timeline"
          >
            <div className="px-5 py-4 border-b border-[var(--color-tt-outline-variant)]/50">
              <h2 className="text-[12px] font-bold tracking-[0.12em] uppercase text-[var(--color-tt-ink)]">
                Order Status
              </h2>
            </div>
            <ul className="px-5 py-5 flex flex-col gap-0">
              {order.timeline.map((event, idx) => (
                <li key={idx} data-testid={`timeline-event-${idx}`} className="flex gap-3 relative">
                  {/* vertical line */}
                  {idx < order.timeline.length - 1 && (
                    <div
                      className={`absolute left-[10px] top-5 w-[2px] h-full -mb-1 ${
                        event.completed
                          ? 'bg-[var(--color-tt-ink)]'
                          : 'bg-[var(--color-tt-outline-variant)]'
                      }`}
                    />
                  )}
                  <div className="shrink-0 mt-0.5">
                    {event.completed ? (
                      <CheckCircle size={20} className="text-[var(--color-tt-ink)]" />
                    ) : (
                      <Circle size={20} className="text-[var(--color-tt-outline-variant)]" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`text-[13px] font-bold leading-snug ${
                        event.completed
                          ? 'text-[var(--color-tt-ink)]'
                          : 'text-[var(--color-tt-outline)]'
                      }`}
                    >
                      {event.label}
                    </p>
                    {event.date && (
                      <p className="text-[12px] text-[var(--color-tt-ink-muted)] mt-0.5">
                        {event.date}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {order.tracking.length > 0 && (
              <div
                className="px-5 py-4 border-t border-[var(--color-tt-outline-variant)]/50"
                data-testid="order-tracking"
              >
                <h3 className="text-[12px] font-bold tracking-[0.12em] uppercase text-[var(--color-tt-ink)] mb-3">
                  Tracking
                </h3>
                <ul className="flex flex-col gap-2">
                  {order.tracking.map((trk, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-[var(--color-tt-ink)] break-all">
                        {trk.number}
                      </span>
                      {trk.url && (
                        <a
                          href={trk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[12px] font-bold tracking-[0.1em] uppercase text-[var(--color-tt-orange)] hover:underline"
                        >
                          Track
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
