/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@medusajs/admin-sdk', () => ({
  defineWidgetConfig: jest.fn((cfg: unknown) => cfg),
}))

jest.mock('@medusajs/framework/types', () => ({}))

import ProductMetadataWidget from '../product-metadata'

// ── Helpers ───────────────────────────────────────────────────────────────────

type Dimensions = { width: string; depth: string; height: string; unit: string }
type ProductMetadata = {
  wood_type?: string
  dimensions?: Partial<Dimensions>
  warranty?: string
  [key: string]: unknown
}

function makeProduct(metadata: ProductMetadata | null = null) {
  return { id: 'prod_01', metadata } as never
}

const FULL_META: ProductMetadata = {
  wood_type: 'Teak',
  dimensions: { width: '80', depth: '85', height: '76', unit: 'cm' },
  warranty: '10 years structural',
}

let fetchMock: jest.Mock

beforeEach(() => {
  fetchMock = jest.fn()
  ;(globalThis as Record<string, unknown>).fetch = fetchMock
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).fetch
})

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('renders the widget container', () => {
    render(<ProductMetadataWidget data={makeProduct()} />)
    expect(screen.getByTestId('product-metadata-widget')).toBeInTheDocument()
  })

  it('renders the "Product Details" heading', () => {
    render(<ProductMetadataWidget data={makeProduct()} />)
    expect(screen.getByRole('heading', { name: /product details/i })).toBeInTheDocument()
  })

  it('renders the wood type, warranty, and dimension inputs', () => {
    render(<ProductMetadataWidget data={makeProduct()} />)
    expect(screen.getByTestId('wood-type-input')).toBeInTheDocument()
    expect(screen.getByTestId('warranty-input')).toBeInTheDocument()
    expect(screen.getByTestId('dim-width-input')).toBeInTheDocument()
    expect(screen.getByTestId('dim-depth-input')).toBeInTheDocument()
    expect(screen.getByTestId('dim-height-input')).toBeInTheDocument()
    expect(screen.getByTestId('dim-unit-select')).toBeInTheDocument()
  })

  it('renders the Save button', () => {
    render(<ProductMetadataWidget data={makeProduct()} />)
    expect(screen.getByTestId('save-metadata-btn')).toHaveTextContent('Save')
  })

  it('does not show success or error message on initial render', () => {
    render(<ProductMetadataWidget data={makeProduct()} />)
    expect(screen.queryByTestId('save-success')).not.toBeInTheDocument()
    expect(screen.queryByTestId('save-error')).not.toBeInTheDocument()
  })
})

// ── Pre-populated metadata ────────────────────────────────────────────────────

describe('pre-populated metadata from product', () => {
  it('pre-fills the wood type input from product.metadata.wood_type', () => {
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    expect(screen.getByTestId('wood-type-input')).toHaveValue('Teak')
  })

  it('pre-fills the warranty input from product.metadata.warranty', () => {
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    expect(screen.getByTestId('warranty-input')).toHaveValue('10 years structural')
  })

  it('pre-fills the width input from product.metadata.dimensions.width', () => {
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    expect(screen.getByTestId('dim-width-input')).toHaveValue(80)
  })

  it('pre-fills the depth input from product.metadata.dimensions.depth', () => {
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    expect(screen.getByTestId('dim-depth-input')).toHaveValue(85)
  })

  it('pre-fills the height input from product.metadata.dimensions.height', () => {
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    expect(screen.getByTestId('dim-height-input')).toHaveValue(76)
  })

  it('pre-selects the unit from product.metadata.dimensions.unit', () => {
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    expect(screen.getByTestId('dim-unit-select')).toHaveValue('cm')
  })

  it('defaults unit to "cm" when metadata has no dimensions', () => {
    render(<ProductMetadataWidget data={makeProduct({})} />)
    expect(screen.getByTestId('dim-unit-select')).toHaveValue('cm')
  })

  it('renders empty inputs when metadata is null', () => {
    render(<ProductMetadataWidget data={makeProduct(null)} />)
    expect(screen.getByTestId('wood-type-input')).toHaveValue('')
    expect(screen.getByTestId('warranty-input')).toHaveValue('')
  })
})

// ── User input ────────────────────────────────────────────────────────────────

describe('user input', () => {
  it('updates the wood type field when the user types', async () => {
    const user = userEvent.setup()
    render(<ProductMetadataWidget data={makeProduct()} />)
    await user.type(screen.getByTestId('wood-type-input'), 'Walnut')
    expect(screen.getByTestId('wood-type-input')).toHaveValue('Walnut')
  })

  it('updates the warranty field when the user types', async () => {
    const user = userEvent.setup()
    render(<ProductMetadataWidget data={makeProduct()} />)
    await user.type(screen.getByTestId('warranty-input'), '5 years')
    expect(screen.getByTestId('warranty-input')).toHaveValue('5 years')
  })

  it('updates the width field when the user types', async () => {
    const user = userEvent.setup()
    render(<ProductMetadataWidget data={makeProduct()} />)
    await user.type(screen.getByTestId('dim-width-input'), '90')
    expect(screen.getByTestId('dim-width-input')).toHaveValue(90)
  })

  it('changes the unit to "in" when the user selects it', async () => {
    const user = userEvent.setup()
    render(<ProductMetadataWidget data={makeProduct()} />)
    await user.selectOptions(screen.getByTestId('dim-unit-select'), 'in')
    expect(screen.getByTestId('dim-unit-select')).toHaveValue('in')
  })
})

// ── Save — loading state ──────────────────────────────────────────────────────

describe('save — loading state', () => {
  it('disables the save button while saving', async () => {
    const user = userEvent.setup()
    let resolveRequest: () => void = () => {}
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveRequest = () => resolve({ ok: true } as Response)
      }),
    )
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('save-metadata-btn')).toBeDisabled()
    })

    await act(async () => {
      resolveRequest()
    })
  })

  it('shows "Saving…" on the button while the request is in flight', async () => {
    const user = userEvent.setup()
    let resolveRequest: () => void = () => {}
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveRequest = () => resolve({ ok: true } as Response)
      }),
    )
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('save-metadata-btn')).toHaveTextContent('Saving…')
    })

    await act(async () => {
      resolveRequest()
    })
  })
})

// ── Save — success state ──────────────────────────────────────────────────────

describe('save — success state', () => {
  it('shows the success message after a successful save', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    expect(await screen.findByTestId('save-success')).toBeInTheDocument()
  })

  it('restores the Save button label after a successful save', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')
    expect(screen.getByTestId('save-metadata-btn')).toHaveTextContent('Save')
  })

  it('does not show the error message on success', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')
    expect(screen.queryByTestId('save-error')).not.toBeInTheDocument()
  })
})

// ── Save — error state ────────────────────────────────────────────────────────

describe('save — error state', () => {
  it('shows the error message when the API returns a non-ok response', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    expect(await screen.findByTestId('save-error')).toBeInTheDocument()
  })

  it('shows the error message when fetch throws a network error', async () => {
    const user = userEvent.setup()
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    expect(await screen.findByTestId('save-error')).toBeInTheDocument()
  })

  it('does not show the success message on error', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-error')
    expect(screen.queryByTestId('save-success')).not.toBeInTheDocument()
  })
})

// ── Save — correct API payload ────────────────────────────────────────────────

describe('save — correct API payload', () => {
  it('sends a POST request to /admin/products/:id', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/products/prod_01',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sends wood_type in the metadata payload', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(body.metadata.wood_type).toBe('Teak')
  })

  it('sends warranty in the metadata payload', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(body.metadata.warranty).toBe('10 years structural')
  })

  it('sends dimensions in the metadata payload', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(body.metadata.dimensions).toMatchObject({
      width: '80',
      depth: '85',
      height: '76',
      unit: 'cm',
    })
  })

  it('includes updated wood_type when user has changed the field', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct({ wood_type: 'Teak' })} />)

    await user.clear(screen.getByTestId('wood-type-input'))
    await user.type(screen.getByTestId('wood-type-input'), 'Walnut')
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(body.metadata.wood_type).toBe('Walnut')
  })

  it('includes updated warranty when user has changed the field', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct({ warranty: '5 years' })} />)

    await user.clear(screen.getByTestId('warranty-input'))
    await user.type(screen.getByTestId('warranty-input'), '15 years structural')
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(body.metadata.warranty).toBe('15 years structural')
  })

  it('uses credentials: include on the fetch call', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: true } as Response)
    render(<ProductMetadataWidget data={makeProduct(FULL_META)} />)
    await user.click(screen.getByTestId('save-metadata-btn'))
    await screen.findByTestId('save-success')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    )
  })
})
