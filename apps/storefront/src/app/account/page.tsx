import Link from 'next/link'
import { ShoppingBag, MapPin, Heart, ArrowRight } from 'lucide-react'
import { getCustomer, getCustomerOrders, getCustomerAddresses } from '@/lib/account'
import { formatPrice } from '@/lib/cart-types'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'
import { WishlistCount } from '@/components/account/WishlistCount'

export default async function AccountDashboardPage() {
  const [customer, orders, addresses] = await Promise.all([
    getCustomer(),
    getCustomerOrders(),
    getCustomerAddresses(),
  ])

  const recentOrders = orders.slice(0, 2)
  const firstName = customer?.firstName ?? ''
  const lastName = customer?.lastName ?? ''
  const email = customer?.email ?? ''

  return (
    <div data-testid="account-dashboard">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-tt-outline)] mb-1">
          Welcome back
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-tt-ink)]">
          {firstName} {lastName}
        </h1>
        <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1">{email}</p>
        <span className="sr-only" data-testid="account-session-state">
          Signed in
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div
          data-testid="dashboard-orders-card"
          className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm p-5 text-center"
        >
          <ShoppingBag size={20} className="mx-auto mb-2 text-[var(--color-tt-outline)]" />
          <p className="text-2xl font-bold text-[var(--color-tt-ink)]">{orders.length}</p>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-ink-muted)] mt-0.5">
            Orders
          </p>
        </div>
        <div
          data-testid="dashboard-addresses-card"
          className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm p-5 text-center"
        >
          <MapPin size={20} className="mx-auto mb-2 text-[var(--color-tt-outline)]" />
          <p className="text-2xl font-bold text-[var(--color-tt-ink)]">{addresses.length}</p>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-ink-muted)] mt-0.5">
            Addresses
          </p>
        </div>
        <div
          data-testid="dashboard-wishlist-card"
          className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm p-5 text-center"
        >
          <Heart size={20} className="mx-auto mb-2 text-[var(--color-tt-outline)]" />
          <p className="text-2xl font-bold text-[var(--color-tt-ink)]">
            <WishlistCount />
          </p>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-ink-muted)] mt-0.5">
            Wishlist
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink)]">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            data-testid="dashboard-view-all-orders"
            className="flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-orange)] hover:underline"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]">
              No orders yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                data-testid={`dashboard-order-${order.id}`}
                className="flex items-center justify-between bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm px-5 py-4 hover:border-[var(--color-tt-outline)] transition-colors group"
              >
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-[var(--color-tt-ink)] uppercase">
                    {order.number}
                  </p>
                  <p className="text-[11px] text-[var(--color-tt-outline)] mt-0.5">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-[var(--color-tt-ink)]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <ArrowRight
                    size={14}
                    className="text-[var(--color-tt-outline)] group-hover:text-[var(--color-tt-ink)] transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink)] mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'My Orders', href: '/account/orders', icon: ShoppingBag },
            { label: 'Addresses', href: '/account/addresses', icon: MapPin },
            { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm px-4 py-3 text-sm font-semibold text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] hover:border-[var(--color-tt-outline)] transition-colors"
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
