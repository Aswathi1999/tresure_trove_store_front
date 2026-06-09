import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SearchProduct } from '@/lib/medusa'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} {...props} />,
}))

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const suggestion = (n: number): SearchProduct => ({
  id: `s${n}`,
  title: `Product ${n}`,
  price: `Rs. ${n * 1000}`,
  imageUrl: `/img${n}.jpg`,
  href: `/products/product-${n}`,
  priceAmount: n * 1000,
  category: 'Furniture',
})

const SUGGESTIONS = [1, 2, 3].map(suggestion)

// Mutable store state, reassigned in beforeEach
let mockState = {
  suggestions: [] as SearchProduct[],
  isDropdownOpen: false,
  selectedIndex: -1,
  closeDropdown: vi.fn(),
  setQuery: vi.fn(),
}

vi.mock('@/stores/search', () => ({
  useSearchStore: () => mockState,
}))

import { AutocompleteDropdown } from './AutocompleteDropdown'

describe('AutocompleteDropdown', () => {
  beforeEach(() => {
    pushMock.mockReset()
    mockState = {
      suggestions: [],
      isDropdownOpen: false,
      selectedIndex: -1,
      closeDropdown: vi.fn(),
      setQuery: vi.fn(),
    }
  })

  it('renders nothing when isDropdownOpen is false', () => {
    mockState.suggestions = SUGGESTIONS
    mockState.isDropdownOpen = false
    const { container } = render(<AutocompleteDropdown />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when suggestions is empty even if dropdown is open', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = []
    const { container } = render(<AutocompleteDropdown />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the dropdown when open with suggestions', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown />)
    expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument()
  })

  it('renders one item per suggestion', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown />)
    expect(screen.getByTestId('autocomplete-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('autocomplete-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('autocomplete-item-2')).toBeInTheDocument()
  })

  it('shows the product title in each item', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown />)
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
  })

  it('shows the product price in each item', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = [suggestion(5)]
    render(<AutocompleteDropdown />)
    expect(screen.getByText('Rs. 5000')).toBeInTheDocument()
  })

  it('shows the product image', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = [suggestion(1)]
    render(<AutocompleteDropdown />)
    expect(screen.getByAltText('Product 1')).toBeInTheDocument()
  })

  it('highlights the item at selectedIndex', () => {
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    mockState.selectedIndex = 1
    render(<AutocompleteDropdown />)
    expect(screen.getByTestId('autocomplete-item-1').className).toMatch(/surface-container/)
  })

  it('clicking an item navigates to /search?q=<title>', async () => {
    const user = userEvent.setup()
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown />)
    await user.click(screen.getByTestId('autocomplete-item-0'))
    expect(pushMock).toHaveBeenCalledWith(`/search?q=${encodeURIComponent('Product 1')}`)
  })

  it('clicking an item calls closeDropdown', async () => {
    const user = userEvent.setup()
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown />)
    await user.click(screen.getByTestId('autocomplete-item-0'))
    expect(mockState.closeDropdown).toHaveBeenCalledTimes(1)
  })

  it('clicking an item clears the query via setQuery', async () => {
    const user = userEvent.setup()
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown />)
    await user.click(screen.getByTestId('autocomplete-item-0'))
    expect(mockState.setQuery).toHaveBeenCalledWith('')
  })

  it('calls the onClose prop when an item is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    mockState.isDropdownOpen = true
    mockState.suggestions = SUGGESTIONS
    render(<AutocompleteDropdown onClose={onClose} />)
    await user.click(screen.getByTestId('autocomplete-item-0'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
