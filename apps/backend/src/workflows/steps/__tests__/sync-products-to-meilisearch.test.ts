// Capture step handler and compensation before the module loads
let capturedHandler: (
  input: { products: unknown[] },
  ctx: { container: unknown },
) => Promise<unknown>
let capturedCompensation: (ids: string[] | undefined, ctx: { container: unknown }) => Promise<void>

jest.mock('@medusajs/framework/workflows-sdk', () => ({
  createStep: jest.fn((_name: string, handler: unknown, compensation: unknown) => {
    capturedHandler = handler as typeof capturedHandler
    capturedCompensation = compensation as typeof capturedCompensation
    return jest.fn()
  }),
  StepResponse: class StepResponse {
    constructor(
      public result: unknown,
      public compensationData?: unknown,
    ) {}
  },
}))

jest.mock('../../../modules/meilisearch', () => ({
  MEILISEARCH_MODULE: 'meilisearch',
}))

import '../sync-products-to-meilisearch'
import type { ProductDocument } from '../../../modules/meilisearch/service'

const MOCK_PRODUCT: ProductDocument = {
  id: 'prod_01',
  title: 'ŌKURA LOUNGE CHAIR',
  handle: 'okura-lounge-chair',
  thumbnail: 'https://cdn.example.com/chair.jpg',
  description: 'Handcrafted teak lounge chair',
  collection_id: 'col_01',
  collection_title: 'SEATING',
  min_price: 28500000,
  max_price: 28500000,
}

function makeContainer(overrides: { indexError?: Error; deleteError?: Error } = {}) {
  const mockMeilisearch = {
    indexProducts: jest.fn().mockImplementation(() => {
      if (overrides.indexError) return Promise.reject(overrides.indexError)
      return Promise.resolve()
    }),
    deleteProducts: jest.fn().mockResolvedValue(undefined),
  }

  const container = {
    resolve: jest.fn().mockReturnValue(mockMeilisearch),
  }

  return { container, mockMeilisearch }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('syncProductsToMeilisearchStep', () => {
  describe('handler', () => {
    it('calls indexProducts with the provided products', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedHandler({ products: [MOCK_PRODUCT] }, { container })
      expect(mockMeilisearch.indexProducts).toHaveBeenCalledWith([MOCK_PRODUCT])
    })

    it('calls indexProducts even when the products array is empty', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedHandler({ products: [] }, { container })
      expect(mockMeilisearch.indexProducts).toHaveBeenCalledWith([])
    })

    it('indexes multiple products in a single call', async () => {
      const { container, mockMeilisearch } = makeContainer()
      const second = { ...MOCK_PRODUCT, id: 'prod_02', title: 'HANA DINING TABLE' }
      await capturedHandler({ products: [MOCK_PRODUCT, second] }, { container })
      expect(mockMeilisearch.indexProducts).toHaveBeenCalledWith([MOCK_PRODUCT, second])
    })

    it('resolves the meilisearch module from the container', async () => {
      const { container } = makeContainer()
      await capturedHandler({ products: [MOCK_PRODUCT] }, { container })
      expect(container.resolve).toHaveBeenCalledWith('meilisearch')
    })

    it('returns a StepResponse with compensation data containing product ids', async () => {
      const { container } = makeContainer()
      const response = await capturedHandler({ products: [MOCK_PRODUCT] }, { container })
      expect((response as { compensationData: unknown }).compensationData).toEqual(['prod_01'])
    })

    it('returns compensation data with all product ids when multiple products are indexed', async () => {
      const { container } = makeContainer()
      const second = { ...MOCK_PRODUCT, id: 'prod_02' }
      const response = await capturedHandler({ products: [MOCK_PRODUCT, second] }, { container })
      expect((response as { compensationData: unknown }).compensationData).toEqual([
        'prod_01',
        'prod_02',
      ])
    })

    it('returns empty compensation data when products array is empty', async () => {
      const { container } = makeContainer()
      const response = await capturedHandler({ products: [] }, { container })
      expect((response as { compensationData: unknown }).compensationData).toEqual([])
    })

    it('propagates errors from indexProducts', async () => {
      const { container } = makeContainer({ indexError: new Error('MeiliSearch unreachable') })
      await expect(capturedHandler({ products: [MOCK_PRODUCT] }, { container })).rejects.toThrow(
        'MeiliSearch unreachable',
      )
    })
  })

  describe('compensation', () => {
    it('calls deleteProducts with the indexed product ids', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedCompensation(['prod_01', 'prod_02'], { container })
      expect(mockMeilisearch.deleteProducts).toHaveBeenCalledWith(['prod_01', 'prod_02'])
    })

    it('skips deleteProducts when ids is undefined', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedCompensation(undefined, { container })
      expect(mockMeilisearch.deleteProducts).not.toHaveBeenCalled()
    })

    it('skips deleteProducts when ids is an empty array', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedCompensation([], { container })
      expect(mockMeilisearch.deleteProducts).not.toHaveBeenCalled()
    })
  })
})
