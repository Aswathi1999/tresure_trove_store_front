import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCartStore } from '@/stores/cart'

vi.mock('@/stores/cart', () => ({
  useCartStore: vi.fn(),
}))

// AddToCartButton / BuyNowButton call useRouter; provide a stub so the selector
// renders in jsdom (no Next app-router context in unit tests).
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}))

import { VariantSelector } from './VariantSelector'

// Variants covering two materials, two sizes, two colours — all combos available.
// Each variant's selected values are keyed by the option's DISPLAY title.
const baseVariants = [
  {
    id: 'v1',
    title: 'Teak / S / Natural',
    options: { Material: 'Teak', Size: 'S', Colour: 'Natural' },
    price: 500,
    inventory: 10,
    available: true,
    sku: 'TK-S-NAT',
  },
  {
    id: 'v2',
    title: 'Teak / L / Natural',
    options: { Material: 'Teak', Size: 'L', Colour: 'Natural' },
    price: 700,
    inventory: 3,
    available: true,
    sku: 'TK-L-NAT',
  },
  {
    id: 'v3',
    title: 'Teak / S / Dark',
    options: { Material: 'Teak', Size: 'S', Colour: 'Dark' },
    price: 550,
    inventory: 7,
    available: true,
    sku: 'TK-S-DRK',
  },
  {
    id: 'v4',
    title: 'Walnut / S / Natural',
    options: { Material: 'Walnut', Size: 'S', Colour: 'Natural' },
    price: 650,
    inventory: 5,
    available: true,
    sku: 'WN-S-NAT',
  },
]

// Colour is the swatch axis; Material and Size are pill axes.
const baseAxes = [
  { title: 'Material', values: ['Teak', 'Walnut'], isSwatch: false },
  { title: 'Size', values: ['S', 'L'], isSwatch: false },
  { title: 'Colour', values: ['Natural', 'Dark'], isSwatch: true },
]

const baseProps = {
  variants: baseVariants,
  axes: baseAxes,
  swatchColors: { Natural: '#d4a574', Dark: '#5c3d2e' },
  productTitle: 'Ōkura Lounge Chair',
  imageUrl: 'https://cdn.example.com/chair.jpg',
}

// A single-variant product with no real choices (every axis collapses to one
// value, so no switcher renders) — used by the price-only / OOS tests.
const singleAxes = [
  { title: 'Material', values: ['Teak'], isSwatch: false },
  { title: 'Size', values: ['S'], isSwatch: false },
  { title: 'Colour', values: ['Natural'], isSwatch: true },
]

describe('VariantSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCartStore).mockReturnValue({
      isLoading: false,
      addItem: vi.fn(),
      openCart: vi.fn(),
      addItemLocal: vi.fn(),
    } as unknown as ReturnType<typeof useCartStore>)
  })

  describe('price display', () => {
    it('renders the price display container', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('price-display')).toBeInTheDocument()
    })

    it('shows the formatted price for the default variant', () => {
      render(<VariantSelector {...baseProps} />)
      // v1 is matched first (Teak / S / Natural) — price Rs. 500
      expect(screen.getByText('Rs. 500')).toBeInTheDocument()
    })

    it('shows the original price and discount when originalPrice is set', () => {
      const variantsWithDiscount = [
        {
          ...baseVariants[0]!,
          price: 800,
          originalPrice: 1000,
        },
      ]
      render(<VariantSelector {...baseProps} variants={variantsWithDiscount} axes={singleAxes} />)
      expect(screen.getByText('Rs. 800')).toBeInTheDocument()
      expect(screen.getByText('Rs. 1,000')).toBeInTheDocument()
      expect(screen.getByText(/20% off/i)).toBeInTheDocument()
    })

    it('does not show original price or discount when there is no originalPrice', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.queryByText(/%\s*off/i)).not.toBeInTheDocument()
    })
  })

  describe('colour (swatch) selector', () => {
    it('renders the swatch selector', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('finish-selector')).toBeInTheDocument()
    })

    it('renders a swatch for each colour value', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('finish-natural')).toBeInTheDocument()
      expect(screen.getByTestId('finish-dark')).toBeInTheDocument()
    })

    it('shows the selected colour name in the label', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      await user.click(screen.getByTestId('finish-dark'))
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    it('updates the price when the colour is changed', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      // Initial: Teak / S / Natural = Rs. 500
      expect(screen.getByText('Rs. 500')).toBeInTheDocument()
      await user.click(screen.getByTestId('finish-dark'))
      // After: Teak / S / Dark = Rs. 550
      expect(screen.getByText('Rs. 550')).toBeInTheDocument()
    })
  })

  describe('generic pill axes (any option name)', () => {
    it('renders a section for every multi-value option, labelled by its title', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('option-selector-material')).toBeInTheDocument()
      expect(screen.getByTestId('option-selector-size')).toBeInTheDocument()
    })

    it('renders a button for each value', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('option-material-teak')).toBeInTheDocument()
      expect(screen.getByTestId('option-material-walnut')).toBeInTheDocument()
      expect(screen.getByTestId('option-size-s')).toBeInTheDocument()
      expect(screen.getByTestId('option-size-l')).toBeInTheDocument()
    })

    it('renders an arbitrarily-named option (e.g. Weight) as its own axis', () => {
      const variants = [
        {
          id: 'w250',
          title: '250g',
          options: { Weight: '250g' },
          price: 300,
          inventory: 5,
          available: true,
          sku: 'W-250',
        },
        {
          id: 'w500',
          title: '500g',
          options: { Weight: '500g' },
          price: 500,
          inventory: 5,
          available: true,
          sku: 'W-500',
        },
      ]
      const axes = [{ title: 'Weight', values: ['250g', '500g'], isSwatch: false }]
      render(
        <VariantSelector
          variants={variants}
          axes={axes}
          swatchColors={{}}
          productTitle="Coffee"
          imageUrl=""
        />,
      )
      expect(screen.getByTestId('option-selector-weight')).toBeInTheDocument()
      expect(screen.getByTestId('option-weight-250g')).toBeInTheDocument()
      expect(screen.getByTestId('option-weight-500g')).toBeInTheDocument()
    })

    it('hides an option that has only one value', () => {
      render(
        <VariantSelector
          {...baseProps}
          axes={[{ title: 'Material', values: ['Teak'], isSwatch: false }, ...baseAxes.slice(1)]}
        />,
      )
      expect(screen.queryByTestId('option-selector-material')).not.toBeInTheDocument()
    })

    it('updates the price when a pill value is changed', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByText('Rs. 500')).toBeInTheDocument()
      await user.click(screen.getByTestId('option-size-l'))
      // After: Teak / L / Natural = Rs. 700
      expect(screen.getByText('Rs. 700')).toBeInTheDocument()
    })

    it('updates the price when the material is changed', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByText('Rs. 500')).toBeInTheDocument()
      await user.click(screen.getByTestId('option-material-walnut'))
      // After: Walnut / S / Natural = Rs. 650
      expect(screen.getByText('Rs. 650')).toBeInTheDocument()
    })
  })

  // The reported scenario: colours Red/Pink/Blue × sizes Small/Large, where
  // Small is only stocked for Red. Selecting a colour must disable the sizes
  // that colour doesn't carry, instead of leaving them active.
  describe('cross-axis availability (cascade)', () => {
    const mk = (
      id: string,
      Size: string,
      Colour: string,
      inventory: number,
    ): (typeof baseVariants)[number] => ({
      id,
      title: `${Colour} ${Size}`,
      options: { Material: 'Default', Size, Colour },
      price: Size === 'Large' ? 1200 : 1000,
      inventory,
      available: inventory > 0,
      sku: id,
    })

    const colourSizeVariants = [
      mk('r-s', 'Small', 'Red', 5),
      mk('r-l', 'Large', 'Red', 5),
      mk('p-s', 'Small', 'Pink', 0),
      mk('p-l', 'Large', 'Pink', 5),
      mk('b-s', 'Small', 'Blue', 0),
      mk('b-l', 'Large', 'Blue', 5),
    ]
    const colourSizeAxes = [
      { title: 'Material', values: ['Default'], isSwatch: false },
      { title: 'Size', values: ['Small', 'Large'], isSwatch: false },
      { title: 'Colour', values: ['Red', 'Pink', 'Blue'], isSwatch: true },
    ]
    const colourSizeProps = {
      variants: colourSizeVariants,
      axes: colourSizeAxes,
      swatchColors: { Red: '#b91c1c', Pink: '#ec4899', Blue: '#1d4ed8' },
      productTitle: 'Gladiolus Artificial Flower',
      imageUrl: 'https://cdn.example.com/gladiolus.jpg',
    }

    it('disables Small when Blue is selected (no Blue/Small in stock)', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...colourSizeProps} />)
      await user.click(screen.getByTestId('finish-blue'))
      expect(screen.getByTestId('option-size-small')).toBeDisabled()
      expect(screen.getByTestId('option-size-large')).not.toBeDisabled()
    })

    it('disables Small when Pink is selected (no Pink/Small in stock)', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...colourSizeProps} />)
      await user.click(screen.getByTestId('finish-pink'))
      expect(screen.getByTestId('option-size-small')).toBeDisabled()
      expect(screen.getByTestId('option-size-large')).not.toBeDisabled()
    })

    it('keeps both sizes active for Red (both in stock)', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...colourSizeProps} />)
      await user.click(screen.getByTestId('finish-red'))
      expect(screen.getByTestId('option-size-small')).not.toBeDisabled()
      expect(screen.getByTestId('option-size-large')).not.toBeDisabled()
    })
  })

  describe('quantity selector', () => {
    it('renders the quantity selector', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('quantity-selector')).toBeInTheDocument()
    })

    it('shows an initial quantity of 1', () => {
      render(<VariantSelector {...baseProps} />)
      expect(screen.getByTestId('quantity-value')).toHaveTextContent('1')
    })

    it('increments the quantity when the + button is clicked', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      await user.click(screen.getByTestId('quantity-increment'))
      expect(screen.getByTestId('quantity-value')).toHaveTextContent('2')
    })

    it('does not decrement the quantity below 1', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      await user.click(screen.getByTestId('quantity-decrement'))
      expect(screen.getByTestId('quantity-value')).toHaveTextContent('1')
    })

    it('increments and then decrements correctly', async () => {
      const user = userEvent.setup()
      render(<VariantSelector {...baseProps} />)
      await user.click(screen.getByTestId('quantity-increment'))
      await user.click(screen.getByTestId('quantity-increment'))
      expect(screen.getByTestId('quantity-value')).toHaveTextContent('3')
      await user.click(screen.getByTestId('quantity-decrement'))
      expect(screen.getByTestId('quantity-value')).toHaveTextContent('2')
    })

    it('disables quantity buttons when the active variant is out of stock', () => {
      const outOfStockVariants = [
        {
          id: 'v-oos',
          title: 'Teak / S / Natural',
          options: { Material: 'Teak', Size: 'S', Colour: 'Natural' },
          price: 500,
          inventory: 0,
          available: true,
          sku: 'TK-S-OOS',
        },
      ]
      render(<VariantSelector {...baseProps} variants={outOfStockVariants} axes={singleAxes} />)
      expect(screen.getByTestId('quantity-increment')).toBeDisabled()
      expect(screen.getByTestId('quantity-decrement')).toBeDisabled()
    })
  })
})
