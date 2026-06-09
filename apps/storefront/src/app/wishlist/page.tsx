import { WishlistGrid } from '@/components/account/WishlistGrid'
import { WishlistHeader } from '@/components/account/WishlistHeader'
import { Breadcrumb } from '@/components/products/Breadcrumb'

export const metadata = {
  title: 'Wishlist — Treasure Trove',
}

export default function WishlistTopLevelPage() {
  return (
    <div data-testid="wishlist-page">
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />
      </div>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <WishlistHeader />
        <WishlistGrid />
      </div>
    </div>
  )
}
