import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWishlistStore, type WishlistItem } from '@/stores/wishlist'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...(rest as Record<string, unknown>)} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import { WishlistGrid } from './WishlistGrid'

// Prices are plain INR rupees here (the store/`getBasePrice` output), so they
// render straight through `toLocaleString('en-IN')` without any /100 scaling.
const ITEMS: WishlistItem[] = [
  {
    id: 'wish_01',
    title: 'Ōkura Lounge Chair',
    price: 19800,
    imageUrl: 'https://cdn.example.com/chair.jpg',
    handle: 'okura-lounge-chair',
  },
  {
    id: 'wish_02',
    title: 'Handcrafted Brass Pendant',
    price: 7600,
    originalPrice: 9500,
    imageUrl: '',
    handle: 'handcrafted-brass-pendant',
  },
]

// The component reads from the Zustand store, not props — seed the store before
// each test and reset it afterwards so cases don't leak into one another.
function seed(items: WishlistItem[]) {
  useWishlistStore.setState({ items, userId: null })
}

beforeEach(() => {
  useWishlistStore.setState({ items: [], userId: null })
})

describe('WishlistGrid', () => {
  it('renders all wishlist items', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    expect(screen.getByTestId('wishlist-item-wish_01')).toBeInTheDocument()
    expect(screen.getByTestId('wishlist-item-wish_02')).toBeInTheDocument()
  })

  it('displays item names', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    expect(screen.getByText('Ōkura Lounge Chair')).toBeInTheDocument()
    expect(screen.getByText('Handcrafted Brass Pendant')).toBeInTheDocument()
  })

  it('displays current prices', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    expect(screen.getByText('₹19,800')).toBeInTheDocument()
    expect(screen.getByText('₹7,600')).toBeInTheDocument()
  })

  it('displays original price with strikethrough when present', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    expect(screen.getByText('₹9,500')).toBeInTheDocument()
  })

  it('shows "No Image" placeholder when imageUrl is empty', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('links to the product detail page via handle', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    const links = screen.getAllByRole('link')
    const chairLink = links.find((l) => l.getAttribute('href') === '/products/okura-lounge-chair')
    expect(chairLink).toBeTruthy()
  })

  it('removes an item when its remove button is clicked', async () => {
    const user = userEvent.setup()
    seed(ITEMS)
    render(<WishlistGrid />)

    await user.click(screen.getByTestId('remove-wishlist-wish_01'))

    expect(screen.queryByTestId('wishlist-item-wish_01')).not.toBeInTheDocument()
    expect(screen.getByTestId('wishlist-item-wish_02')).toBeInTheDocument()
  })

  it('shows empty state when all items are removed', async () => {
    const user = userEvent.setup()
    seed([ITEMS[0]])
    render(<WishlistGrid />)

    await user.click(screen.getByTestId('remove-wishlist-wish_01'))

    expect(screen.getByTestId('wishlist-empty')).toBeInTheDocument()
    expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument()
  })

  it('shows "Discover Products" link in empty state pointing to /products', () => {
    seed([])
    render(<WishlistGrid />)
    const link = screen.getByRole('link', { name: /discover products/i })
    expect(link).toHaveAttribute('href', '/products')
  })

  it('renders wishlist-grid container with correct testid when items exist', () => {
    seed(ITEMS)
    render(<WishlistGrid />)
    expect(screen.getByTestId('wishlist-grid')).toBeInTheDocument()
  })
})
