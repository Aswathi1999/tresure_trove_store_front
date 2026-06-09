jest.mock('@medusajs/framework/utils', () => ({
  ContainerRegistrationKeys: { LOGGER: 'logger' },
  Modules: {
    ORDER: 'orderModuleService',
    NOTIFICATION: 'notificationModuleService',
  },
}))

import orderPlacedSubscriber from '../order-placed'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEFAULT_ORDER = {
  id: 'order_01',
  display_id: 'TT-0001',
  email: 'priya@example.com',
  currency_code: 'inr',
  created_at: '2026-01-01T10:00:00.000Z',
  shipping_address: {
    first_name: 'Priya',
    last_name: 'Sharma',
    address_1: '12 MG Road',
    address_2: null,
    city: 'Bengaluru',
    postal_code: '560001',
    country_code: 'in',
  },
  billing_address: null,
  items: [
    {
      id: 'li_01',
      title: 'Ōkura Lounge Chair',
      quantity: 1,
      unit_price: 14500000,
      thumbnail: 'https://cdn.treasuretrove.in/chair.jpg',
      variant: { title: 'Teak · Large' },
    },
    {
      id: 'li_02',
      title: 'Brass Pendant',
      quantity: 2,
      unit_price: 2499000,
      thumbnail: null,
      variant: null,
    },
  ],
  summary: {
    total: 19498000,
    subtotal: 19498000,
    tax_total: 0,
    shipping_total: 0,
  },
}

// ── Container factory ─────────────────────────────────────────────────────────

function makeContainer(
  overrides: {
    order?: typeof DEFAULT_ORDER | null
    createNotifications?: jest.Mock
    retrieveError?: Error
    notificationResolveError?: Error
  } = {},
) {
  const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }

  const mockOrderService = {
    retrieveOrder:
      overrides.order === undefined
        ? jest.fn().mockResolvedValue(DEFAULT_ORDER)
        : overrides.order === null
          ? jest.fn().mockResolvedValue(null)
          : jest.fn().mockResolvedValue(overrides.order),
  }

  if (overrides.retrieveError) {
    mockOrderService.retrieveOrder = jest.fn().mockRejectedValue(overrides.retrieveError)
  }

  const mockNotificationService = {
    createNotifications: overrides.createNotifications ?? jest.fn().mockResolvedValue(undefined),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === 'logger') return mockLogger
      if (key === 'orderModuleService') return mockOrderService
      if (key === 'notificationModuleService') {
        if (overrides.notificationResolveError) throw overrides.notificationResolveError
        return mockNotificationService
      }
      throw new Error(`Unknown service: ${key}`)
    }),
  }

  return { container, mockLogger, mockOrderService, mockNotificationService }
}

async function runSubscriber(orderId: string, container: unknown) {
  return orderPlacedSubscriber({
    event: { data: { id: orderId } } as never,
    container: container as never,
    pluginOptions: {} as never,
  })
}

// ── Logging ───────────────────────────────────────────────────────────────────

describe('logging', () => {
  it('logs the order ID at the start', async () => {
    const { container, mockLogger } = makeContainer()
    await runSubscriber('order_01', container)
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('order_01'))
  })

  it('logs success after dispatching the notification', async () => {
    const { container, mockLogger } = makeContainer()
    await runSubscriber('order_01', container)
    const infoCalls = (mockLogger.info.mock.calls as string[][]).map((c) => c[0])
    expect(infoCalls.some((m) => m.includes('order_01') && m.includes('dispatched'))).toBe(true)
  })
})

// ── Order retrieval ───────────────────────────────────────────────────────────

describe('order retrieval', () => {
  it('retrieves the order with the correct ID', async () => {
    const { container, mockOrderService } = makeContainer()
    await runSubscriber('order_01', container)
    expect(mockOrderService.retrieveOrder).toHaveBeenCalledWith(
      'order_01',
      expect.objectContaining({ relations: expect.arrayContaining(['items', 'shipping_address']) }),
    )
  })

  it('logs an error and returns when the order is not found', async () => {
    const { container, mockLogger } = makeContainer({ order: null })
    await expect(runSubscriber('order_missing', container)).resolves.toBeUndefined()
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('not found'))
  })
})

// ── Notification payload ──────────────────────────────────────────────────────

describe('notification payload', () => {
  it('sends notification to the order email address', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'priya@example.com' }),
    )
  })

  it('sends via the email channel', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    expect(createNotifications).toHaveBeenCalledWith(expect.objectContaining({ channel: 'email' }))
  })

  it('uses the order-confirmation template', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({ template: 'order-confirmation' }),
    )
  })

  it('includes order_id, display_id, email, and currency_code in data', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    const [payload] = createNotifications.mock.calls[0] as [{ data: Record<string, unknown> }]
    expect(payload.data.order_id).toBe('order_01')
    expect(payload.data.display_id).toBe('TT-0001')
    expect(payload.data.email).toBe('priya@example.com')
    expect(payload.data.currency_code).toBe('inr')
  })

  it('includes correct line_items structure', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    const [payload] = createNotifications.mock.calls[0] as [{ data: { line_items: unknown[] } }]
    expect(payload.data.line_items).toHaveLength(2)
    expect(payload.data.line_items[0]).toMatchObject({
      id: 'li_01',
      title: 'Ōkura Lounge Chair',
      quantity: 1,
      unit_price: 14500000,
      subtotal: 14500000,
    })
  })

  it('sets variant_title to null when the item has no variant', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    const [payload] = createNotifications.mock.calls[0] as [
      { data: { line_items: Array<{ variant_title: unknown }> } },
    ]
    const brassPendant = payload.data.line_items[1]
    expect(brassPendant.variant_title).toBeNull()
  })

  it('includes totals from order.summary', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    const [payload] = createNotifications.mock.calls[0] as [{ data: Record<string, unknown> }]
    expect(payload.data.total).toBe(19498000)
    expect(payload.data.subtotal).toBe(19498000)
    expect(payload.data.tax_total).toBe(0)
    expect(payload.data.shipping_total).toBe(0)
  })

  it('includes a formatted shipping_address string', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    const [payload] = createNotifications.mock.calls[0] as [{ data: { shipping_address: string } }]
    expect(payload.data.shipping_address).toContain('Priya')
    expect(payload.data.shipping_address).toContain('Bengaluru')
    expect(payload.data.shipping_address).toContain('IN')
  })

  it('includes item_count matching the number of line items', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    const [payload] = createNotifications.mock.calls[0] as [{ data: { item_count: number } }]
    expect(payload.data.item_count).toBe(2)
  })
})

// ── Error handling ────────────────────────────────────────────────────────────

describe('error handling', () => {
  it('does not rethrow when createNotifications fails', async () => {
    const createNotifications = jest.fn().mockRejectedValue(new Error('SMTP timeout'))
    const { container } = makeContainer({ createNotifications })
    await expect(runSubscriber('order_01', container)).resolves.toBeUndefined()
  })

  it('logs the error message when createNotifications fails', async () => {
    const createNotifications = jest.fn().mockRejectedValue(new Error('SMTP timeout'))
    const { container, mockLogger } = makeContainer({ createNotifications })
    await runSubscriber('order_01', container)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('SMTP timeout'))
  })

  it('does not rethrow when the notification service cannot be resolved', async () => {
    const { container } = makeContainer({
      notificationResolveError: new Error('Service not registered'),
    })
    await expect(runSubscriber('order_01', container)).resolves.toBeUndefined()
  })

  it('logs the error when the notification service cannot be resolved', async () => {
    const { container, mockLogger } = makeContainer({
      notificationResolveError: new Error('Service not registered'),
    })
    await runSubscriber('order_01', container)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Service not registered'))
  })
})
