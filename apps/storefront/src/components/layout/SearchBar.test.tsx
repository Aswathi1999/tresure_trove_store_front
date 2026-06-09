import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SearchProduct } from '@/lib/medusa'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// Mutable store state, reassigned in beforeEach so each test starts clean
let mockState = {
  query: '',
  suggestions: [] as SearchProduct[],
  selectedIndex: -1,
  setQuery: vi.fn(),
  fetchSuggestions: vi.fn().mockResolvedValue(undefined),
  closeDropdown: vi.fn(),
  moveSelection: vi.fn(),
}

vi.mock('@/stores/search', () => ({
  useSearchStore: () => mockState,
}))

import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    pushMock.mockReset()
    mockState = {
      query: '',
      suggestions: [],
      selectedIndex: -1,
      setQuery: vi.fn(),
      fetchSuggestions: vi.fn().mockResolvedValue(undefined),
      closeDropdown: vi.fn(),
      moveSelection: vi.fn(),
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the search input', () => {
    render(<SearchBar />)
    expect(screen.getByTestId('search-bar-input')).toBeInTheDocument()
  })

  it('input has correct placeholder', () => {
    render(<SearchBar />)
    expect(screen.getByTestId('search-bar-input')).toHaveAttribute(
      'placeholder',
      'Search our collection…',
    )
  })

  it('does not show the clear button when query is empty', () => {
    mockState.query = ''
    render(<SearchBar />)
    expect(screen.queryByTestId('search-bar-clear')).not.toBeInTheDocument()
  })

  it('shows the clear button when query is non-empty', () => {
    mockState.query = 'lamp'
    render(<SearchBar />)
    expect(screen.getByTestId('search-bar-clear')).toBeInTheDocument()
  })

  it('renders the current query value from the store', () => {
    mockState.query = 'sofa'
    render(<SearchBar />)
    expect(screen.getByTestId('search-bar-input')).toHaveValue('sofa')
  })

  // ── Typing ───────────────────────────────────────────────────────────────────

  it('calls setQuery with the typed value', () => {
    render(<SearchBar />)
    fireEvent.change(screen.getByTestId('search-bar-input'), { target: { value: 'table' } })
    expect(mockState.setQuery).toHaveBeenCalledWith('table')
  })

  it('calls fetchSuggestions after the 300ms debounce', () => {
    vi.useFakeTimers()
    render(<SearchBar />)
    fireEvent.change(screen.getByTestId('search-bar-input'), { target: { value: 'chair' } })
    expect(mockState.fetchSuggestions).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(mockState.fetchSuggestions).toHaveBeenCalledWith('chair')
  })

  it('debounce is reset on rapid successive keystrokes', () => {
    vi.useFakeTimers()
    render(<SearchBar />)
    fireEvent.change(screen.getByTestId('search-bar-input'), { target: { value: 'c' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    fireEvent.change(screen.getByTestId('search-bar-input'), { target: { value: 'ch' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    fireEvent.change(screen.getByTestId('search-bar-input'), { target: { value: 'cha' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    // Only the last value should have triggered fetchSuggestions
    expect(mockState.fetchSuggestions).toHaveBeenCalledTimes(1)
    expect(mockState.fetchSuggestions).toHaveBeenCalledWith('cha')
  })

  // ── Clear button ─────────────────────────────────────────────────────────────

  it('clicking clear calls setQuery with empty string', async () => {
    const user = userEvent.setup()
    mockState.query = 'lamp'
    render(<SearchBar />)
    await user.click(screen.getByTestId('search-bar-clear'))
    expect(mockState.setQuery).toHaveBeenCalledWith('')
  })

  it('clicking clear calls closeDropdown', async () => {
    const user = userEvent.setup()
    mockState.query = 'lamp'
    render(<SearchBar />)
    await user.click(screen.getByTestId('search-bar-clear'))
    expect(mockState.closeDropdown).toHaveBeenCalledTimes(1)
  })

  // ── Form submission ───────────────────────────────────────────────────────────

  it('pressing Enter with a query navigates to /search?q=<query>', () => {
    mockState.query = 'armchair'
    render(<SearchBar />)
    fireEvent.submit(screen.getByTestId('search-bar-input').closest('form')!)
    expect(pushMock).toHaveBeenCalledWith('/search?q=armchair')
  })

  it('pressing Enter with a selected suggestion navigates to the suggestion title', () => {
    mockState.query = 'ch'
    mockState.selectedIndex = 0
    mockState.suggestions = [
      {
        id: 's1',
        title: 'Cherry Wood Bench',
        price: 'Rs. 12,000',
        imageUrl: '/img.jpg',
        href: '/products/cherry-wood-bench',
        priceAmount: 12000,
      },
    ]
    render(<SearchBar />)
    fireEvent.submit(screen.getByTestId('search-bar-input').closest('form')!)
    expect(pushMock).toHaveBeenCalledWith(`/search?q=${encodeURIComponent('Cherry Wood Bench')}`)
  })

  it('submit calls closeDropdown', () => {
    mockState.query = 'bench'
    render(<SearchBar />)
    fireEvent.submit(screen.getByTestId('search-bar-input').closest('form')!)
    expect(mockState.closeDropdown).toHaveBeenCalledTimes(1)
  })

  it('submit calls the onClose prop', () => {
    const onClose = vi.fn()
    mockState.query = 'bench'
    render(<SearchBar onClose={onClose} />)
    fireEvent.submit(screen.getByTestId('search-bar-input').closest('form')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not navigate on submit when query is blank', () => {
    mockState.query = '   '
    render(<SearchBar />)
    fireEvent.submit(screen.getByTestId('search-bar-input').closest('form')!)
    expect(pushMock).not.toHaveBeenCalled()
  })

  // ── Keyboard navigation ───────────────────────────────────────────────────────

  it('ArrowDown calls moveSelection("down")', () => {
    render(<SearchBar />)
    fireEvent.keyDown(screen.getByTestId('search-bar-input'), { key: 'ArrowDown' })
    expect(mockState.moveSelection).toHaveBeenCalledWith('down')
  })

  it('ArrowUp calls moveSelection("up")', () => {
    render(<SearchBar />)
    fireEvent.keyDown(screen.getByTestId('search-bar-input'), { key: 'ArrowUp' })
    expect(mockState.moveSelection).toHaveBeenCalledWith('up')
  })

  it('Escape calls closeDropdown', () => {
    render(<SearchBar />)
    fireEvent.keyDown(screen.getByTestId('search-bar-input'), { key: 'Escape' })
    expect(mockState.closeDropdown).toHaveBeenCalledTimes(1)
  })

  it('Escape calls the onClose prop', () => {
    const onClose = vi.fn()
    render(<SearchBar onClose={onClose} />)
    fireEvent.keyDown(screen.getByTestId('search-bar-input'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ── autoFocus ─────────────────────────────────────────────────────────────────

  it('focuses the input when autoFocus is true', () => {
    render(<SearchBar autoFocus />)
    expect(document.activeElement).toBe(screen.getByTestId('search-bar-input'))
  })
})
