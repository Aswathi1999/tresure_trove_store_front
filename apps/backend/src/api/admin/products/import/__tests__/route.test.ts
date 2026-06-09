const mockImportRun = jest.fn()
const mockImportWorkflow = jest.fn().mockReturnValue({ run: mockImportRun })

jest.mock('../../../../../workflows/bulk-import-products', () => ({
  bulkImportProductsWorkflow: mockImportWorkflow,
}))

import { POST } from '../route'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }
}

type MockFile = {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

function makeRequest(logger: ReturnType<typeof makeLogger>, file?: MockFile) {
  return {
    scope: {
      resolve: jest.fn((key: string) => {
        if (key === 'logger') return logger
        return {}
      }),
    },
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

const VALID_HEADER =
  'title,handle,description,variant_sku,price_inr,price_usd,stock,material,size,finish,wood_type,dimensions,warranty\n'

const VALID_ROW =
  'Ōkura Lounge Chair,okura-lounge-chair,Handcrafted teak chair,OKR-TK-L,28500000,340000,10,Teak,Large,Natural,Teak,80x85x76cm,5 years'

const EMPTY_RESULT = { created: [], updated: [], skipped: [], failed: [] }

beforeEach(() => {
  jest.clearAllMocks()
  mockImportWorkflow.mockReturnValue({ run: mockImportRun })
})

// ─── Missing file ─────────────────────────────────────────────────────────────

describe('POST /admin/products/import — missing file', () => {
  it('returns 400 with code MISSING_FILE when no file is attached', async () => {
    const logger = makeLogger()
    const { res, statusFn, jsonFn } = makeResponse()

    await POST(makeRequest(logger, undefined) as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(400)
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'MISSING_FILE' }),
      }),
    )
  })

  it('does not run the workflow when file is missing', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()

    await POST(makeRequest(logger, undefined) as never, res as never)

    expect(mockImportRun).not.toHaveBeenCalled()
  })
})

// ─── CSV parse errors ─────────────────────────────────────────────────────────

describe('POST /admin/products/import — CSV parse errors', () => {
  it('returns 400 with code CSV_PARSE_ERROR when required columns are missing', async () => {
    const logger = makeLogger()
    const { res, statusFn, jsonFn } = makeResponse()

    await POST(
      makeRequest(logger, makeCsvFile('title,handle\nChair,my-chair\n')) as never,
      res as never,
    )

    expect(statusFn).toHaveBeenCalledWith(400)
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'CSV_PARSE_ERROR' }),
      }),
    )
  })

  it('includes the names of missing columns in the error message', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()

    await POST(
      makeRequest(logger, makeCsvFile('title,handle\nChair,my-chair\n')) as never,
      res as never,
    )

    const call = jsonFn.mock.calls[0][0] as { error: { message: string } }
    expect(call.error.message).toMatch(/variant_sku/i)
  })

  it('does not run the workflow on a CSV parse error', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()

    await POST(
      makeRequest(logger, makeCsvFile('title,handle\nChair,my-chair\n')) as never,
      res as never,
    )

    expect(mockImportRun).not.toHaveBeenCalled()
  })
})

// ─── Empty CSV ────────────────────────────────────────────────────────────────

describe('POST /admin/products/import — empty CSV', () => {
  it('returns 400 with code EMPTY_CSV when CSV has only a header row', async () => {
    const logger = makeLogger()
    const { res, statusFn, jsonFn } = makeResponse()

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER)) as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(400)
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'EMPTY_CSV' }),
      }),
    )
  })

  it('returns 400 with code EMPTY_CSV when the buffer is completely empty', async () => {
    const logger = makeLogger()
    const { res, statusFn, jsonFn } = makeResponse()

    await POST(makeRequest(logger, makeCsvFile('')) as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(400)
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'EMPTY_CSV' }),
      }),
    )
  })

  it('does not run the workflow for an empty CSV', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER)) as never, res as never)

    expect(mockImportRun).not.toHaveBeenCalled()
  })
})

// ─── Successful import ────────────────────────────────────────────────────────

describe('POST /admin/products/import — successful import', () => {
  it('runs the workflow with the parsed rows', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { created: ['okura-lounge-chair'], updated: [], skipped: [], failed: [] },
    })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(mockImportRun).toHaveBeenCalledWith({
      input: {
        rows: expect.arrayContaining([expect.objectContaining({ handle: 'okura-lounge-chair' })]),
      },
    })
  })

  it('returns 200 with success: true', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { ...EMPTY_RESULT, created: ['okura-lounge-chair'] },
    })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('returns correct summary counts', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { created: ['chair-a'], updated: ['chair-b'], skipped: ['chair-c'], failed: [] },
    })
    const twoRows = VALID_ROW + '\n' + VALID_ROW.replace('okura-lounge-chair', 'chair-b')
    mockImportRun.mockResolvedValue({
      result: { created: ['okura-lounge-chair'], updated: [], skipped: [], failed: [] },
    })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: expect.objectContaining({
          total_rows: 1,
          created: 1,
          updated: 0,
          skipped: 0,
          failed: 0,
        }),
      }),
    )
  })

  it('includes the full workflow result in details', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    const importResult = { created: ['okura-lounge-chair'], updated: [], skipped: [], failed: [] }
    mockImportRun.mockResolvedValue({ result: importResult })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ details: importResult }))
  })

  it('parses price_inr as a rounded integer', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input
    expect(rows[0].price_inr).toBe(28500000)
    expect(typeof rows[0].price_inr).toBe('number')
  })

  it('parses price_usd as a rounded integer', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input
    expect(rows[0].price_usd).toBe(340000)
  })

  it('parses stock as an integer', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input
    expect(rows[0].stock).toBe(10)
    expect(typeof rows[0].stock).toBe('number')
  })

  it('sets handle and title from CSV fields', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    const { rows } = mockImportRun.mock.calls[0][0].input
    expect(rows[0].handle).toBe('okura-lounge-chair')
    expect(rows[0].title).toBe('Ōkura Lounge Chair')
  })

  it('handles CSV fields containing commas inside quotes', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })
    const rowWithQuotedComma =
      '"Chair, Deluxe",quoted-chair,"A chair, deluxe edition",SKU-001,1000,200,5,Teak,M,Matte,Teak,60x60x80cm,2 years'

    await POST(
      makeRequest(logger, makeCsvFile(VALID_HEADER + rowWithQuotedComma)) as never,
      res as never,
    )

    const { rows } = mockImportRun.mock.calls[0][0].input
    expect(rows[0].title).toBe('Chair, Deluxe')
    expect(rows[0].description).toBe('A chair, deluxe edition')
  })

  it('logs info before starting the import', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({ result: EMPTY_RESULT })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(logger.info).toHaveBeenNthCalledWith(1, expect.stringContaining('1'))
  })

  it('logs info after completing the import', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockResolvedValue({
      result: { created: ['okura-lounge-chair'], updated: [], skipped: [], failed: [] },
    })

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(logger.info).toHaveBeenCalledTimes(2)
  })
})

// ─── Workflow errors ──────────────────────────────────────────────────────────

describe('POST /admin/products/import — workflow errors', () => {
  it('returns 500 with code IMPORT_WORKFLOW_FAILED when workflow throws', async () => {
    const logger = makeLogger()
    const { res, statusFn, jsonFn } = makeResponse()
    mockImportRun.mockRejectedValueOnce(new Error('DB connection lost'))

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(500)
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'IMPORT_WORKFLOW_FAILED' }),
      }),
    )
  })

  it('includes the error message in the response', async () => {
    const logger = makeLogger()
    const { res, jsonFn } = makeResponse()
    mockImportRun.mockRejectedValueOnce(new Error('DB connection lost'))

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    const call = jsonFn.mock.calls[0][0] as { error: { message: string } }
    expect(call.error.message).toContain('DB connection lost')
  })

  it('logs the error message when the workflow throws', async () => {
    const logger = makeLogger()
    const { res } = makeResponse()
    mockImportRun.mockRejectedValueOnce(new Error('unexpected failure'))

    await POST(makeRequest(logger, makeCsvFile(VALID_HEADER + VALID_ROW)) as never, res as never)

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('unexpected failure'))
  })
})
