/**
 * Integration tests for the product import HTTP pipeline.
 *
 * These tests verify the full path from an HTTP request carrying a CSV file
 * through CSV parsing and into the workflow invocation, then back to the HTTP
 * response. The bulk-import workflow itself is mocked at the boundary so tests
 * remain fast, but the route handler and CSV parser run without any mocking —
 * testing the two layers together as they work in production.
 */

const mockImportRun = jest.fn()
const mockImportWorkflow = jest.fn().mockReturnValue({ run: mockImportRun })

jest.mock('../../../../../workflows/bulk-import-products', () => ({
  bulkImportProductsWorkflow: mockImportWorkflow,
}))

import { POST } from '../route'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeLogger() {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
}

type MockFile = { buffer: Buffer; originalname: string; mimetype: string; size: number }

function makeRequest(logger: ReturnType<typeof makeLogger>, file?: MockFile) {
  return {
    scope: { resolve: jest.fn((key: string) => (key === 'logger' ? logger : {})) },
    file,
  }
}

function makeResponse() {
  const jsonFn = jest.fn()
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn })
  return { res: { json: jsonFn, status: statusFn }, jsonFn, statusFn }
}

function makeCsvFile(content: string): MockFile {
  return {
    buffer: Buffer.from(content, 'utf-8'),
    originalname: 'products.csv',
    mimetype: 'text/csv',
    size: content.length,
  }
}

const HEADER =
  'title,handle,description,variant_sku,price_inr,price_usd,stock,material,size,finish,wood_type,dimensions,warranty\n'

function makeRow(overrides: Partial<Record<string, string>> = {}): string {
  const defaults = {
    title: 'Ōkura Lounge Chair',
    handle: 'okura-lounge-chair',
    description: 'Handcrafted teak chair',
    variant_sku: 'OKR-TK-L',
    price_inr: '14500000',
    price_usd: '175000',
    stock: '4',
    material: 'Teak',
    size: 'Large',
    finish: 'Natural',
    wood_type: 'teak',
    dimensions: '80x85x76 cm',
    warranty: '10 years structural',
  }
  const merged = { ...defaults, ...overrides }
  return Object.values(merged).join(',')
}

const EMPTY_RESULT = { created: [], updated: [], skipped: [], failed: [] }

beforeEach(() => {
  jest.clearAllMocks()
  mockImportWorkflow.mockReturnValue({ run: mockImportRun })
})

// ── Multi-product CSV import ───────────────────────────────────────────────────

describe('multi-product CSV import', () => {
  const MULTI_PRODUCT_CSV =
    HEADER +
    [
      makeRow({ handle: 'chair-a', title: 'Chair A', variant_sku: 'CHR-A-1' }),
      makeRow({ handle: 'chair-b', title: 'Chair B', variant_sku: 'CHR-B-1', material: 'Oak' }),
      makeRow({
        handle: 'table-a',
        title: 'Table A',
        variant_sku: 'TBL-A-1',
        material: 'Walnut',
        size: '4-Seater',
      }),
    ].join('\n')

  it('calls the workflow with all three parsed rows', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { ...EMPTY_RESULT, created: ['chair-a', 'chair-b', 'table-a'] },
    })

    await POST(makeRequest(logger, makeCsvFile(MULTI_PRODUCT_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: unknown[] }
    expect(rows).toHaveLength(3)
  })

  it('returns summary with correct total_rows count', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { ...EMPTY_RESULT, created: ['chair-a', 'chair-b', 'table-a'] },
    })

    await POST(makeRequest(logger, makeCsvFile(MULTI_PRODUCT_CSV)) as never, res as never)

    const response = jsonFn.mock.calls[0][0] as { summary: { total_rows: number } }
    expect(response.summary.total_rows).toBe(3)
  })

  it('includes all three parsed handles in the workflow payload', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(MULTI_PRODUCT_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: Array<{ handle: string }> }
    const handles = rows.map((r) => r.handle)
    expect(handles).toEqual(expect.arrayContaining(['chair-a', 'chair-b', 'table-a']))
  })

  it('preserves material per row', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(MULTI_PRODUCT_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: Array<{ material: string }> }
    expect(rows[0].material).toBe('Teak')
    expect(rows[1].material).toBe('Oak')
    expect(rows[2].material).toBe('Walnut')
  })
})

// ── Multi-variant product (same handle on multiple rows) ──────────────────────

describe('multi-variant product — same handle across rows', () => {
  const MULTI_VARIANT_CSV =
    HEADER +
    [
      makeRow({
        handle: 'okura-chair',
        title: 'Ōkura Lounge Chair',
        variant_sku: 'OKR-SM',
        size: 'Small',
        finish: 'Natural',
      }),
      makeRow({
        handle: 'okura-chair',
        title: 'Ōkura Lounge Chair',
        variant_sku: 'OKR-LG',
        size: 'Large',
        finish: 'Natural',
      }),
      makeRow({
        handle: 'okura-chair',
        title: 'Ōkura Lounge Chair',
        variant_sku: 'OKR-LG-DK',
        size: 'Large',
        finish: 'Dark',
      }),
    ].join('\n')

  it('passes all three rows to the workflow', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: { ...EMPTY_RESULT, created: ['okura-chair'] } })

    await POST(makeRequest(logger, makeCsvFile(MULTI_VARIANT_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: unknown[] }
    expect(rows).toHaveLength(3)
  })

  it('returns total_rows: 3 in the summary', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({ result: { ...EMPTY_RESULT, created: ['okura-chair'] } })

    await POST(makeRequest(logger, makeCsvFile(MULTI_VARIANT_CSV)) as never, res as never)

    expect(
      (jsonFn.mock.calls[0][0] as { summary: { total_rows: number } }).summary.total_rows,
    ).toBe(3)
  })
})

// ── Mixed import result (created + updated + skipped + failed) ────────────────

describe('mixed import result — created, updated, skipped, and failed', () => {
  const MIXED_RESULT = {
    created: ['new-chair'],
    updated: ['existing-chair'],
    skipped: ['unchanged-chair'],
    failed: [{ handle: 'broken-chair', error: 'DB constraint' }],
  }

  const CSV =
    HEADER +
    [
      makeRow({ handle: 'new-chair', variant_sku: 'NC-1' }),
      makeRow({ handle: 'existing-chair', variant_sku: 'EC-1' }),
      makeRow({ handle: 'unchanged-chair', variant_sku: 'UC-1' }),
      makeRow({ handle: 'broken-chair', variant_sku: 'BC-1' }),
    ].join('\n')

  it('returns 200 with success: true even when some products fail', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({ result: MIXED_RESULT })

    await POST(makeRequest(logger, makeCsvFile(CSV)) as never, res as never)

    expect(jsonFn.mock.calls[0][0]).toMatchObject({ success: true })
  })

  it('summary reflects created: 1, updated: 1, skipped: 1, failed: 1', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({ result: MIXED_RESULT })

    await POST(makeRequest(logger, makeCsvFile(CSV)) as never, res as never)

    expect(jsonFn.mock.calls[0][0]).toMatchObject({
      summary: { total_rows: 4, created: 1, updated: 1, skipped: 1, failed: 1 },
    })
  })

  it('includes the full workflow details in the response', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({ result: MIXED_RESULT })

    await POST(makeRequest(logger, makeCsvFile(CSV)) as never, res as never)

    expect(jsonFn.mock.calls[0][0]).toMatchObject({ details: MIXED_RESULT })
  })
})

// ── Seed-data format compatibility ────────────────────────────────────────────

describe('seed-data format — all 12 seed variants in one CSV', () => {
  const SEED_ROWS = [
    // Ōkura Lounge Chair (3 variants)
    makeRow({
      handle: 'okura-lounge-chair',
      variant_sku: 'OKR-TEAK-SM',
      material: 'Teak',
      size: 'Small',
      finish: 'Natural',
      price_inr: '14500000',
      price_usd: '175000',
      stock: '4',
      wood_type: 'teak',
      dimensions: '72x80x85 cm',
      warranty: '10 years structural, 2 years upholstery',
    }),
    makeRow({
      handle: 'okura-lounge-chair',
      variant_sku: 'OKR-TEAK-LG',
      material: 'Teak',
      size: 'Large',
      finish: 'Natural',
      price_inr: '16500000',
      price_usd: '200000',
      stock: '3',
      wood_type: 'teak',
      dimensions: '82x90x92 cm',
      warranty: '10 years structural, 2 years upholstery',
    }),
    makeRow({
      handle: 'okura-lounge-chair',
      variant_sku: 'OKR-TEAK-LG-DARK',
      material: 'Teak',
      size: 'Large',
      finish: 'Dark',
      price_inr: '17000000',
      price_usd: '205000',
      stock: '2',
      wood_type: 'teak',
      dimensions: '82x90x92 cm',
      warranty: '10 years structural, 2 years upholstery',
    }),
    // Kayu Dining Table (3 variants)
    makeRow({
      handle: 'kayu-dining-table',
      variant_sku: 'KYU-WALNUT-4S',
      material: 'Walnut',
      size: '4-Seater',
      finish: 'Natural',
      price_inr: '32000000',
      price_usd: '385000',
      stock: '2',
      wood_type: 'walnut',
      dimensions: '160x90x76 cm',
      warranty: '15 years structural',
    }),
    makeRow({
      handle: 'kayu-dining-table',
      variant_sku: 'KYU-WALNUT-6S',
      material: 'Walnut',
      size: '6-Seater',
      finish: 'Natural',
      price_inr: '42000000',
      price_usd: '505000',
      stock: '2',
      wood_type: 'walnut',
      dimensions: '210x95x76 cm',
      warranty: '15 years structural',
    }),
    makeRow({
      handle: 'kayu-dining-table',
      variant_sku: 'KYU-WALNUT-8S',
      material: 'Walnut',
      size: '8-Seater',
      finish: 'Natural',
      price_inr: '55000000',
      price_usd: '660000',
      stock: '1',
      wood_type: 'walnut',
      dimensions: '260x100x76 cm',
      warranty: '15 years structural',
    }),
    // Sova Bed Frame (2 variants)
    makeRow({
      handle: 'sova-bed-frame',
      variant_sku: 'SVA-OAK-QUEEN',
      material: 'Oak',
      size: 'Queen',
      finish: 'Natural',
      price_inr: '22000000',
      price_usd: '265000',
      stock: '5',
      wood_type: 'oak',
      dimensions: '170x210x90 cm',
      warranty: '10 years structural',
    }),
    makeRow({
      handle: 'sova-bed-frame',
      variant_sku: 'SVA-OAK-KING',
      material: 'Oak',
      size: 'King',
      finish: 'Natural',
      price_inr: '26000000',
      price_usd: '315000',
      stock: '4',
      wood_type: 'oak',
      dimensions: '200x215x90 cm',
      warranty: '10 years structural',
    }),
    // Arashi Coffee Table (2 variants)
    makeRow({
      handle: 'arashi-coffee-table',
      variant_sku: 'ARS-MANGO-SM',
      material: 'Mango',
      size: 'Small',
      finish: 'Light',
      price_inr: '8500000',
      price_usd: '102000',
      stock: '8',
      wood_type: 'mango',
      dimensions: '90x55x40 cm',
      warranty: '5 years structural',
    }),
    makeRow({
      handle: 'arashi-coffee-table',
      variant_sku: 'ARS-MANGO-LG',
      material: 'Mango',
      size: 'Large',
      finish: 'Light',
      price_inr: '11500000',
      price_usd: '138000',
      stock: '6',
      wood_type: 'mango',
      dimensions: '120x65x42 cm',
      warranty: '5 years structural',
    }),
    // Nishi Bookshelf (2 variants)
    makeRow({
      handle: 'nishi-bookshelf',
      variant_sku: 'NSH-ROSEWOOD-3T',
      material: 'Rosewood',
      size: '3-Tier',
      finish: 'Natural',
      price_inr: '9500000',
      price_usd: '114000',
      stock: '6',
      wood_type: 'rosewood',
      dimensions: '90x35x120 cm',
      warranty: '10 years structural',
    }),
    makeRow({
      handle: 'nishi-bookshelf',
      variant_sku: 'NSH-ROSEWOOD-5T',
      material: 'Rosewood',
      size: '5-Tier',
      finish: 'Natural',
      price_inr: '14000000',
      price_usd: '168000',
      stock: '4',
      wood_type: 'rosewood',
      dimensions: '90x35x190 cm',
      warranty: '10 years structural',
    }),
  ]

  const SEED_CSV = HEADER + SEED_ROWS.join('\n')

  it('passes all 12 rows to the workflow', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: {
        created: [
          'okura-lounge-chair',
          'kayu-dining-table',
          'sova-bed-frame',
          'arashi-coffee-table',
          'nishi-bookshelf',
        ],
        updated: [],
        skipped: [],
        failed: [],
      },
    })

    await POST(makeRequest(logger, makeCsvFile(SEED_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: unknown[] }
    expect(rows).toHaveLength(12)
  })

  it('returns total_rows: 12 in the response summary', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: {
        created: [
          'okura-lounge-chair',
          'kayu-dining-table',
          'sova-bed-frame',
          'arashi-coffee-table',
          'nishi-bookshelf',
        ],
        updated: [],
        skipped: [],
        failed: [],
      },
    })

    await POST(makeRequest(logger, makeCsvFile(SEED_CSV)) as never, res as never)

    expect(
      (jsonFn.mock.calls[0][0] as { summary: { total_rows: number } }).summary.total_rows,
    ).toBe(12)
  })

  it('correctly parses the okura-lounge-chair handle from the first row', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(SEED_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: Array<{ handle: string }> }
    expect(rows[0].handle).toBe('okura-lounge-chair')
  })

  it('correctly parses price_inr as a number for the first row', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(SEED_CSV)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: Array<{ price_inr: number }> }
    expect(rows[0].price_inr).toBe(14500000)
  })
})

// ── Quoted CSV fields with commas ─────────────────────────────────────────────

describe('CSV fields containing commas inside quotes', () => {
  const WARRANTY_WITH_COMMA = '10 years structural, 2 years upholstery'
  const ROW_WITH_QUOTED_WARRANTY = `Ōkura Lounge Chair,okura-lounge-chair,"Handcrafted chair, luxury edition",OKR-TK-L,14500000,175000,4,Teak,Large,Natural,teak,80x85x76 cm,"${WARRANTY_WITH_COMMA}"`

  it('correctly parses a quoted description containing a comma', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(
      makeRequest(logger, makeCsvFile(HEADER + ROW_WITH_QUOTED_WARRANTY)) as never,
      res as never,
    )

    const { rows } = mockImportRun.mock.calls[0][0].input as {
      rows: Array<{ description: string }>
    }
    expect(rows[0].description).toBe('Handcrafted chair, luxury edition')
  })

  it('correctly parses a quoted warranty field containing a comma', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(
      makeRequest(logger, makeCsvFile(HEADER + ROW_WITH_QUOTED_WARRANTY)) as never,
      res as never,
    )

    const { rows } = mockImportRun.mock.calls[0][0].input as { rows: Array<{ warranty: string }> }
    expect(rows[0].warranty).toBe(WARRANTY_WITH_COMMA)
  })
})

// ── Logging ───────────────────────────────────────────────────────────────────

describe('logging during import pipeline', () => {
  const CSV = HEADER + makeRow()

  it('logs the start of the import with the row count', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(CSV)) as never, res as never)

    expect(logger.info).toHaveBeenNthCalledWith(1, expect.stringContaining('1'))
  })

  it('logs the completion summary after the import', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { ...EMPTY_RESULT, created: ['okura-lounge-chair'] },
    })

    await POST(makeRequest(logger, makeCsvFile(CSV)) as never, res as never)

    expect(logger.info).toHaveBeenCalledTimes(2)
  })

  it('logs the error message when the workflow throws', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockRejectedValueOnce(new Error('unexpected DB failure'))

    await POST(makeRequest(logger, makeCsvFile(CSV)) as never, res as never)

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('unexpected DB failure'))
  })
})
