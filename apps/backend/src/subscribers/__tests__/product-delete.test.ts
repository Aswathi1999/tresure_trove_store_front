const mockWorkflowRun = jest.fn()
const mockDeleteWorkflow = jest.fn().mockReturnValue({ run: mockWorkflowRun })

jest.mock('../../workflows/delete-products-from-meilisearch', () => ({
  deleteProductsFromMeilisearchWorkflow: mockDeleteWorkflow,
}))

import productDeleteSubscriber, { config } from '../product-delete'

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
  } as unknown as Parameters<typeof productDeleteSubscriber>[0]['container']

  if (overrides.workflowError) {
    mockWorkflowRun.mockRejectedValueOnce(overrides.workflowError)
  } else {
    mockWorkflowRun.mockResolvedValue({ result: { deleted: 1 } })
  }

  return { container, mockLogger }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('productDeleteSubscriber', () => {
  describe('config', () => {
    it('subscribes to product.deleted event', () => {
      expect(config.event).toBe('product.deleted')
    })
  })

  describe('handler', () => {
    it('runs the delete workflow with the product id', async () => {
      const { container } = makeContainer()
      await productDeleteSubscriber({
        event: { data: { id: 'prod_01' } } as never,
        container,
        pluginOptions: {},
      })
      expect(mockDeleteWorkflow).toHaveBeenCalledWith(container)
      expect(mockWorkflowRun).toHaveBeenCalledWith({
        input: { ids: ['prod_01'] },
      })
    })

    it('logs a success message after deletion', async () => {
      const { container, mockLogger } = makeContainer()
      await productDeleteSubscriber({
        event: { data: { id: 'prod_77' } } as never,
        container,
        pluginOptions: {},
      })
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('prod_77'))
    })

    it('logs an error and does not rethrow when the workflow fails', async () => {
      const { container, mockLogger } = makeContainer({
        workflowError: new Error('index not found'),
      })
      await expect(
        productDeleteSubscriber({
          event: { data: { id: 'prod_88' } } as never,
          container,
          pluginOptions: {},
        }),
      ).resolves.toBeUndefined()
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('prod_88'))
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('index not found'))
    })
  })
})
