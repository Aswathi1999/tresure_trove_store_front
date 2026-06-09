import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import seedRegions from '../seed-regions'

// ── Container factory ─────────────────────────────────────────────────────────

function makeContainer(
  overrides: {
    existingRegions?: Array<{ id: string; name: string; currency_code: string }>
    existingTaxRegions?: Array<{ id: string; country_code: string }>
    regionServiceError?: Error
  } = {},
) {
  const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }

  const mockRegionService = {
    listRegions: overrides.regionServiceError
      ? jest.fn().mockRejectedValue(overrides.regionServiceError)
      : jest.fn().mockResolvedValue(overrides.existingRegions ?? []),
    createRegions: jest
      .fn()
      .mockImplementation((data: { name: string; currency_code: string; countries: string[] }) =>
        Promise.resolve({ id: `reg_${data.name.toLowerCase().replace(/\s/g, '_')}_01`, ...data }),
      ),
  }

  const mockTaxService = {
    listTaxRegions: jest.fn().mockResolvedValue(overrides.existingTaxRegions ?? []),
    createTaxRegions: jest
      .fn()
      .mockImplementation((data: { country_code: string }) =>
        Promise.resolve({ id: `txreg_${data.country_code.toLowerCase()}_01`, ...data }),
      ),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === ContainerRegistrationKeys.LOGGER) return mockLogger
      if (key === Modules.REGION) return mockRegionService
      if (key === Modules.TAX) return mockTaxService
      throw new Error(`Unexpected container key: ${key}`)
    }),
  }

  return { container, mockLogger, mockRegionService, mockTaxService }
}

beforeEach(() => jest.clearAllMocks())

// ── Region creation ───────────────────────────────────────────────────────────

describe('region creation', () => {
  it('creates the India region with INR currency', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'India', currency_code: 'inr' }),
    )
  })

  it('creates the UAE region with AED currency', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'UAE', currency_code: 'aed' }),
    )
  })

  it('creates the Southeast Asia region with USD currency', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Southeast Asia', currency_code: 'usd' }),
    )
  })

  it('assigns country code "in" to the India region', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'India', countries: expect.arrayContaining(['in']) }),
    )
  })

  it('assigns country code "ae" to the UAE region', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'UAE', countries: expect.arrayContaining(['ae']) }),
    )
  })

  it('assigns all 6 SEA country codes to the Southeast Asia region', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Southeast Asia',
        countries: expect.arrayContaining(['sg', 'my', 'th', 'ph', 'id', 'vn']),
      }),
    )
  })

  it('calls createRegions exactly 3 times when no regions exist', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledTimes(3)
  })
})

// ── Tax region creation ───────────────────────────────────────────────────────

describe('tax region creation', () => {
  it('creates the India tax region with 18% GST for country code IN', async () => {
    const { container, mockTaxService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockTaxService.createTaxRegions).toHaveBeenCalledWith(
      expect.objectContaining({
        country_code: 'IN',
        default_tax_rate: expect.objectContaining({ rate: 18, code: 'GST' }),
      }),
    )
  })

  it('creates the UAE tax region with 5% VAT for country code AE', async () => {
    const { container, mockTaxService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockTaxService.createTaxRegions).toHaveBeenCalledWith(
      expect.objectContaining({
        country_code: 'AE',
        default_tax_rate: expect.objectContaining({ rate: 5, code: 'VAT' }),
      }),
    )
  })

  it('creates 0% tax regions for each of the 6 SEA countries', async () => {
    const { container, mockTaxService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    for (const cc of ['SG', 'MY', 'TH', 'PH', 'ID', 'VN']) {
      expect(mockTaxService.createTaxRegions).toHaveBeenCalledWith(
        expect.objectContaining({
          country_code: cc,
          default_tax_rate: expect.objectContaining({ rate: 0 }),
        }),
      )
    }
  })

  it('creates 8 tax region entries total (1 India + 1 UAE + 6 SEA)', async () => {
    const { container, mockTaxService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockTaxService.createTaxRegions).toHaveBeenCalledTimes(8)
  })

  it('India tax rate (18%) is different from UAE (5%) and SEA (0%)', async () => {
    const { container, mockTaxService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const calls = mockTaxService.createTaxRegions.mock.calls as [
      { country_code: string; default_tax_rate: { rate: number } },
    ][]
    const inRate = calls.find(([d]) => d.country_code === 'IN')?.[0].default_tax_rate.rate
    const aeRate = calls.find(([d]) => d.country_code === 'AE')?.[0].default_tax_rate.rate
    const sgRate = calls.find(([d]) => d.country_code === 'SG')?.[0].default_tax_rate.rate
    expect(inRate).toBe(18)
    expect(aeRate).toBe(5)
    expect(sgRate).toBe(0)
    expect(inRate).not.toBe(aeRate)
    expect(aeRate).not.toBe(sgRate)
  })
})

// ── Idempotency — regions ─────────────────────────────────────────────────────

describe('idempotency — existing regions', () => {
  it('skips India region creation when India already exists', async () => {
    const { container, mockRegionService } = makeContainer({
      existingRegions: [{ id: 'reg_india_01', name: 'India', currency_code: 'inr' }],
    })
    await seedRegions({ container: container as never, args: [] as never })
    const createdNames = (mockRegionService.createRegions.mock.calls as [{ name: string }][]).map(
      ([d]) => d.name,
    )
    expect(createdNames).not.toContain('India')
  })

  it('creates UAE and SEA even when India already exists', async () => {
    const { container, mockRegionService } = makeContainer({
      existingRegions: [{ id: 'reg_india_01', name: 'India', currency_code: 'inr' }],
    })
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).toHaveBeenCalledTimes(2)
  })

  it('skips all region creation when all three already exist', async () => {
    const { container, mockRegionService } = makeContainer({
      existingRegions: [
        { id: 'reg_india_01', name: 'India', currency_code: 'inr' },
        { id: 'reg_uae_01', name: 'UAE', currency_code: 'aed' },
        { id: 'reg_sea_01', name: 'Southeast Asia', currency_code: 'usd' },
      ],
    })
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockRegionService.createRegions).not.toHaveBeenCalled()
  })

  it('logs a warning when a region is skipped', async () => {
    const { container, mockLogger } = makeContainer({
      existingRegions: [{ id: 'reg_india_01', name: 'India', currency_code: 'inr' }],
    })
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('India'))
  })
})

// ── Idempotency — tax regions ─────────────────────────────────────────────────

describe('idempotency — existing tax regions', () => {
  it('skips tax region creation for IN when it already exists', async () => {
    const { container, mockTaxService } = makeContainer({
      existingTaxRegions: [{ id: 'txreg_in_01', country_code: 'IN' }],
    })
    await seedRegions({ container: container as never, args: [] as never })
    const createdCountries = (
      mockTaxService.createTaxRegions.mock.calls as [{ country_code: string }][]
    ).map(([d]) => d.country_code)
    expect(createdCountries).not.toContain('IN')
  })

  it('skips all tax region creation when all 8 already exist', async () => {
    const existingTaxRegions = ['IN', 'AE', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN'].map((cc) => ({
      id: `txreg_${cc.toLowerCase()}_01`,
      country_code: cc,
    }))
    const { container, mockTaxService } = makeContainer({ existingTaxRegions })
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockTaxService.createTaxRegions).not.toHaveBeenCalled()
  })

  it('logs a warning when a tax region is skipped', async () => {
    const { container, mockLogger } = makeContainer({
      existingTaxRegions: [{ id: 'txreg_in_01', country_code: 'IN' }],
    })
    await seedRegions({ container: container as never, args: [] as never })
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('IN'))
  })
})

// ── Logging ───────────────────────────────────────────────────────────────────

describe('logging', () => {
  it('logs a start message', async () => {
    const { container, mockLogger } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
    expect(infoCalls.some((msg) => msg.toLowerCase().includes('start'))).toBe(true)
  })

  it('logs a done message at the end', async () => {
    const { container, mockLogger } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
    expect(infoCalls.some((msg) => msg.toLowerCase().includes('done'))).toBe(true)
  })

  it('logs info for each created region including currency code', async () => {
    const { container, mockLogger } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
    expect(infoCalls.some((msg) => msg.includes('India') && msg.includes('inr'))).toBe(true)
    expect(infoCalls.some((msg) => msg.includes('UAE') && msg.includes('aed'))).toBe(true)
    expect(infoCalls.some((msg) => msg.includes('Southeast Asia') && msg.includes('usd'))).toBe(
      true,
    )
  })

  it('logs the next step instructions for payment provider assignment', async () => {
    const { container, mockLogger } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const infoCalls = mockLogger.info.mock.calls.map((c: unknown[]) => String(c[0]))
    expect(infoCalls.some((msg) => msg.toLowerCase().includes('razorpay'))).toBe(true)
    expect(infoCalls.some((msg) => msg.toLowerCase().includes('stripe'))).toBe(true)
  })
})

// ── Integration — region ↔ payment provider mapping ──────────────────────────

describe('integration — region configuration matches payment provider setup', () => {
  it('India region uses INR — the currency expected by the Razorpay payment provider', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const indiaCalls = (
      mockRegionService.createRegions.mock.calls as [{ name: string; currency_code: string }][]
    ).filter(([d]) => d.name === 'India')
    expect(indiaCalls[0][0].currency_code).toBe('inr')
  })

  it('UAE region uses AED — the currency expected by the Stripe payment provider', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const uaeCalls = (
      mockRegionService.createRegions.mock.calls as [{ name: string; currency_code: string }][]
    ).filter(([d]) => d.name === 'UAE')
    expect(uaeCalls[0][0].currency_code).toBe('aed')
  })

  it('SEA region uses USD — the currency expected by the Stripe payment provider', async () => {
    const { container, mockRegionService } = makeContainer()
    await seedRegions({ container: container as never, args: [] as never })
    const seaCalls = (
      mockRegionService.createRegions.mock.calls as [{ name: string; currency_code: string }][]
    ).filter(([d]) => d.name === 'Southeast Asia')
    expect(seaCalls[0][0].currency_code).toBe('usd')
  })
})
