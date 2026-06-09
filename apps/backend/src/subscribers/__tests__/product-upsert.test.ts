const mockWorkflowRun = jest.fn()
const mockSyncWorkflow = jest.fn().mockReturnValue({ run: mockWorkflowRun })

jest.mock('../../workflows/sync-products-to-meilisearch', () => ({
  syncProductsToMeilisearchWorkflow: mockSyncWorkflow,
}))

import productUpsertSubscriber, { config } from '../product-upsert'

function makeContainer(overrides: { workflowError?: Error } = {}) {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === 'logger') return mockLogger
      return {}
    }),
  } as unknown as Parameters<typeof productUpsertSubscriber>[0]['container']

  if (overrides.workflowError) {
    mockWorkflowRun.mockRejectedValueOnce(overrides.workflowError)
  } else {
    mockWorkflowRun.mockResolvedValue({ result: { synced: 1, deleted: 0 } })
  }

  return { container, mockLogger }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('productUpsertSubscriber', () => {
  describe('config', () => {
    it('subscribes to both product.created and product.updated events', () => {
      expect(config.event).toEqual(['product.created', 'product.updated'])
    })
  })

  describe('handler', () => {
    it('runs the sync workflow with the product id as a filter', async () => {
      const { container } = makeContainer()
      await productUpsertSubscriber({
        event: { data: { id: 'prod_01' } } as never,
        container,
        pluginOptions: {},
      })
      expect(mockSyncWorkflow).toHaveBeenCalledWith(container)
      expect(mockWorkflowRun).toHaveBeenCalledWith({
        input: { filters: { id: 'prod_01' } },
      })
    })

    it('logs a success message after indexing', async () => {
      const { container, mockLogger } = makeContainer()
      await productUpsertSubscriber({
        event: { data: { id: 'prod_42' } } as never,
        container,
        pluginOptions: {},
      })
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('prod_42'))
    })

    it('logs an error and does not rethrow when the workflow fails', async () => {
      const { container, mockLogger } = makeContainer({
        workflowError: new Error('MeiliSearch connection refused'),
      })
      await expect(
        productUpsertSubscriber({
          event: { data: { id: 'prod_99' } } as never,
          container,
          pluginOptions: {},
        }),
      ).resolves.toBeUndefined()
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('prod_99'))
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('MeiliSearch connection refused'),
      )
    })
  })
})
