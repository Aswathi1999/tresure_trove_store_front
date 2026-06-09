// Capture step handler and compensation before the module loads
let capturedHandler: (input: { ids: string[] }, ctx: { container: unknown }) => Promise<unknown>
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

import '../delete-products-from-meilisearch'

function makeContainer() {
  const mockMeilisearch = {
    deleteProducts: jest.fn().mockResolvedValue(undefined),
  }

  const mockLogger = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === 'meilisearch') return mockMeilisearch
      if (key === 'logger') return mockLogger
      return {}
    }),
  }

  return { container, mockMeilisearch, mockLogger }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('deleteProductsFromMeilisearchStep', () => {
  describe('handler', () => {
    it('calls deleteProducts with the provided ids', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedHandler({ ids: ['prod_01', 'prod_02'] }, { container })
      expect(mockMeilisearch.deleteProducts).toHaveBeenCalledWith(['prod_01', 'prod_02'])
    })

    it('calls deleteProducts with a single id', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedHandler({ ids: ['prod_01'] }, { container })
      expect(mockMeilisearch.deleteProducts).toHaveBeenCalledWith(['prod_01'])
    })

    it('calls deleteProducts with an empty array', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedHandler({ ids: [] }, { container })
      expect(mockMeilisearch.deleteProducts).toHaveBeenCalledWith([])
    })

    it('resolves the meilisearch module from the container', async () => {
      const { container } = makeContainer()
      await capturedHandler({ ids: ['prod_01'] }, { container })
      expect(container.resolve).toHaveBeenCalledWith('meilisearch')
    })

    it('returns a StepResponse with the ids as compensation data', async () => {
      const { container } = makeContainer()
      const response = await capturedHandler({ ids: ['prod_01', 'prod_02'] }, { container })
      expect((response as { compensationData: unknown }).compensationData).toEqual([
        'prod_01',
        'prod_02',
      ])
    })

    it('propagates errors from deleteProducts', async () => {
      const { container, mockMeilisearch } = makeContainer()
      mockMeilisearch.deleteProducts.mockRejectedValueOnce(new Error('index not found'))
      await expect(capturedHandler({ ids: ['prod_01'] }, { container })).rejects.toThrow(
        'index not found',
      )
    })
  })

  describe('compensation', () => {
    it('skips when ids is undefined', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedCompensation(undefined, { container })
      expect(mockMeilisearch.deleteProducts).not.toHaveBeenCalled()
    })

    it('skips when ids is an empty array', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedCompensation([], { container })
      expect(mockMeilisearch.deleteProducts).not.toHaveBeenCalled()
    })

    it('logs a warning when ids are present', async () => {
      const { container, mockLogger } = makeContainer()
      await capturedCompensation(['prod_01', 'prod_02'], { container })
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('2'))
    })

    it('does not re-add deleted products to the index', async () => {
      const { container, mockMeilisearch } = makeContainer()
      await capturedCompensation(['prod_01'], { container })
      expect(mockMeilisearch.deleteProducts).not.toHaveBeenCalled()
    })
  })
})
