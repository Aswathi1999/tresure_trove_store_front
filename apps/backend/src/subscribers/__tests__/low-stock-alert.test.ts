import lowStockAlertSubscriber, { config, LOW_STOCK_THRESHOLD } from '../low-stock-alert'

type MockLogger = { info: jest.Mock; warn: jest.Mock; error: jest.Mock; debug: jest.Mock }

type MakeContainerOpts = {
  listInventoryItems?: jest.Mock
  inventoryResolveError?: Error
}

function makeContainer(overrides: MakeContainerOpts = {}): {
  container: Parameters<typeof lowStockAlertSubscriber>[0]['container']
  mockLogger: MockLogger
} {
  const mockLogger: MockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }

  const mockInventoryService = {
    listInventoryItems:
      overrides.listInventoryItems ??
      jest.fn().mockResolvedValue([{ id: 'iitem_01', sku: 'SKU-001' }]),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === 'logger') return mockLogger
      if (overrides.inventoryResolveError) throw overrides.inventoryResolveError
      return mockInventoryService
    }),
  } as unknown as Parameters<typeof lowStockAlertSubscriber>[0]['container']

  return { container, mockLogger }
}

function makeArgs(
  data: Partial<{
    id: string
    inventory_item_id: string | null
    location_id: string | null
    stocked_quantity: number | null
    reserved_quantity: number | null
  }> = {},
  container: Parameters<typeof lowStockAlertSubscriber>[0]['container'],
): Parameters<typeof lowStockAlertSubscriber>[0] {
  return {
    event: {
      data: {
        id: 'ilvl_01',
        inventory_item_id: 'iitem_01',
        location_id: 'sloc_01',
        stocked_quantity: 10,
        reserved_quantity: 0,
        ...data,
      },
    },
    container,
    pluginOptions: {},
  } as never
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('lowStockAlertSubscriber', () => {
  describe('config', () => {
    it('subscribes to inventory-level.updated', () => {
      expect(config.event).toBe('inventory-level.updated')
    })
  })

  describe('threshold logic', () => {
    it('does not log a low-stock warning when available stock is above the threshold', async () => {
      const { container, mockLogger } = makeContainer()
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: LOW_STOCK_THRESHOLD + 1, reserved_quantity: 0 }, container),
      )
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Low stock detected'),
      )
    })

    it('logs a low-stock warning when available stock exactly equals the threshold', async () => {
      const { container, mockLogger } = makeContainer()
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: LOW_STOCK_THRESHOLD, reserved_quantity: 0 }, container),
      )
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock detected'))
    })

    it('logs a low-stock warning when available stock is below the threshold', async () => {
      const { container, mockLogger } = makeContainer()
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: LOW_STOCK_THRESHOLD - 2, reserved_quantity: 0 }, container),
      )
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock detected'))
    })

    it('accounts for reserved_quantity when computing available stock', async () => {
      const { container, mockLogger } = makeContainer()
      // stocked=8, reserved=5 → available=3, which is below threshold=5
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: 8, reserved_quantity: 5 }, container),
      )
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock detected'))
    })

    it('does not log a warning when available stock is above threshold after accounting for reserved', async () => {
      const { container, mockLogger } = makeContainer()
      // stocked=20, reserved=5 → available=15, which is above threshold=5
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: 20, reserved_quantity: 5 }, container),
      )
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Low stock detected'),
      )
    })

    it('includes SKU, location, available count and threshold in the warning', async () => {
      const { container, mockLogger } = makeContainer()
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: 3, reserved_quantity: 0, location_id: 'sloc_wh1' }, container),
      )
      const [msg] = mockLogger.warn.mock.calls.find((c: unknown[]) =>
        (c[0] as string).includes('Low stock detected'),
      ) as [string]
      expect(msg).toContain('SKU-001')
      expect(msg).toContain('sloc_wh1')
      expect(msg).toContain('3')
      expect(msg).toContain(String(LOW_STOCK_THRESHOLD))
    })
  })

  describe('null / undefined inventory data', () => {
    it('logs a warning and returns early when stocked_quantity is null', async () => {
      const { container, mockLogger } = makeContainer()
      await expect(
        lowStockAlertSubscriber(makeArgs({ stocked_quantity: null }, container)),
      ).resolves.toBeUndefined()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('stocked_quantity is null or undefined'),
      )
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Low stock detected'),
      )
    })

    it('logs a warning and returns early when stocked_quantity is undefined', async () => {
      const { container, mockLogger } = makeContainer()
      const args = {
        event: { data: { id: 'ilvl_01', inventory_item_id: 'iitem_01', location_id: 'sloc_01' } },
        container,
        pluginOptions: {},
      } as never
      await expect(lowStockAlertSubscriber(args)).resolves.toBeUndefined()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('stocked_quantity is null or undefined'),
      )
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Low stock detected'),
      )
    })

    it('treats null reserved_quantity as zero', async () => {
      const { container, mockLogger } = makeContainer()
      await lowStockAlertSubscriber(
        makeArgs({ stocked_quantity: 3, reserved_quantity: null }, container),
      )
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock detected'))
    })

    it('does not crash and still logs a warning when inventory_item_id is null', async () => {
      const { container, mockLogger } = makeContainer()
      await expect(
        lowStockAlertSubscriber(
          makeArgs({ stocked_quantity: 2, inventory_item_id: null }, container),
        ),
      ).resolves.toBeUndefined()
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock detected'))
    })
  })

  describe('inventory service errors', () => {
    it('logs a warn and does not rethrow when the inventory service cannot be resolved', async () => {
      const { container, mockLogger } = makeContainer({
        inventoryResolveError: new Error('Inventory module not registered'),
      })
      await expect(
        lowStockAlertSubscriber(makeArgs({ stocked_quantity: 2 }, container)),
      ).resolves.toBeUndefined()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Inventory module not registered'),
      )
    })

    it('logs a warn and does not rethrow when listInventoryItems rejects', async () => {
      const { container, mockLogger } = makeContainer({
        listInventoryItems: jest.fn().mockRejectedValue(new Error('DB connection lost')),
      })
      await expect(
        lowStockAlertSubscriber(makeArgs({ stocked_quantity: 2 }, container)),
      ).resolves.toBeUndefined()
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('DB connection lost'))
    })

    it('still emits the low-stock warning after a failed inventory item lookup', async () => {
      const { container, mockLogger } = makeContainer({
        listInventoryItems: jest.fn().mockRejectedValue(new Error('DB timeout')),
      })
      await lowStockAlertSubscriber(makeArgs({ stocked_quantity: 2 }, container))
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock detected'))
    })
  })
})
