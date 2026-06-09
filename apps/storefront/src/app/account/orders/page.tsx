import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getCustomerOrders } from '@/lib/account'
import { formatPrice } from '@/lib/cart-types'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'

export const metadata = {
  title: 'My Orders — Treasure Trove',
}

export default async function OrdersPage() {
  const orders = await getCustomerOrders()

  return (
    <div data-testid="orders-page">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
          My Account
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-tt-ink)]">Order History</h1>
        <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          data-testid="orders-empty"
          className="flex flex-col items-center justify-center py-24 text-center bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm"
        >
          <p className="text-lg font-bold text-[var(--color-tt-ink)] mb-2">No orders yet</p>
          <p className="text-sm text-[var(--color-tt-ink-muted)] mb-6">
            When you place an order, it will appear here.
          </p>
          <Link
            href="/collections"
            className="text-[13px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-orange)] hover:underline"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3" data-testid="orders-list">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              data-testid={`order-row-${order.id}`}
              className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm hover:border-[var(--color-tt-outline)] transition-colors group"
            >
              {/* Order header row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-tt-outline-variant)]/50">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[15px] font-bold tracking-wide text-[var(--color-tt-ink)]">
                      {order.number}
                    </p>
                    <p className="text-[13px] text-[var(--color-tt-ink-muted)] mt-0.5">
                      {order.date}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink-muted)] mb-0.5">
                      Total
                    </p>
                    <p className="text-[15px] font-bold text-[var(--color-tt-ink)]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <ArrowRight
                    size={14}
                    className="text-[var(--color-tt-outline)] group-hover:text-[var(--color-tt-ink)] transition-colors"
                  />
                </div>
              </div>

              {/* Items preview */}
              <div className="px-5 py-3">
                <p className="text-[13px] text-[var(--color-tt-ink-muted)] leading-relaxed">
                  {order.items
                    .slice(0, 2)
                    .map((item) => item.name)
                    .join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                </p>
                <p className="sm:hidden text-[15px] font-bold text-[var(--color-tt-ink)] mt-1">
                  {formatPrice(order.total)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
