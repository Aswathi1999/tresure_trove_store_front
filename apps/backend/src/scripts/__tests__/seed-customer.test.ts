/**
 * Unit tests for src/scripts/seed-customer.ts
 *
 * Validates conditional-create logic, service call arguments, and log
 * output using a fully mocked Medusa container.
 */

import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import seedCustomer from '../seed-customer'

const TEST_EMAIL = 'customer@treasuretrove.com'
const TEST_CUSTOMER_ID = 'cus_test_01'

function makeContainer(
  overrides: {
    existingCustomers?: unknown[]
    createdCustomer?: { id: string }
  } = {},
) {
  const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }

  const mockCustomerService = {
    listCustomers: jest.fn().mockResolvedValue(overrides.existingCustomers ?? []),
    createCustomers: jest
      .fn()
      .mockResolvedValue(overrides.createdCustomer ?? { id: TEST_CUSTOMER_ID }),
    createCustomerAddresses: jest.fn().mockResolvedValue(undefined),
  }

  const mockAuthService = {
    createAuthIdentities: jest.fn().mockResolvedValue(undefined),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === ContainerRegistrationKeys.LOGGER) return mockLogger
      if (key === Modules.CUSTOMER) return mockCustomerService
      if (key === Modules.AUTH) return mockAuthService
      throw new Error(`Unexpected container key: ${key}`)
    }),
  }

  return { container, mockLogger, mockCustomerService, mockAuthService }
}

describe('seedCustomer', () => {
  // ─── Early return (customer already exists) ────────────────────────────

  describe('when customer already exists', () => {
    it('does not call createCustomers', async () => {
      const { container, mockCustomerService } = makeContainer({
        existingCustomers: [{ id: 'cus_existing', email: TEST_EMAIL }],
      })
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomers).not.toHaveBeenCalled()
    })

    it('logs a warning that includes the customer email', async () => {
      const { container, mockLogger } = makeContainer({
        existingCustomers: [{ id: 'cus_existing', email: TEST_EMAIL }],
      })
      await seedCustomer({ container: container as never })
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining(TEST_EMAIL))
    })

    it('does not create an auth identity', async () => {
      const { container, mockAuthService } = makeContainer({
        existingCustomers: [{ id: 'cus_existing', email: TEST_EMAIL }],
      })
      await seedCustomer({ container: container as never })
      expect(mockAuthService.createAuthIdentities).not.toHaveBeenCalled()
    })

    it('does not create any addresses', async () => {
      const { container, mockCustomerService } = makeContainer({
        existingCustomers: [{ id: 'cus_existing', email: TEST_EMAIL }],
      })
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomerAddresses).not.toHaveBeenCalled()
    })
  })

  // ─── listCustomers call ────────────────────────────────────────────────

  describe('listCustomers', () => {
    it('queries by the seed email', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.listCustomers).toHaveBeenCalledWith({ email: TEST_EMAIL })
    })

    it('calls listCustomers exactly once', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.listCustomers).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Customer creation ─────────────────────────────────────────────────

  describe('customer creation', () => {
    it('calls createCustomers exactly once', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomers).toHaveBeenCalledTimes(1)
    })

    it('passes the correct first and last name', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Priya', last_name: 'Sharma' }),
      )
    })

    it('passes the seed email', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ email: TEST_EMAIL }),
      )
    })

    it('passes the phone number', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+91 9876543210' }),
      )
    })

    it('initialises metadata with an empty wishlist array', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { wishlist: [] } }),
      )
    })

    it('logs info containing the created customer id', async () => {
      const { container, mockLogger } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(TEST_CUSTOMER_ID))
    })
  })

  // ─── Auth identity creation ────────────────────────────────────────────

  describe('auth identity creation', () => {
    it('calls createAuthIdentities exactly once', async () => {
      const { container, mockAuthService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockAuthService.createAuthIdentities).toHaveBeenCalledTimes(1)
    })

    it('uses the emailpass provider', async () => {
      const { container, mockAuthService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockAuthService.createAuthIdentities).toHaveBeenCalledWith(
        expect.objectContaining({
          provider_identities: expect.arrayContaining([
            expect.objectContaining({ provider: 'emailpass' }),
          ]),
        }),
      )
    })

    it('sets entity_id to the seed email', async () => {
      const { container, mockAuthService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockAuthService.createAuthIdentities).toHaveBeenCalledWith(
        expect.objectContaining({
          provider_identities: expect.arrayContaining([
            expect.objectContaining({ entity_id: TEST_EMAIL }),
          ]),
        }),
      )
    })

    it('links auth identity to the new customer via app_metadata.customer_id', async () => {
      const { container, mockAuthService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockAuthService.createAuthIdentities).toHaveBeenCalledWith(
        expect.objectContaining({
          app_metadata: { customer_id: TEST_CUSTOMER_ID },
        }),
      )
    })

    it('uses the customer id returned by createCustomers, not a hardcoded value', async () => {
      const { container, mockAuthService } = makeContainer({
        createdCustomer: { id: 'cus_dynamic_99' },
      })
      await seedCustomer({ container: container as never })
      expect(mockAuthService.createAuthIdentities).toHaveBeenCalledWith(
        expect.objectContaining({
          app_metadata: { customer_id: 'cus_dynamic_99' },
        }),
      )
    })

    it('logs info that references the seed email after creating the identity', async () => {
      const { container, mockLogger } = makeContainer()
      await seedCustomer({ container: container as never })
      const authLog = (mockLogger.info.mock.calls as string[][]).find(
        ([msg]) => msg.includes(TEST_EMAIL) && msg.toLowerCase().includes('auth'),
      )
      expect(authLog).toBeDefined()
    })
  })

  // ─── Address creation ──────────────────────────────────────────────────

  describe('address creation', () => {
    it('creates exactly two addresses', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomerAddresses).toHaveBeenCalledTimes(2)
    })

    it('attaches customer_id to every address', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      const calls = mockCustomerService.createCustomerAddresses.mock.calls as Record<
        string,
        unknown
      >[][]
      calls.forEach((args) => {
        expect(args[0]).toMatchObject({ customer_id: TEST_CUSTOMER_ID })
      })
    })

    it('uses the dynamic customer id on every address', async () => {
      const { container, mockCustomerService } = makeContainer({
        createdCustomer: { id: 'cus_dynamic_99' },
      })
      await seedCustomer({ container: container as never })
      const calls = mockCustomerService.createCustomerAddresses.mock.calls as Record<
        string,
        unknown
      >[][]
      calls.forEach((args) => {
        expect(args[0]).toMatchObject({ customer_id: 'cus_dynamic_99' })
      })
    })

    it('creates one address marked as default shipping', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      const calls = mockCustomerService.createCustomerAddresses.mock.calls as Record<
        string,
        unknown
      >[][]
      const hasDefault = calls.some((args) => args[0]?.['is_default_shipping'] === true)
      expect(hasDefault).toBe(true)
    })

    it('creates one address that is not default shipping', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      const calls = mockCustomerService.createCustomerAddresses.mock.calls as Record<
        string,
        unknown
      >[][]
      const hasNonDefault = calls.some((args) => args[0]?.['is_default_shipping'] === false)
      expect(hasNonDefault).toBe(true)
    })

    it('creates a home address in Delhi with correct fields', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomerAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Delhi',
          country_code: 'in',
          is_default_shipping: true,
          is_default_billing: true,
          metadata: { label: 'Home' },
        }),
      )
    })

    it('creates an office address in Gurugram with correct fields', async () => {
      const { container, mockCustomerService } = makeContainer()
      await seedCustomer({ container: container as never })
      expect(mockCustomerService.createCustomerAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Gurugram',
          province: 'Haryana',
          is_default_shipping: false,
          is_default_billing: false,
          metadata: { label: 'Office' },
        }),
      )
    })

    it('logs the number of addresses created', async () => {
      const { container, mockLogger } = makeContainer()
      await seedCustomer({ container: container as never })
      const infoCalls = (mockLogger.info.mock.calls as string[][]).map(([msg]) => msg)
      expect(
        infoCalls.some((msg) => msg.includes('2') && msg.toLowerCase().includes('address')),
      ).toBe(true)
    })
  })

  // ─── Overall log flow ──────────────────────────────────────────────────

  describe('log output', () => {
    it('logs a start message before any service calls', async () => {
      const { container, mockLogger, mockCustomerService } = makeContainer()
      mockCustomerService.listCustomers.mockImplementation(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringMatching(/start/i))
        return Promise.resolve([])
      })
      await seedCustomer({ container: container as never })
    })

    it('logs a done message at the end of a successful seed', async () => {
      const { container, mockLogger } = makeContainer()
      await seedCustomer({ container: container as never })
      const infoCalls = (mockLogger.info.mock.calls as string[][]).map(([msg]) => msg)
      expect(infoCalls.some((msg) => msg.toLowerCase().includes('done'))).toBe(true)
    })

    it('logs the login email after seeding', async () => {
      const { container, mockLogger } = makeContainer()
      await seedCustomer({ container: container as never })
      const infoCalls = (mockLogger.info.mock.calls as string[][]).map(([msg]) => msg)
      expect(
        infoCalls.some((msg) => msg.toLowerCase().includes('login') && msg.includes(TEST_EMAIL)),
      ).toBe(true)
    })

    it('logs a note that orders are not directly seeded', async () => {
      const { container, mockLogger } = makeContainer()
      await seedCustomer({ container: container as never })
      const infoCalls = (mockLogger.info.mock.calls as string[][]).map(([msg]) => msg)
      expect(infoCalls.some((msg) => msg.toLowerCase().includes('order'))).toBe(true)
    })
  })
})
