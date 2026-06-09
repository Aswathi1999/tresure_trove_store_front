import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import seedPromos from '../seed-promos'

const INDIA_REGION = { id: 'reg_india_01', currency_code: 'inr', name: 'India' }
const UAE_REGION = { id: 'reg_uae_01', currency_code: 'aed', name: 'UAE' }
const SEA_REGION = { id: 'reg_sea_01', currency_code: 'usd', name: 'SEA' }
const ALL_REGIONS = [INDIA_REGION, UAE_REGION, SEA_REGION]

function makeContainer(
  overrides: {
    regions?: Array<{ id: string; currency_code: string; name: string }>
    existingPromos?: Array<{ id: string; code: string }>
  } = {},
) {
  const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }

  const mockPromotionService = {
    listPromotions: jest.fn().mockResolvedValue(overrides.existingPromos ?? []),
    createPromotions: jest
      .fn()
      .mockImplementation((promos: Array<{ code: string }>) =>
        Promise.resolve([{ id: 'promo_test_01', code: promos[0].code }]),
      ),
  }

  const mockRegionService = {
    listRegions: jest.fn().mockResolvedValue(overrides.regions ?? ALL_REGIONS),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === ContainerRegistrationKeys.LOGGER) return mockLogger
      if (key === Modules.PROMOTION) return mockPromotionService
      if (key === Modules.REGION) return mockRegionService
      throw new Error(`Unexpected container key: ${key}`)
    }),
  }

  return { container, mockLogger, mockPromotionService, mockRegionService }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('seedPromos', () => {
  // ─── Region fetching ──────────────────────────────────────────────────────

  describe('region fetching', () => {
    it('calls listRegions exactly once with an empty filter', async () => {
      const { container, mockRegionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockRegionService.listRegions).toHaveBeenCalledTimes(1)
      expect(mockRegionService.listRegions).toHaveBeenCalledWith({})
    })

    it('logs the number of regions found', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(
        infoCalls.some((msg) => msg.includes('3') && msg.toLowerCase().includes('region')),
      ).toBe(true)
    })

    it('includes each region currency code in the region count log', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      const regionLog = infoCalls.find((msg) => msg.includes('INR'))
      expect(regionLog).toContain('AED')
      expect(regionLog).toContain('USD')
    })
  })

  // ─── Idempotency — skip existing codes ───────────────────────────────────

  describe('when a promotion code already exists', () => {
    it('does not create the duplicate code', async () => {
      const { container, mockPromotionService } = makeContainer({
        existingPromos: [{ id: 'promo_existing', code: 'TT-INDIA-500' }],
      })
      await seedPromos({ container: container as never })
      const createdCodes = (
        mockPromotionService.createPromotions.mock.calls as [Array<{ code: string }>][]
      ).map(([arr]) => arr[0].code)
      expect(createdCodes).not.toContain('TT-INDIA-500')
    })

    it('logs a warning mentioning the skipped code', async () => {
      const { container, mockLogger } = makeContainer({
        existingPromos: [{ id: 'promo_existing', code: 'TT-INDIA-500' }],
      })
      await seedPromos({ container: container as never })
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('TT-INDIA-500'))
    })

    it('still creates the other two region promotions', async () => {
      const { container, mockPromotionService } = makeContainer({
        existingPromos: [{ id: 'promo_existing', code: 'TT-INDIA-500' }],
      })
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledTimes(2)
    })

    it('skips all three codes when all already exist', async () => {
      const { container, mockPromotionService } = makeContainer({
        existingPromos: [
          { id: 'promo_01', code: 'TT-INDIA-500' },
          { id: 'promo_02', code: 'TT-UAE-100' },
          { id: 'promo_03', code: 'TT-SEA-25' },
        ],
      })
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).not.toHaveBeenCalled()
    })
  })

  // ─── Missing region ───────────────────────────────────────────────────────

  describe('when a region currency is not found', () => {
    it('logs a warning mentioning the missing currency code', async () => {
      const { container, mockLogger } = makeContainer({
        regions: [INDIA_REGION, UAE_REGION], // USD / SEA region missing
      })
      await seedPromos({ container: container as never })
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('USD'))
    })

    it('does not create a promotion for the missing region', async () => {
      const { container, mockPromotionService } = makeContainer({
        regions: [INDIA_REGION, UAE_REGION],
      })
      await seedPromos({ container: container as never })
      const createdCodes = (
        mockPromotionService.createPromotions.mock.calls as [Array<{ code: string }>][]
      ).map(([arr]) => arr[0].code)
      expect(createdCodes).not.toContain('TT-SEA-25')
    })

    it('still creates promotions for regions that do exist', async () => {
      const { container, mockPromotionService } = makeContainer({
        regions: [INDIA_REGION, UAE_REGION],
      })
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledTimes(2)
    })

    it('skips all promotions when no regions are configured', async () => {
      const { container, mockPromotionService } = makeContainer({ regions: [] })
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).not.toHaveBeenCalled()
    })
  })

  // ─── Region-specific promotion rule logic ────────────────────────────────

  describe('region-specific promotion rules', () => {
    it('restricts TT-INDIA-500 to the INR region via region_id rule', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-INDIA-500',
            rules: expect.arrayContaining([
              expect.objectContaining({
                attribute: 'region_id',
                operator: 'in',
                values: [INDIA_REGION.id],
              }),
            ]),
          }),
        ]),
      )
    })

    it('restricts TT-UAE-100 to the AED region via region_id rule', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-UAE-100',
            rules: expect.arrayContaining([
              expect.objectContaining({
                attribute: 'region_id',
                operator: 'in',
                values: [UAE_REGION.id],
              }),
            ]),
          }),
        ]),
      )
    })

    it('restricts TT-SEA-25 to the USD region via region_id rule', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-SEA-25',
            rules: expect.arrayContaining([
              expect.objectContaining({
                attribute: 'region_id',
                operator: 'in',
                values: [SEA_REGION.id],
              }),
            ]),
          }),
        ]),
      )
    })

    it('uses the "in" operator for all region rules', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [
        Array<{ rules: Array<{ operator: string }> }>,
      ][]
      calls.forEach(([promoArr]) => {
        promoArr[0].rules.forEach((rule) => {
          expect(rule.operator).toBe('in')
        })
      })
    })

    it('uses the dynamically fetched region.id (not a hardcoded value)', async () => {
      const customIndia = { id: 'reg_custom_99', currency_code: 'inr', name: 'India Custom' }
      const { container, mockPromotionService } = makeContainer({
        regions: [customIndia, UAE_REGION, SEA_REGION],
      })
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-INDIA-500',
            rules: expect.arrayContaining([expect.objectContaining({ values: ['reg_custom_99'] })]),
          }),
        ]),
      )
    })
  })

  // ─── Usage limit enforcement ──────────────────────────────────────────────

  describe('usage limit configuration', () => {
    it('sets campaign budget type to "usage" for TT-INDIA-500', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-INDIA-500',
            campaign: expect.objectContaining({
              budget: expect.objectContaining({ type: 'usage' }),
            }),
          }),
        ]),
      )
    })

    it('uses "usage" budget type for all three promotions', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [
        Array<{ campaign: { budget: { type: string } } }>,
      ][]
      calls.forEach(([promoArr]) => {
        expect(promoArr[0].campaign.budget.type).toBe('usage')
      })
    })

    it('sets campaign budget limit to 100 for all three promotions', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [
        Array<{ campaign: { budget: { limit: number } } }>,
      ][]
      calls.forEach(([promoArr]) => {
        expect(promoArr[0].campaign.budget.limit).toBe(100)
      })
    })
  })

  // ─── Multi-currency application method ───────────────────────────────────

  describe('multi-currency application method', () => {
    it('creates TT-INDIA-500 with 50000 paise (₹500) fixed discount in INR', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-INDIA-500',
            application_method: expect.objectContaining({
              type: 'fixed',
              value: 50000,
              currency_code: 'inr',
            }),
          }),
        ]),
      )
    })

    it('creates TT-UAE-100 with 10000 fils (AED 100) fixed discount in AED', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-UAE-100',
            application_method: expect.objectContaining({
              type: 'fixed',
              value: 10000,
              currency_code: 'aed',
            }),
          }),
        ]),
      )
    })

    it('creates TT-SEA-25 with 2500 cents ($25) fixed discount in USD', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      expect(mockPromotionService.createPromotions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TT-SEA-25',
            application_method: expect.objectContaining({
              type: 'fixed',
              value: 2500,
              currency_code: 'usd',
            }),
          }),
        ]),
      )
    })

    it('targets "order" for all three promotions', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [
        Array<{ application_method: { target_type: string } }>,
      ][]
      calls.forEach(([promoArr]) => {
        expect(promoArr[0].application_method.target_type).toBe('order')
      })
    })

    it('sets allocation to "across" for all three promotions', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [
        Array<{ application_method: { allocation: string } }>,
      ][]
      calls.forEach(([promoArr]) => {
        expect(promoArr[0].application_method.allocation).toBe('across')
      })
    })

    it('creates all promotions as non-automatic coupon codes', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [
        Array<{ is_automatic: boolean }>,
      ][]
      calls.forEach(([promoArr]) => {
        expect(promoArr[0].is_automatic).toBe(false)
      })
    })

    it('creates all promotions with type "standard"', async () => {
      const { container, mockPromotionService } = makeContainer()
      await seedPromos({ container: container as never })
      const calls = mockPromotionService.createPromotions.mock.calls as [Array<{ type: string }>][]
      calls.forEach(([promoArr]) => {
        expect(promoArr[0].type).toBe('standard')
      })
    })
  })

  // ─── Gift card denomination logging ──────────────────────────────────────

  describe('gift card denomination logging', () => {
    it('logs the INR denomination reference', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('INR'))).toBe(true)
    })

    it('logs the USD denomination reference', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('USD'))).toBe(true)
    })

    it('logs the AED denomination reference', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('AED'))).toBe(true)
    })

    it('logs INR denominations including 50000 (₹500) and 500000 (₹5000)', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('INR') && msg.includes('50000'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('INR') && msg.includes('500000'))).toBe(true)
    })

    it('logs USD denominations including 2500 ($25) and 10000 ($100)', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('USD') && msg.includes('2500'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('USD') && msg.includes('10000'))).toBe(true)
    })

    it('logs AED denominations including 10000 (AED 100) and 50000 (AED 500)', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('AED') && msg.includes('10000'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('AED') && msg.includes('50000'))).toBe(true)
    })

    it('logs the admin API endpoint for creating gift cards', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('/admin/gift-cards'))).toBe(true)
    })
  })

  // ─── Log output ───────────────────────────────────────────────────────────

  describe('log output', () => {
    it('logs a start message before any service calls', async () => {
      const { container, mockLogger, mockRegionService } = makeContainer()
      mockRegionService.listRegions.mockImplementation(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringMatching(/start/i))
        return Promise.resolve(ALL_REGIONS)
      })
      await seedPromos({ container: container as never })
    })

    it('logs a done message at the end', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.toLowerCase().includes('done'))).toBe(true)
    })

    it('logs info containing each created promotion code', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('TT-INDIA-500'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('TT-UAE-100'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('TT-SEA-25'))).toBe(true)
    })

    it('logs the currency and amount for each created promotion', async () => {
      const { container, mockLogger } = makeContainer()
      await seedPromos({ container: container as never })
      const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
      expect(infoCalls.some((msg) => msg.includes('INR') && msg.includes('50000'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('AED') && msg.includes('10000'))).toBe(true)
      expect(infoCalls.some((msg) => msg.includes('USD') && msg.includes('2500'))).toBe(true)
    })
  })
})
