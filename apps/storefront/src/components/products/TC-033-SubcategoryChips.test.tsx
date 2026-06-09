import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
const searchParamsRef = { current: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/collections/lighting',
  useSearchParams: () => searchParamsRef.current,
}))

import { SubcategoryChips } from './SubcategoryChips'
import type { SubcategoryChip } from './SubcategoryChips'

const chips: SubcategoryChip[] = [
  { label: 'All', value: '' },
  { label: 'Pendants', value: 'pendants', count: 12 },
  { label: 'Table Lamps', value: 'table-lamps', count: 8 },
  { label: 'Floor Lamps', value: 'floor-lamps' },
]

describe('SubcategoryChips', () => {
  beforeEach(() => {
    pushMock.mockReset()
    searchParamsRef.current = new URLSearchParams()
  })

  it('renders all chip buttons', () => {
    render(<SubcategoryChips chips={chips} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Pendants (12)')).toBeInTheDocument()
    expect(screen.getByText('Table Lamps (8)')).toBeInTheDocument()
    expect(screen.getByText('Floor Lamps')).toBeInTheDocument()
  })

  it('renders chip count when provided', () => {
    render(<SubcategoryChips chips={chips} />)
    expect(screen.getByText('Pendants (12)')).toBeInTheDocument()
  })

  it('renders chip without count when count is undefined', () => {
    render(<SubcategoryChips chips={chips} />)
    expect(screen.getByText('Floor Lamps')).toBeInTheDocument()
  })

  it('marks the "All" chip as active when no sub param is set', () => {
    render(<SubcategoryChips chips={chips} />)
    const allButton = screen.getByText('All').closest('button')
    expect(allButton).toBeInTheDocument()
  })

  it('clicking a chip pushes the correct sub param to the URL', async () => {
    const user = userEvent.setup()
    render(<SubcategoryChips chips={chips} />)
    await user.click(screen.getByText('Pendants (12)'))
    expect(pushMock).toHaveBeenCalledWith('/collections/lighting?sub=pendants')
  })

  it('clicking the All chip removes the sub param', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('sub=pendants')
    render(<SubcategoryChips chips={chips} />)
    await user.click(screen.getByText('All'))
    expect(pushMock).toHaveBeenCalledWith('/collections/lighting?')
  })

  it('clicking a chip always removes the page param', async () => {
    const user = userEvent.setup()
    searchParamsRef.current = new URLSearchParams('page=2')
    render(<SubcategoryChips chips={chips} />)
    await user.click(screen.getByText('Table Lamps (8)'))
    expect(pushMock).toHaveBeenCalledWith('/collections/lighting?sub=table-lamps')
  })

  it('renders correctly with an empty chips array', () => {
    render(<SubcategoryChips chips={[]} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
