import { Modules, ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'

import { POST } from '../route'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cus_test_01',
    email: 'priya@treasuretrove.com',
    metadata: null as Record<string, unknown> | null,
    ...overrides,
  }
}

function makeCustomerService(overrides: Record<string, unknown> = {}) {
  return {
    retrieveCustomer: jest.fn().mockResolvedValue(makeCustomer()),
    updateCustomers: jest.fn().mockResolvedValue(makeCustomer({ metadata: { deactivated: true } })),
    ...overrides,
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
  options: {
    customerId?: string
    customerService?: ReturnType<typeof makeCustomerService>
    logger?: ReturnType<typeof makeLogger>
  } = {},
) {
  const {
    customerId = 'cus_test_01',
    customerService = makeCustomerService(),
    logger = makeLogger(),
  } = options

  const jsonFn = jest.fn()
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn })

  const req = {
    params: { id: customerId },
    scope: {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.LOGGER) return logger
        if (key === Modules.CUSTOMER) return customerService
        throw new Error(`Unexpected container key: ${key}`)
      }),
    },
  }

  const res = { json: jsonFn, status: statusFn }

  return { req, res, jsonFn, statusFn, customerService, logger }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Authentication (401) ─────────────────────────────────────────────────────

describe('POST /admin/customers/:id/deactivate — authentication', () => {
  it('exports a POST handler', () => {
    // Medusa applies JWT authentication middleware to all /admin/* routes before
    // the handler runs. Unauthenticated requests receive 401 at the framework
    // layer and never reach this handler — this is not testable at the unit level.
    expect(typeof POST).toBe('function')
  })
})

// ─── Successful deactivation (200) ───────────────────────────────────────────

describe('POST /admin/customers/:id/deactivate — successful deactivation', () => {
  it('returns status 200', async () => {
    const { req, res, statusFn } = makeRequestResponse()

    await POST(req as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(200)
  })

  it('returns the updated customer in the response body', async () => {
    const updatedCustomer = makeCustomer({ metadata: { deactivated: true } })
    const customerService = makeCustomerService({
      updateCustomers: jest.fn().mockResolvedValue(updatedCustomer),
    })
    const { req, res, jsonFn } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(jsonFn).toHaveBeenCalledWith({ customer: updatedCustomer })
  })

  it('calls retrieveCustomer with the id from route params', async () => {
    const customerService = makeCustomerService()
    const { req, res } = makeRequestResponse({ customerId: 'cus_abc_999', customerService })

    await POST(req as never, res as never)

    expect(customerService.retrieveCustomer).toHaveBeenCalledWith('cus_abc_999')
  })

  it('calls updateCustomers with deactivated: true in metadata', async () => {
    const customerService = makeCustomerService()
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).toHaveBeenCalledWith(
      'cus_test_01',
      expect.objectContaining({
        metadata: expect.objectContaining({ deactivated: true }),
      }),
    )
  })

  it('merges deactivated flag into existing metadata without overwriting other fields', async () => {
    const existingMetadata = { wishlist: ['prod_01', 'prod_02'], preferences: { theme: 'dark' } }
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(makeCustomer({ metadata: existingMetadata })),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).toHaveBeenCalledWith(
      'cus_test_01',
      expect.objectContaining({
        metadata: expect.objectContaining({
          wishlist: ['prod_01', 'prod_02'],
          preferences: { theme: 'dark' },
          deactivated: true,
        }),
      }),
    )
  })

  it('uses an empty object as the base when customer metadata is null', async () => {
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(makeCustomer({ metadata: null })),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).toHaveBeenCalledWith('cus_test_01', {
      metadata: { deactivated: true },
    })
  })

  it('uses an empty object as the base when customer metadata is undefined', async () => {
    const { metadata: _removed, ...customerWithoutMeta } = makeCustomer()
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(customerWithoutMeta),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).toHaveBeenCalledWith('cus_test_01', {
      metadata: { deactivated: true },
    })
  })

  it('logs an info message that contains the customer id', async () => {
    const logger = makeLogger()
    const { req, res } = makeRequestResponse({ logger })

    await POST(req as never, res as never)

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('cus_test_01'))
  })
})

// ─── Idempotency — already deactivated (200) ─────────────────────────────────

describe('POST /admin/customers/:id/deactivate — idempotency', () => {
  it('returns status 200 even when the customer is already deactivated', async () => {
    const customer = makeCustomer({ metadata: { deactivated: true } })
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(customer),
    })
    const { req, res, statusFn } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(200)
  })

  it('still calls updateCustomers when the customer is already deactivated', async () => {
    const customer = makeCustomer({ metadata: { deactivated: true } })
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(customer),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).toHaveBeenCalledTimes(1)
  })

  it('preserves all existing metadata fields on a second deactivation call', async () => {
    const existingMetadata = { deactivated: true, wishlist: ['prod_03'], tier: 'vip' }
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(makeCustomer({ metadata: existingMetadata })),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).toHaveBeenCalledWith(
      'cus_test_01',
      expect.objectContaining({
        metadata: expect.objectContaining({
          deactivated: true,
          wishlist: ['prod_03'],
          tier: 'vip',
        }),
      }),
    )
  })

  it('returns the customer from updateCustomers in the response body', async () => {
    const customer = makeCustomer({ metadata: { deactivated: true } })
    const updatedCustomer = makeCustomer({ metadata: { deactivated: true } })
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockResolvedValue(customer),
      updateCustomers: jest.fn().mockResolvedValue(updatedCustomer),
    })
    const { req, res, jsonFn } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(jsonFn).toHaveBeenCalledWith({ customer: updatedCustomer })
  })
})

// ─── Non-existent customer (404) ─────────────────────────────────────────────

describe('POST /admin/customers/:id/deactivate — non-existent customer', () => {
  it('returns status 404 when retrieveCustomer throws a NOT_FOUND MedusaError', async () => {
    const notFoundError = new MedusaError(MedusaError.Types.NOT_FOUND, 'Customer not found')
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockRejectedValue(notFoundError),
    })
    const { req, res, statusFn } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(statusFn).toHaveBeenCalledWith(404)
  })

  it('returns success: false with code CUSTOMER_NOT_FOUND', async () => {
    const notFoundError = new MedusaError(MedusaError.Types.NOT_FOUND, 'Customer not found')
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockRejectedValue(notFoundError),
    })
    const { req, res, jsonFn } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'CUSTOMER_NOT_FOUND' }),
      }),
    )
  })

  it('includes the customer id in the 404 error message', async () => {
    const notFoundError = new MedusaError(MedusaError.Types.NOT_FOUND, 'Customer not found')
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockRejectedValue(notFoundError),
    })
    const { req, res, jsonFn } = makeRequestResponse({
      customerId: 'cus_missing_999',
      customerService,
    })

    await POST(req as never, res as never)

    const response = jsonFn.mock.calls[0][0] as { error: { message: string } }
    expect(response.error.message).toContain('cus_missing_999')
  })

  it('does not call updateCustomers when the customer is not found', async () => {
    const notFoundError = new MedusaError(MedusaError.Types.NOT_FOUND, 'Customer not found')
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockRejectedValue(notFoundError),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await POST(req as never, res as never)

    expect(customerService.updateCustomers).not.toHaveBeenCalled()
  })

  it('re-throws non-404 errors from retrieveCustomer', async () => {
    const unexpectedError = new Error('DB connection failed')
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockRejectedValue(unexpectedError),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await expect(POST(req as never, res as never)).rejects.toThrow('DB connection failed')
  })

  it('does not re-throw a NOT_FOUND MedusaError', async () => {
    const notFoundError = new MedusaError(MedusaError.Types.NOT_FOUND, 'Customer not found')
    const customerService = makeCustomerService({
      retrieveCustomer: jest.fn().mockRejectedValue(notFoundError),
    })
    const { req, res } = makeRequestResponse({ customerService })

    await expect(POST(req as never, res as never)).resolves.not.toThrow()
  })
})
