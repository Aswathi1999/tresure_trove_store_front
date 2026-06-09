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

// ── Type helpers ─────────────────────────────────────────────────────────────

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

function makeRow(overrides: Partial<BulkImportRow> = {}): BulkImportRow {
  return {
    title: 'Ōkura Lounge Chair',
    handle: 'okura-lounge-chair',
    description: 'Handcrafted teak chair',
    variant_sku: 'OKR-TK-L',
    price_inr: 28500000,
    price_usd: 340000,
    stock: 10,
    material: 'Teak',
    size: 'Large',
    finish: 'Natural',
    wood_type: 'Teak',
    dimensions: '80x85x76cm',
    warranty: '5 years',
    ...overrides,
  }
}

function makeGroup(overrides: Partial<ProductGroup> = {}): ProductGroup {
  return {
    handle: 'okura-lounge-chair',
    title: 'Ōkura Lounge Chair',
    description: 'Handcrafted teak chair',
    wood_type: 'Teak',
    dimensions: '80x85x76cm',
    warranty: '5 years',
    variants: [makeRow()],
    ...overrides,
  }
}

type MockProduct = { handle: string; id: string; variants?: { sku: string | null }[] }

function makeProductService(products: MockProduct[] = []) {
  return {
    listProducts: jest.fn().mockImplementation(({ handle }: { handle: string[] }) => {
      return Promise.resolve(products.filter((p) => handle.includes(p.handle)))
    }),
  }
}

function makeContainer(productService?: ReturnType<typeof makeProductService>) {
  return {
    resolve: jest.fn((key: string) => {
      if (key === 'productModuleService' && productService) return productService
      return {}
    }),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCreateProductsWorkflow.mockReturnValue({ run: mockCreateProductsRun })
  mockUpdateProductsWorkflow.mockReturnValue({ run: mockUpdateProductsRun })
})

// ─── fetchExistingHandlesStep ─────────────────────────────────────────────────

describe('fetchExistingHandlesStep', () => {
  const step = () => capturedHandlers['fetch-existing-product-handles']

  it('returns empty array when handles is empty', async () => {
    const container = makeContainer()
    const response = await step()({ handles: [] }, { container })
    expect((response as StepResult<string[]>).result).toEqual([])
  })

  it('does not call listProducts when handles is empty', async () => {
    const productService = makeProductService()
    const container = makeContainer(productService)
    await step()({ handles: [] }, { container })
    expect(productService.listProducts).not.toHaveBeenCalled()
  })

  it('resolves the product module from container', async () => {
    const productService = makeProductService([{ handle: 'chair-a', id: 'prod_01' }])
    const container = makeContainer(productService)
    await step()({ handles: ['chair-a'] }, { container })
    expect(container.resolve).toHaveBeenCalledWith('productModuleService')
  })

  it('calls listProducts with the provided handles and select:handle', async () => {
    const productService = makeProductService([{ handle: 'chair-a', id: 'prod_01' }])
    const container = makeContainer(productService)
    await step()({ handles: ['chair-a', 'chair-b'] }, { container })
    expect(productService.listProducts).toHaveBeenCalledWith(
      { handle: ['chair-a', 'chair-b'] },
      expect.objectContaining({ select: ['handle'] }),
    )
  })

  it('returns handles of found products', async () => {
    const productService = makeProductService([
      { handle: 'chair-a', id: 'prod_01' },
      { handle: 'chair-b', id: 'prod_02' },
    ])
    const container = makeContainer(productService)
    const response = await step()({ handles: ['chair-a', 'chair-b', 'chair-c'] }, { container })
    expect((response as StepResult<string[]>).result).toEqual(['chair-a', 'chair-b'])
  })

  it('returns empty array when no handles match', async () => {
    const productService = makeProductService([{ handle: 'chair-x', id: 'prod_01' }])
    const container = makeContainer(productService)
    const response = await step()({ handles: ['chair-a'] }, { container })
    expect((response as StepResult<string[]>).result).toEqual([])
  })
})

// ─── createNewProductsStep ────────────────────────────────────────────────────

describe('createNewProductsStep', () => {
  const step = () => capturedHandlers['create-new-products']

  beforeEach(() => {
    mockCreateProductsRun.mockResolvedValue({})
  })

  it('returns empty created and failed arrays when groups is empty', async () => {
    const container = makeContainer()
    const response = await step()({ groups: [] }, { container })
    const { created, failed } = (response as StepResult<{ created: string[]; failed: unknown[] }>)
      .result
    expect(created).toEqual([])
    expect(failed).toEqual([])
  })

  it('calls createProductsWorkflow once per group', async () => {
    const container = makeContainer()
    const groups = [makeGroup({ handle: 'chair-a' }), makeGroup({ handle: 'chair-b' })]
    await step()({ groups }, { container })
    expect(mockCreateProductsRun).toHaveBeenCalledTimes(2)
  })

  it('returns created handles on success', async () => {
    const container = makeContainer()
    const response = await step()(
      { groups: [makeGroup({ handle: 'okura-lounge-chair' })] },
      { container },
    )
    expect((response as StepResult<{ created: string[] }>).result.created).toEqual([
      'okura-lounge-chair',
    ])
  })

  it('sets product status to draft', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup()] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.status).toBe('draft')
  })

  it('sets handle and title from group', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup({ handle: 'my-chair', title: 'My Chair' })] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.handle).toBe('my-chair')
    expect(product.title).toBe('My Chair')
  })

  it('builds material option from unique variant materials', async () => {
    const container = makeContainer()
    const group = makeGroup({
      variants: [
        makeRow({ material: 'Teak', size: '', finish: '' }),
        makeRow({ material: 'Walnut', size: '', finish: '' }),
      ],
    })
    await step()({ groups: [group] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const materialOpt = product.options.find((o: { title: string }) => o.title === 'Material')
    expect(materialOpt?.values).toEqual(expect.arrayContaining(['Teak', 'Walnut']))
  })

  it('builds size and finish options from unique values', async () => {
    const container = makeContainer()
    const group = makeGroup({
      variants: [
        makeRow({ material: 'Teak', size: 'Small', finish: 'Matte' }),
        makeRow({ material: 'Teak', size: 'Large', finish: 'Natural' }),
      ],
    })
    await step()({ groups: [group] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const sizeOpt = product.options.find((o: { title: string }) => o.title === 'Size')
    const finishOpt = product.options.find((o: { title: string }) => o.title === 'Finish')
    expect(sizeOpt?.values).toEqual(expect.arrayContaining(['Small', 'Large']))
    expect(finishOpt?.values).toEqual(expect.arrayContaining(['Matte', 'Natural']))
  })

  it('omits material option when all variants have empty material', async () => {
    const container = makeContainer()
    const group = makeGroup({
      variants: [makeRow({ material: '', size: 'Large', finish: 'Natural' })],
    })
    await step()({ groups: [group] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    const materialOpt = product.options.find((o: { title: string }) => o.title === 'Material')
    expect(materialOpt).toBeUndefined()
  })

  it('sets variant title from material/size/finish combination', async () => {
    const container = makeContainer()
    const group = makeGroup({
      variants: [makeRow({ material: 'Teak', size: 'Large', finish: 'Natural' })],
    })
    await step()({ groups: [group] }, { container })
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.title).toBe('Teak / Large / Natural')
  })

  it('falls back to group title as variant title when no material/size/finish', async () => {
    const container = makeContainer()
    const group = makeGroup({
      title: 'Ōkura Chair',
      variants: [makeRow({ material: '', size: '', finish: '' })],
    })
    await step()({ groups: [group] }, { container })
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.title).toBe('Ōkura Chair')
  })

  it('includes INR price when price_inr > 0', async () => {
    const container = makeContainer()
    await step()(
      { groups: [makeGroup({ variants: [makeRow({ price_inr: 28500000, price_usd: 0 })] })] },
      { container },
    )
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.prices).toContainEqual({ amount: 28500000, currency_code: 'inr' })
    expect(
      variant.prices.find((p: { currency_code: string }) => p.currency_code === 'usd'),
    ).toBeUndefined()
  })

  it('includes USD price when price_usd > 0', async () => {
    const container = makeContainer()
    await step()(
      { groups: [makeGroup({ variants: [makeRow({ price_inr: 0, price_usd: 340000 })] })] },
      { container },
    )
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.prices).toContainEqual({ amount: 340000, currency_code: 'usd' })
    expect(
      variant.prices.find((p: { currency_code: string }) => p.currency_code === 'inr'),
    ).toBeUndefined()
  })

  it('includes both INR and USD prices when both are greater than zero', async () => {
    const container = makeContainer()
    await step()(
      {
        groups: [makeGroup({ variants: [makeRow({ price_inr: 28500000, price_usd: 340000 })] })],
      },
      { container },
    )
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.prices).toHaveLength(2)
  })

  it('adds parsed dimensions to product metadata', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup({ dimensions: '80x85x76cm' })] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.metadata).toMatchObject({
      dimensions: { width: 80, depth: 85, height: 76, unit: 'cm' },
    })
  })

  it('omits dimensions from metadata when format is invalid', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup({ dimensions: 'not-a-dimension' })] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.metadata?.dimensions).toBeUndefined()
  })

  it('adds wood_type to product metadata', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup({ wood_type: 'Teak' })] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.metadata).toMatchObject({ wood_type: 'Teak' })
  })

  it('adds warranty to product metadata', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup({ warranty: '5 years' })] }, { container })
    const product = mockCreateProductsRun.mock.calls[0][0].input.products[0]
    expect(product.metadata).toMatchObject({ warranty: '5 years' })
  })

  it('records failed handle with error message when workflow throws', async () => {
    const container = makeContainer()
    mockCreateProductsRun.mockRejectedValueOnce(new Error('DB constraint violation'))
    const response = await step()({ groups: [makeGroup({ handle: 'bad-handle' })] }, { container })
    const { failed } = (response as StepResult<{ failed: { handle: string; error: string }[] }>)
      .result
    expect(failed).toEqual([{ handle: 'bad-handle', error: 'DB constraint violation' }])
  })

  it('continues processing remaining groups after one fails', async () => {
    const container = makeContainer()
    mockCreateProductsRun.mockRejectedValueOnce(new Error('bad')).mockResolvedValueOnce({})
    const groups = [makeGroup({ handle: 'bad' }), makeGroup({ handle: 'good' })]
    const response = await step()({ groups }, { container })
    const { created, failed } = (
      response as StepResult<{ created: string[]; failed: { handle: string }[] }>
    ).result
    expect(created).toEqual(['good'])
    expect(failed.map((f) => f.handle)).toEqual(['bad'])
  })

  it('sets sku from variant_sku field', async () => {
    const container = makeContainer()
    await step()(
      { groups: [makeGroup({ variants: [makeRow({ variant_sku: 'OKR-TK-L-001' })] })] },
      { container },
    )
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.sku).toBe('OKR-TK-L-001')
  })

  it('sets stock as inventory_quantity on the variant', async () => {
    const container = makeContainer()
    await step()({ groups: [makeGroup({ variants: [makeRow({ stock: 25 })] })] }, { container })
    const variant = mockCreateProductsRun.mock.calls[0][0].input.products[0].variants[0]
    expect(variant.inventory_quantity).toBe(25)
  })
})

// ─── addVariantsToExistingStep ────────────────────────────────────────────────

describe('addVariantsToExistingStep', () => {
  const step = () => capturedHandlers['add-variants-to-existing-products']

  beforeEach(() => {
    mockUpdateProductsRun.mockResolvedValue({})
  })

  it('returns empty arrays without touching the container when groups is empty', async () => {
    const container = makeContainer()
    const response = await step()({ groups: [] }, { container })
    const { updated, skipped, failed } = (
      response as StepResult<{ updated: string[]; skipped: string[]; failed: unknown[] }>
    ).result
    expect(updated).toEqual([])
    expect(skipped).toEqual([])
    expect(failed).toEqual([])
    expect(container.resolve).not.toHaveBeenCalled()
  })

  it('adds handle to skipped when product is not found in DB', async () => {
    const productService = makeProductService([])
    const container = makeContainer(productService)
    const response = await step()({ groups: [makeGroup()] }, { container })
    const { skipped } = (response as StepResult<{ skipped: string[] }>).result
    expect(skipped).toContain('okura-lounge-chair')
  })

  it('adds handle to skipped when all variant SKUs already exist', async () => {
    const productService = makeProductService([
      {
        handle: 'okura-lounge-chair',
        id: 'prod_01',
        variants: [{ sku: 'OKR-TK-L' }],
      },
    ])
    const container = makeContainer(productService)
    const group = makeGroup({ variants: [makeRow({ variant_sku: 'OKR-TK-L' })] })
    const response = await step()({ groups: [group] }, { container })
    const { skipped, updated } = (response as StepResult<{ skipped: string[]; updated: string[] }>)
      .result
    expect(skipped).toContain('okura-lounge-chair')
    expect(updated).toEqual([])
    expect(mockUpdateProductsRun).not.toHaveBeenCalled()
  })

  it('calls updateProductsWorkflow and adds to updated when new SKU is present', async () => {
    const productService = makeProductService([
      {
        handle: 'okura-lounge-chair',
        id: 'prod_01',
        variants: [{ sku: 'OKR-TK-S' }],
      },
    ])
    const container = makeContainer(productService)
    const group = makeGroup({ variants: [makeRow({ variant_sku: 'OKR-TK-L' })] })
    const response = await step()({ groups: [group] }, { container })
    const { updated } = (response as StepResult<{ updated: string[] }>).result
    expect(updated).toContain('okura-lounge-chair')
    expect(mockUpdateProductsRun).toHaveBeenCalled()
  })

  it('passes existing product id to updateProductsWorkflow', async () => {
    const productService = makeProductService([
      { handle: 'okura-lounge-chair', id: 'prod_01', variants: [] },
    ])
    const container = makeContainer(productService)
    await step()({ groups: [makeGroup()] }, { container })
    const call = mockUpdateProductsRun.mock.calls[0][0]
    expect(call.input.products[0].id).toBe('prod_01')
  })

  it('treats variant with empty variant_sku as always new', async () => {
    const productService = makeProductService([
      {
        handle: 'okura-lounge-chair',
        id: 'prod_01',
        variants: [{ sku: 'OKR-TK-S' }],
      },
    ])
    const container = makeContainer(productService)
    const group = makeGroup({ variants: [makeRow({ variant_sku: '' })] })
    await step()({ groups: [group] }, { container })
    expect(mockUpdateProductsRun).toHaveBeenCalled()
  })

  it('only sends new variants (excluding duplicates) to updateProductsWorkflow', async () => {
    const productService = makeProductService([
      {
        handle: 'okura-lounge-chair',
        id: 'prod_01',
        variants: [{ sku: 'OKR-TK-S' }],
      },
    ])
    const container = makeContainer(productService)
    const group = makeGroup({
      variants: [
        makeRow({ variant_sku: 'OKR-TK-S', size: 'Small' }),
        makeRow({ variant_sku: 'OKR-TK-L', size: 'Large' }),
      ],
    })
    await step()({ groups: [group] }, { container })
    const call = mockUpdateProductsRun.mock.calls[0][0]
    expect(call.input.products[0].variants).toHaveLength(1)
  })

  it('records failed handle when updateProductsWorkflow throws', async () => {
    const productService = makeProductService([
      { handle: 'okura-lounge-chair', id: 'prod_01', variants: [] },
    ])
    const container = makeContainer(productService)
    mockUpdateProductsRun.mockRejectedValueOnce(new Error('variant conflict'))
    const response = await step()({ groups: [makeGroup()] }, { container })
    const { failed } = (response as StepResult<{ failed: { handle: string; error: string }[] }>)
      .result
    expect(failed).toEqual([{ handle: 'okura-lounge-chair', error: 'variant conflict' }])
  })

  it('processes multiple groups independently', async () => {
    const productService = makeProductService([
      { handle: 'chair-a', id: 'prod_01', variants: [] },
      { handle: 'chair-b', id: 'prod_02', variants: [{ sku: 'CHAIR-B-SKU' }] },
    ])
    const container = makeContainer(productService)
    const groups = [
      makeGroup({
        handle: 'chair-a',
        variants: [makeRow({ handle: 'chair-a', variant_sku: 'NEW-SKU' })],
      }),
      makeGroup({
        handle: 'chair-b',
        variants: [makeRow({ handle: 'chair-b', variant_sku: 'CHAIR-B-SKU' })],
      }),
    ]
    const response = await step()({ groups }, { container })
    const { updated, skipped } = (response as StepResult<{ updated: string[]; skipped: string[] }>)
      .result
    expect(updated).toContain('chair-a')
    expect(skipped).toContain('chair-b')
  })
})
