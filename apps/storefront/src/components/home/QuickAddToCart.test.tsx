import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const addItem = vi.fn().mockResolvedValue(undefined)
const openCart = vi.fn()
vi.mock('@/stores/cart', () => ({
  useCartStore: (selector: (s: { addItem: unknown; openCart: unknown }) => unknown) =>
    selector({ addItem, openCart }),
}))

const isUserAuthenticated = vi.fn()
vi.mock('@/lib/auth/actions', () => ({
  isUserAuthenticated: () => isUserAuthenticated(),
}))

const setPendingCartAdd = vi.fn()
vi.mock('@/lib/pending-cart', () => ({
  setPendingCartAdd: (id: string) => setPendingCartAdd(id),
}))

import { QuickAddToCart } from './QuickAddToCart'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('QuickAddToCart', () => {
  it('adds the variant and opens the cart drawer for a logged-in shopper', async () => {
    isUserAuthenticated.mockResolvedValue(true)
    const user = userEvent.setup()
    render(
      <QuickAddToCart
        productId="prod_01"
        productHref="/products/chair"
        variantId="variant_01"
        quickAdd
      />,
    )

    await user.click(screen.getByTestId('add-to-cart-prod_01'))

    await waitFor(() => expect(addItem).toHaveBeenCalledWith('variant_01', 1))
    expect(openCart).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    expect(setPendingCartAdd).not.toHaveBeenCalled()
  })

  it('sends a guest to /login (remembering the item) instead of adding', async () => {
    isUserAuthenticated.mockResolvedValue(false)
    const user = userEvent.setup()
    render(
      <QuickAddToCart
        productId="prod_01"
        productHref="/products/chair"
        variantId="variant_01"
        quickAdd
      />,
    )

    await user.click(screen.getByTestId('add-to-cart-prod_01'))

    await waitFor(() => expect(setPendingCartAdd).toHaveBeenCalledWith('variant_01'))
    expect(push).toHaveBeenCalledWith('/login?redirect=/')
    expect(addItem).not.toHaveBeenCalled()
    expect(openCart).not.toHaveBeenCalled()
  })

  it('routes to the PDP (no auth check, no add) when not quick-addable', async () => {
    const user = userEvent.setup()
    render(
      <QuickAddToCart
        productId="prod_02"
        productHref="/products/sofa"
        variantId="variant_02"
        quickAdd={false}
      />,
    )

    await user.click(screen.getByTestId('add-to-cart-prod_02'))

    expect(push).toHaveBeenCalledWith('/products/sofa')
    expect(addItem).not.toHaveBeenCalled()
    expect(isUserAuthenticated).not.toHaveBeenCalled()
  })

  it('labels the button "Add to Cart" when quick-addable and "Select Options" otherwise', () => {
    const { rerender } = render(
      <QuickAddToCart productId="p" productHref="/p" variantId="v" quickAdd />,
    )
    expect(screen.getByTestId('add-to-cart-p')).toHaveTextContent('Add to Cart')

    rerender(<QuickAddToCart productId="p" productHref="/p" quickAdd={false} />)
    expect(screen.getByTestId('add-to-cart-p')).toHaveTextContent('Select Options')
  })
})
