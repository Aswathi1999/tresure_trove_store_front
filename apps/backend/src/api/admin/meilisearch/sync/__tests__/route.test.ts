const mockWorkflowRun = jest.fn()
const mockSyncWorkflow = jest.fn().mockReturnValue({ run: mockWorkflowRun })

jest.mock('../../../../../workflows/sync-products-to-meilisearch', () => ({
  syncProductsToMeilisearchWorkflow: mockSyncWorkflow,
}))

jest.mock('../../../../../modules/meilisearch', () => ({
  MEILISEARCH_MODULE: 'meilisearch',
}))

import { POST } from '../route'

const BATCH_SIZE = 50

function makeMeilisearch(overrides: { setupError?: Error } = {}) {
  return {
    setupIndex: jest.fn().mockImplementation(() => {
      if (overrides.setupError) return Promise.reject(overrides.setupError)
      return Promise.resolve()
    }),
  }
}

function makeLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }
}

function makeRequestResponse(
  meilisearch: ReturnType<typeof makeMeilisearch>,
  logger: ReturnType<typeof makeLogger>,
) {
  const jsonFn = jest.fn()
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn })

  const req = {
    scope: {
      resolve: jest.fn((key: string) => {
        if (key === 'meilisearch') return meilisearch
        if (key === 'logger') return logger
        return {}
      }),
    },
  }

  const res = { json: jsonFn, status: statusFn }

  return { req, res, jsonFn, statusFn }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /admin/meilisearch/sync', () => {
  describe('successful sync', () => {
    it('calls setupIndex before running the workflow', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockResolvedValue({ result: { synced: 0, deleted: 0 } })

      await POST(req as never, res as never)

      expect(meilisearch.setupIndex).toHaveBeenCalled()
    })

    it('returns synced and deleted counts with success: true', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res, jsonFn } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockResolvedValue({ result: { synced: 3, deleted: 1 } })

      await POST(req as never, res as never)

      expect(jsonFn).toHaveBeenCalledWith({ success: true, synced: 3, deleted: 1 })
    })

    it('runs the workflow with offset 0 and the configured batch size', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockResolvedValue({ result: { synced: 0, deleted: 0 } })

      await POST(req as never, res as never)

      expect(mockSyncWorkflow).toHaveBeenCalledWith(req.scope)
      expect(mockWorkflowRun).toHaveBeenCalledWith({
        input: { limit: BATCH_SIZE, offset: 0 },
      })
    })

    it('paginates when a batch is completely full', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res } = makeRequestResponse(meilisearch, logger)

      mockWorkflowRun
        .mockResolvedValueOnce({ result: { synced: BATCH_SIZE, deleted: 0 } })
        .mockResolvedValueOnce({ result: { synced: 10, deleted: 0 } })

      await POST(req as never, res as never)

      expect(mockWorkflowRun).toHaveBeenCalledTimes(2)
      expect(mockWorkflowRun).toHaveBeenNthCalledWith(2, {
        input: { limit: BATCH_SIZE, offset: BATCH_SIZE },
      })
    })

    it('stops paginating when batch is partial', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockResolvedValue({ result: { synced: 20, deleted: 5 } })

      await POST(req as never, res as never)

      expect(mockWorkflowRun).toHaveBeenCalledTimes(1)
    })

    it('accumulates synced and deleted across multiple batches', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res, jsonFn } = makeRequestResponse(meilisearch, logger)

      mockWorkflowRun
        .mockResolvedValueOnce({ result: { synced: BATCH_SIZE, deleted: 0 } })
        .mockResolvedValueOnce({ result: { synced: 15, deleted: 3 } })

      await POST(req as never, res as never)

      expect(jsonFn).toHaveBeenCalledWith({
        success: true,
        synced: BATCH_SIZE + 15,
        deleted: 3,
      })
    })

    it('logs a success message after completing the sync', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockResolvedValue({ result: { synced: 5, deleted: 2 } })

      await POST(req as never, res as never)

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('5'))
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('2'))
    })

    it('returns synced: 0 and deleted: 0 when there are no products', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res, jsonFn } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockResolvedValue({ result: { synced: 0, deleted: 0 } })

      await POST(req as never, res as never)

      expect(jsonFn).toHaveBeenCalledWith({ success: true, synced: 0, deleted: 0 })
    })
  })

  describe('error handling', () => {
    it('returns 500 with success: false when setupIndex throws', async () => {
      const meilisearch = makeMeilisearch({
        setupError: new Error('MeiliSearch connection refused'),
      })
      const logger = makeLogger()
      const { req, res, jsonFn, statusFn } = makeRequestResponse(meilisearch, logger)

      await POST(req as never, res as never)

      expect(statusFn).toHaveBeenCalledWith(500)
      expect(jsonFn).toHaveBeenCalledWith({
        success: false,
        error: 'MeiliSearch connection refused',
      })
    })

    it('returns 500 with success: false when the workflow throws', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res, jsonFn, statusFn } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockRejectedValueOnce(new Error('workflow execution failed'))

      await POST(req as never, res as never)

      expect(statusFn).toHaveBeenCalledWith(500)
      expect(jsonFn).toHaveBeenCalledWith({
        success: false,
        error: 'workflow execution failed',
      })
    })

    it('logs the error message before returning 500', async () => {
      const meilisearch = makeMeilisearch()
      const logger = makeLogger()
      const { req, res } = makeRequestResponse(meilisearch, logger)
      mockWorkflowRun.mockRejectedValueOnce(new Error('index unavailable'))

      await POST(req as never, res as never)

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('index unavailable'))
    })
  })
})
