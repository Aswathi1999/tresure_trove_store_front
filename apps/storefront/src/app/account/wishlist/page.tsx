import { WishlistGrid } from '@/components/account/WishlistGrid'
import { WishlistHeader } from '@/components/account/WishlistHeader'

export const metadata = {
  title: 'Wishlist — Treasure Trove',
}

export default function WishlistPage() {
  return (
    <div data-testid="wishlist-page">
      <WishlistHeader />
      <WishlistGrid />
    </div>
  )
}
