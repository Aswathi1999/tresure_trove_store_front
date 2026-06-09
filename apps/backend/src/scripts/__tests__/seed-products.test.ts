/**
 * Tests for the seed-products script.
 *
 * Verifies that the script seeds the correct 5 products (12 variants total),
 * delegates correctly to bulkImportProductsWorkflow, logs results, and sets
 * process.exitCode when failures are reported.
 */

const mockWorkflowRun = jest.fn()
const mockWorkflow = jest.fn().mockReturnValue({ run: mockWorkflowRun })

jest.mock('../../workflows/bulk-import-products', () => ({
  bulkImportProductsWorkflow: mockWorkflow,
}))

import seedProducts from '../seed-products'
import type { BulkImportRow } from '../../workflows/bulk-import-products'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeContainer() {
  return { resolve: jest.fn() }
}

const EMPTY_RESULT = { created: [], updated: [], skipped: [], failed: [] }

beforeEach(() => {
  jest.clearAllMocks()
  mockWorkflow.mockReturnValue({ run: mockWorkflowRun })
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  delete process.exitCode
})

afterEach(() => {
  jest.restoreAllMocks()
  delete process.exitCode
})

// ── Payload structure ─────────────────────────────────────────────────────────

describe('seed payload structure', () => {
  it('passes exactly 12 rows to the workflow (5 products, multi-variant)', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    expect(rows).toHaveLength(12)
  })

  it('covers exactly 5 unique product handles', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    const uniqueHandles = new Set(rows.map((r) => r.handle))
    expect(uniqueHandles.size).toBe(5)
  })

  it('includes all five expected product handles', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    const uniqueHandles = new Set(rows.map((r) => r.handle))
    expect(uniqueHandles).toContain('okura-lounge-chair')
    expect(uniqueHandles).toContain('kayu-dining-table')
    expect(uniqueHandles).toContain('sova-bed-frame')
    expect(uniqueHandles).toContain('arashi-coffee-table')
    expect(uniqueHandles).toContain('nishi-bookshelf')
  })

  it('seeds the Ōkura Lounge Chair with 3 variants', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    const okuraRows = rows.filter((r) => r.handle === 'okura-lounge-chair')
    expect(okuraRows).toHaveLength(3)
  })

  it('seeds the Kayu Dining Table with 3 variants', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    expect(rows.filter((r) => r.handle === 'kayu-dining-table')).toHaveLength(3)
  })

  it('seeds the Sova Bed Frame with 2 variants', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    expect(rows.filter((r) => r.handle === 'sova-bed-frame')).toHaveLength(2)
  })

  it('seeds the Arashi Coffee Table with 2 variants', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    expect(rows.filter((r) => r.handle === 'arashi-coffee-table')).toHaveLength(2)
  })

  it('seeds the Nishi Bookshelf with 2 variants', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    expect(rows.filter((r) => r.handle === 'nishi-bookshelf')).toHaveLength(2)
  })
})

// ── Metadata completeness ─────────────────────────────────────────────────────

describe('metadata completeness', () => {
  it('every row has a non-empty wood_type', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    for (const row of rows) {
      expect(row.wood_type).toBeTruthy()
    }
  })

  it('every row has a non-empty warranty string', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    for (const row of rows) {
      expect(row.warranty).toBeTruthy()
    }
  })

  it('every row has dimensions in the WxDxH unit format', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    const dimensionPattern = /^\d+x\d+x\d+\s*\w+$/
    for (const row of rows) {
      expect(row.dimensions).toMatch(dimensionPattern)
    }
  })

  it('every row has a positive INR price (stored in paise)', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    for (const row of rows) {
      expect(row.price_inr).toBeGreaterThan(0)
    }
  })

  it('every row has a positive USD price (stored in cents)', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    for (const row of rows) {
      expect(row.price_usd).toBeGreaterThan(0)
    }
  })

  it('every row has a non-empty variant_sku', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    for (const row of rows) {
      expect(row.variant_sku).toBeTruthy()
    }
  })

  it('all variant SKUs are unique across all 12 rows', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    const { rows } = mockWorkflowRun.mock.calls[0][0].input as { rows: BulkImportRow[] }
    const skus = rows.map((r) => r.variant_sku)
    expect(new Set(skus).size).toBe(skus.length)
  })
})

// ── Workflow invocation ───────────────────────────────────────────────────────

describe('workflow invocation', () => {
  it('passes the container to bulkImportProductsWorkflow', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    const container = makeContainer()

    await seedProducts({ container } as never)

    expect(mockWorkflow).toHaveBeenCalledWith(container)
  })

  it('calls the workflow exactly once', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    expect(mockWorkflowRun).toHaveBeenCalledTimes(1)
  })
})

// ── Logging and exit behaviour ────────────────────────────────────────────────

describe('logging and exit behaviour', () => {
  it('logs the product and variant counts before running', async () => {
    mockWorkflowRun.mockResolvedValue({ result: EMPTY_RESULT })
    await seedProducts({ container: makeContainer() } as never)

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('5'))
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('12'))
  })

  it('does not set process.exitCode when there are no failures', async () => {
    mockWorkflowRun.mockResolvedValue({
      result: { ...EMPTY_RESULT, created: ['okura-lounge-chair'] },
    })
    await seedProducts({ container: makeContainer() } as never)

    expect(process.exitCode).toBeUndefined()
  })

  it('sets process.exitCode to 1 when failures are reported', async () => {
    mockWorkflowRun.mockResolvedValue({
      result: { ...EMPTY_RESULT, failed: [{ handle: 'okura-lounge-chair', error: 'DB error' }] },
    })
    await seedProducts({ container: makeContainer() } as never)

    expect(process.exitCode).toBe(1)
  })

  it('logs each failure handle and error message to console.error', async () => {
    mockWorkflowRun.mockResolvedValue({
      result: {
        ...EMPTY_RESULT,
        failed: [{ handle: 'okura-lounge-chair', error: 'constraint violation' }],
      },
    })
    await seedProducts({ container: makeContainer() } as never)

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('okura-lounge-chair'))
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('constraint violation'))
  })
})
