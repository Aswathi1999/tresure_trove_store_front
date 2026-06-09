/**
 * Integration tests for the bulk-import-products workflow pipeline.
 *
 * Unlike the unit tests (which isolate each step), these tests run all three
 * steps in sequence — mirroring what the workflow engine does at runtime.
 * Only the final Medusa core-flows calls (createProductsWorkflow /
 * updateProductsWorkflow) are mocked, because they require a live database.
 */

const capturedHandlers: Record<
  string,
  (input: unknown, ctx: { container: unknown }) => Promise<unknown>
> = {}

const mockCreateProductsRun = jest.fn()
const mockCreateProductsWorkflow = jest.fn().mockReturnValue({ run: mockCreateProductsRun })

const mockUpdateProductsRun = jest.fn()
const mockUpdateProductsWorkflow = jest.fn().mockReturnValue({ run: mockUpdateProductsRun })

jest.mock('@medusajs/framework/workflows-sdk', () => ({
  createStep: jest.fn(
    (name: string, handler: (input: unknown, ctx: { container: unknown }) => Promise<unknown>) => {
      capturedHandlers[name] = handler
      return jest.fn()
    },
  ),
  createWorkflow: jest.fn(),
  StepResponse: class StepResponse {
    constructor(
      public result: unknown,
      public compensationData?: unknown,
    ) {}
  },
  WorkflowResponse: class WorkflowResponse {
    constructor(public result: unknown) {}
  },
  transform: jest.fn(),
}))

jest.mock('@medusajs/framework/utils', () => ({
  Modules: { PRODUCT: 'productModuleService' },
}))

jest.mock('@medusajs/core-flows', () => ({
  createProductsWorkflow: mockCreateProductsWorkflow,
  updateProductsWorkflow: mockUpdateProductsWorkflow,
}))

import '../bulk-import-products'
import type { BulkImportRow } from '../bulk-import-products'

// ── Internal types (mirrors the workflow's internal ProductGroup) ─────────────

type ProductGroup = {
  handle: string
  title: string
  description: string
  wood_type: string
  dimensions: string
  warranty: string
  variants: BulkImportRow[]
}

type StepResult<T> = { result: T }
type CreateResult = { created: string[]; failed: { handle: string; error: string }[] }
type UpdateResult = {
  updated: string[]
  skipped: string[]
  failed: { handle: string; error: string }[]
}
type MockVariant = { sku: string | null }
type MockProduct = { id: string; handle: string; variants: MockVariant[] }

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeContainer(products: MockProduct[] = []) {
  const productService = {
    listProducts: jest.fn().mockImplementation((filter: { handle?: string[] }, _opts?: unknown) => {
      const handles = filter.handle ?? []
      return Promise.resolve(products.filter((p) => handles.includes(p.handle)))
    }),
  }
  return { resolve: jest.fn(() => productService), _svc: productService }
}

/** Mirrors the workflow's internal groupRowsByHandle transform. */
function groupRowsByHandle(rows: BulkImportRow[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>()
  for (const row of rows) {
    if (!row.handle || !row.title) continue
    const existing = map.get(row.handle)
    if (existing) {
      existing.variants.push(row)
    } else {
      map.set(row.handle, {
        handle: row.handle,
        title: row.title,
        description: row.description,
        wood_type: row.wood_type,
        dimensions: row.dimensions,
        warranty: row.warranty,
        variants: [row],
      })
    }
  }
  return [...map.values()]
}

/**
 * Runs all three workflow steps in sequence, mirroring the workflow engine.
 * existingProducts simulates what is already in the database.
 */
async function runPipeline(rows: BulkImportRow[], existingProducts: MockProduct[] = []) {
  const container = makeContainer(existingProducts)
  const groups = groupRowsByHandle(rows)
  const handles = groups.map((g) => g.handle)

  const fetchResp = await capturedHandlers['fetch-existing-product-handles']!(
    { handles },
    { container },
  )
  const existingHandles = (fetchResp as StepResult<string[]>).result
  const exSet = new Set(existingHandles)

  const newGroups = groups.filter((g) => !exSet.has(g.handle))
  const existingGroups = groups.filter((g) => exSet.has(g.handle))

  const createResp = await capturedHandlers['create-new-products']!(
    { groups: newGroups },
    { container },
  )
  const createResult = (createResp as StepResult<CreateResult>).result

  const updateResp = await capturedHandlers['add-variants-to-existing-products']!(
    { groups: existingGroups },
    { container },
  )
  const updateResult = (updateResp as StepResult<UpdateResult>).result

  return {
    created: createResult.created,
    updated: updateResult.updated,
    skipped: updateResult.skipped,
    failed: [...createResult.failed, ...updateResult.failed],
    _createProductsCalls: mockCreateProductsRun.mock.calls,
    _updateProductsCalls: mockUpdateProductsRun.mock.calls,
  }
}

function makeRow(overrides: Partial<BulkImportRow> = {}): BulkImportRow {
  return {
    title: 'Ōkura Lounge Chair',
    handle: 'okura-lounge-chair',
    description: 'Handcrafted teak chair',
    variant_sku: 'OKR-TK-L',
    price_inr: 14500000,
    price_usd: 175000,
    stock: 4,
    material: 'Teak',
    size: 'Large',
    finish: 'Natural',
    wood_type: 'teak',
    dimensions: '80x85x76 cm',
    warranty: '10 years structural',
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCreateProductsWorkflow.mockReturnValue({ run: mockCreateProductsRun })
  mockUpdateProductsWorkflow.mockReturnValue({ run: mockUpdateProductsRun })
  mockCreateProductsRun.mockResolvedValue({})
  mockUpdateProductsRun.mockResolvedValue({})
})

// ── Scenario 1: Fresh import — all products are new ───────────────────────────

describe('fresh import — all products are new', () => {
  const FIVE_PRODUCTS: BulkImportRow[] = [
    makeRow({
      handle: 'chair-a',
      title: 'Chair A',
      variant_sku: 'SKU-A-1',
      material: 'Teak',
      size: 'S',
      finish: 'Natural',
    }),
    makeRow({
      handle: 'chair-b',
      title: 'Chair B',
      variant_sku: 'SKU-B-1',
      material: 'Oak',
      size: 'M',
      finish: 'Dark',
    }),
    makeRow({
      handle: 'table-a',
      title: 'Table A',
      variant_sku: 'SKU-T-1',
      material: 'Walnut',
      size: '4-Seater',
      finish: 'Natural',
    }),
    makeRow({
      handle: 'bed-a',
      title: 'Bed A',
      variant_sku: 'SKU-BD-1',
      material: 'Oak',
      size: 'Queen',
      finish: 'Natural',
    }),
    makeRow({
      handle: 'shelf-a',
      title: 'Shelf A',
      variant_sku: 'SKU-SH-1',
      material: 'Rosewood',
      size: '3-Tier',
      finish: 'Natural',
    }),
  ]

  it('creates all five products and leaves updated/skipped/failed empty', async () => {
    const result = await runPipeline(FIVE_PRODUCTS)
    expect(result.created).toHaveLength(5)
    expect(result.updated).toHaveLength(0)
    expect(result.skipped).toHaveLength(0)
    expect(result.failed).toHaveLength(0)
  })

  it('calls createProductsWorkflow once per unique handle', async () => {
    await runPipeline(FIVE_PRODUCTS)
    expect(mockCreateProductsRun).toHaveBeenCalledTimes(5)
  })

  it('does not call updateProductsWorkflow when all products are new', async () => {
    await runPipeline(FIVE_PRODUCTS)
    expect(mockUpdateProductsRun).not.toHaveBeenCalled()
  })

  it('creates all five expected handles', async () => {
    const result = await runPipeline(FIVE_PRODUCTS)
    expect(result.created).toEqual(
      expect.arrayContaining(['chair-a', 'chair-b', 'table-a', 'bed-a', 'shelf-a']),
    )
  })
})

// ── Scenario 2: Re-import — all products already exist ────────────────────────

describe('re-import — all products already exist (idempotency)', () => {
  const ROWS = [
    makeRow({ handle: 'chair-a', title: 'Chair A', variant_sku: 'SKU-A-1' }),
    makeRow({ handle: 'chair-b', title: 'Chair B', variant_sku: 'SKU-B-1' }),
  ]

  const EXISTING: MockProduct[] = [
    { id: 'prod_01', handle: 'chair-a', variants: [{ sku: 'SKU-A-1' }] },
    { id: 'prod_02', handle: 'chair-b', variants: [{ sku: 'SKU-B-1' }] },
  ]

  it('creates nothing and skips all when all handles and SKUs already exist', async () => {
    const result = await runPipeline(ROWS, EXISTING)
    expect(result.created).toHaveLength(0)
    expect(result.skipped).toHaveLength(2)
    expect(result.updated).toHaveLength(0)
    expect(result.failed).toHaveLength(0)
  })

  it('does not call createProductsWorkflow on re-import', async () => {
    await runPipeline(ROWS, EXISTING)
    expect(mockCreateProductsRun).not.toHaveBeenCalled()
  })

  it('does not call updateProductsWorkflow when no new SKUs exist', async () => {
    await runPipeline(ROWS, EXISTING)
    expect(mockUpdateProductsRun).not.toHaveBeenCalled()
  })
})

// ── Scenario 3: Mixed import — some new, some existing with new variants ──────

describe('mixed import — new products + new variants for existing', () => {
  const ROWS: BulkImportRow[] = [
    makeRow({ handle: 'new-chair', title: 'New Chair', variant_sku: 'NEW-SKU-1' }),
    makeRow({
      handle: 'existing-chair',
      title: 'Existing Chair',
      variant_sku: 'EXIST-SKU-NEW',
      size: 'Large',
    }),
    makeRow({ handle: 'no-change-chair', title: 'No Change', variant_sku: 'NO-CHANGE-SKU' }),
  ]

  const EXISTING: MockProduct[] = [
    { id: 'prod_ex', handle: 'existing-chair', variants: [{ sku: 'EXIST-SKU-OLD' }] },
    { id: 'prod_nc', handle: 'no-change-chair', variants: [{ sku: 'NO-CHANGE-SKU' }] },
  ]

  it('creates 1, updates 1, skips 1, fails 0', async () => {
    const result = await runPipeline(ROWS, EXISTING)
    expect(result.created).toEqual(['new-chair'])
    expect(result.updated).toEqual(['existing-chair'])
    expect(result.skipped).toEqual(['no-change-chair'])
    expect(result.failed).toHaveLength(0)
  })

  it('calls createProductsWorkflow once for the new product', async () => {
    await runPipeline(ROWS, EXISTING)
    expect(mockCreateProductsRun).toHaveBeenCalledTimes(1)
  })

  it('calls updateProductsWorkflow once for the existing product with a new SKU', async () => {
    await runPipeline(ROWS, EXISTING)
    expect(mockUpdateProductsRun).toHaveBeenCalledTimes(1)
  })
})

// ── Scenario 4: Multi-variant product — correct options and metadata ───────────

describe('multi-variant product — options, prices, and metadata', () => {
  const ROWS: BulkImportRow[] = [
    makeRow({
      handle: 'multi-chair',
      title: 'Multi Chair',
      variant_sku: 'MC-TK-S-NAT',
      material: 'Teak',
      size: 'Small',
      finish: 'Natural',
      price_inr: 10000000,
      price_usd: 120000,
      stock: 5,
      wood_type: 'teak',
      dimensions: '72x80x85 cm',
      warranty: '10 years',
    }),
    makeRow({
      handle: 'multi-chair',
      title: 'Multi Chair',
      variant_sku: 'MC-TK-L-NAT',
      material: 'Teak',
      size: 'Large',
      finish: 'Natural',
      price_inr: 12000000,
      price_usd: 145000,
      stock: 3,
      wood_type: 'teak',
      dimensions: '72x80x85 cm',
      warranty: '10 years',
    }),
    makeRow({
      handle: 'multi-chair',
      title: 'Multi Chair',
      variant_sku: 'MC-WN-L-DRK',
      material: 'Walnut',
      size: 'Large',
      finish: 'Dark',
      price_inr: 15000000,
      price_usd: 180000,
      stock: 2,
      wood_type: 'teak',
      dimensions: '72x80x85 cm',
      warranty: '10 years',
    }),
  ]

  it('creates the product once (all 3 rows grouped into one handle)', async () => {
    await runPipeline(ROWS)
    expect(mockCreateProductsRun).toHaveBeenCalledTimes(1)
  })

  it('builds Material option with both unique materials', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const materialOpt = product.options.find((o: { title: string }) => o.title === 'Material')
    expect(materialOpt?.values).toEqual(expect.arrayContaining(['Teak', 'Walnut']))
    expect(materialOpt?.values).toHaveLength(2)
  })

  it('builds Size option with two unique sizes', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const sizeOpt = product.options.find((o: { title: string }) => o.title === 'Size')
    expect(sizeOpt?.values).toEqual(expect.arrayContaining(['Small', 'Large']))
    expect(sizeOpt?.values).toHaveLength(2)
  })

  it('builds Finish option with both unique finishes', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const finishOpt = product.options.find((o: { title: string }) => o.title === 'Finish')
    expect(finishOpt?.values).toEqual(expect.arrayContaining(['Natural', 'Dark']))
  })

  it('creates exactly 3 variants', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.variants).toHaveLength(3)
  })

  it('parses dimensions into structured metadata', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.metadata.dimensions).toEqual({ width: 72, depth: 80, height: 85, unit: 'cm' })
  })

  it('includes wood_type and warranty in metadata', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.metadata.wood_type).toBe('teak')
    expect(product.metadata.warranty).toBe('10 years')
  })

  it('sets the product status to draft', async () => {
    await runPipeline(ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.status).toBe('draft')
  })

  it('sets both INR and USD prices on each variant', async () => {
    await runPipeline(ROWS)
    const variants = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants
    for (const v of variants) {
      expect(
        v.prices.find((p: { currency_code: string }) => p.currency_code === 'inr'),
      ).toBeDefined()
      expect(
        v.prices.find((p: { currency_code: string }) => p.currency_code === 'usd'),
      ).toBeDefined()
    }
  })
})

// ── Scenario 5: Error resilience — failures do not block other products ───────

describe('error resilience — one failure does not block the rest', () => {
  const ROWS: BulkImportRow[] = [
    makeRow({ handle: 'chair-good-1', title: 'Good Chair 1', variant_sku: 'G1' }),
    makeRow({ handle: 'chair-bad', title: 'Bad Chair', variant_sku: 'B1' }),
    makeRow({ handle: 'chair-good-2', title: 'Good Chair 2', variant_sku: 'G2' }),
  ]

  beforeEach(() => {
    mockCreateProductsRun
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('DB constraint violation'))
      .mockResolvedValueOnce({})
  })

  it('creates 2 products and records 1 failure', async () => {
    const result = await runPipeline(ROWS)
    expect(result.created).toHaveLength(2)
    expect(result.failed).toHaveLength(1)
  })

  it('records the correct handle and error message for the failure', async () => {
    const result = await runPipeline(ROWS)
    expect(result.failed[0]).toEqual({
      handle: 'chair-bad',
      error: 'DB constraint violation',
    })
  })

  it('still creates the products that come after the failing one', async () => {
    const result = await runPipeline(ROWS)
    expect(result.created).toEqual(expect.arrayContaining(['chair-good-1', 'chair-good-2']))
  })
})

// ── Scenario 6: Seed product data format ─────────────────────────────────────

describe('seed product data — Ōkura Lounge Chair (3 variants)', () => {
  const OKURA_ROWS: BulkImportRow[] = [
    {
      title: 'Ōkura Lounge Chair',
      handle: 'okura-lounge-chair',
      description: 'Sculptural lounge chair.',
      variant_sku: 'OKR-TEAK-SM',
      price_inr: 14500000,
      price_usd: 175000,
      stock: 4,
      material: 'Teak',
      size: 'Small',
      finish: 'Natural',
      wood_type: 'teak',
      dimensions: '72x80x85 cm',
      warranty: '10 years structural, 2 years upholstery',
    },
    {
      title: 'Ōkura Lounge Chair',
      handle: 'okura-lounge-chair',
      description: 'Sculptural lounge chair.',
      variant_sku: 'OKR-TEAK-LG',
      price_inr: 16500000,
      price_usd: 200000,
      stock: 3,
      material: 'Teak',
      size: 'Large',
      finish: 'Natural',
      wood_type: 'teak',
      dimensions: '82x90x92 cm',
      warranty: '10 years structural, 2 years upholstery',
    },
    {
      title: 'Ōkura Lounge Chair',
      handle: 'okura-lounge-chair',
      description: 'Sculptural lounge chair.',
      variant_sku: 'OKR-TEAK-LG-DARK',
      price_inr: 17000000,
      price_usd: 205000,
      stock: 2,
      material: 'Teak',
      size: 'Large',
      finish: 'Dark',
      wood_type: 'teak',
      dimensions: '82x90x92 cm',
      warranty: '10 years structural, 2 years upholstery',
    },
  ]

  it('groups all 3 variants into a single createProductsWorkflow call', async () => {
    await runPipeline(OKURA_ROWS)
    expect(mockCreateProductsRun).toHaveBeenCalledTimes(1)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.handle).toBe('okura-lounge-chair')
    expect(product.variants).toHaveLength(3)
  })

  it('builds Size option with Small and Large (deduplicated)', async () => {
    await runPipeline(OKURA_ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const sizeOpt = product.options.find((o: { title: string }) => o.title === 'Size')
    expect(sizeOpt?.values).toHaveLength(2)
    expect(sizeOpt?.values).toEqual(expect.arrayContaining(['Small', 'Large']))
  })

  it('builds Finish option with Natural and Dark', async () => {
    await runPipeline(OKURA_ROWS)
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const finishOpt = product.options.find((o: { title: string }) => o.title === 'Finish')
    expect(finishOpt?.values).toEqual(expect.arrayContaining(['Natural', 'Dark']))
  })

  it('correctly assigns SKUs across all three variants', async () => {
    await runPipeline(OKURA_ROWS)
    const variants = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants
    const skus = variants.map((v: { sku: string }) => v.sku)
    expect(skus).toEqual(expect.arrayContaining(['OKR-TEAK-SM', 'OKR-TEAK-LG', 'OKR-TEAK-LG-DARK']))
  })
})
