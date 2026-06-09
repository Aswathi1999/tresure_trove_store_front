/**
 * Integration tests for the order lifecycle workflows.
 *
 * Each scenario runs workflow steps in sequence — mirroring what the workflow
 * engine does at runtime. Medusa module services are mocked; only the step
 * pipeline logic is verified end-to-end.
 */

const capturedHandlers: Record<
  string,
  (input: unknown, ctx: { container: unknown }) => Promise<unknown>
> = {}

const capturedCompensations: Record<
  string,
  (input: unknown, ctx: { container: unknown }) => Promise<void>
> = {}

jest.mock('@medusajs/framework/workflows-sdk', () => ({
  createStep: jest.fn(
    (
      name: string,
      handler: (input: unknown, ctx: { container: unknown }) => Promise<unknown>,
      compensation?: (input: unknown, ctx: { container: unknown }) => Promise<void>,
    ) => {
      capturedHandlers[name] = handler
      if (compensation) capturedCompensations[name] = compensation
      return jest.fn()
    },
  ),
  createWorkflow: jest.fn(),
  StepResponse: class StepResponse {
    constructor(
      public result: unknown,
      public compensationData?: unknown,
    ) {}
  },
  WorkflowResponse: class WorkflowResponse {
    constructor(public result: unknown) {}
  },
  transform: jest.fn(),
}))

jest.mock('@medusajs/framework/utils', () => ({
  ContainerRegistrationKeys: {
    LOGGER: 'logger',
    EVENT_BUS: 'eventBus',
    QUERY: 'query',
  },
  Modules: {
    ORDER: 'orderModuleService',
    FULFILLMENT: 'fulfillmentModuleService',
    PAYMENT: 'paymentModuleService',
    INVENTORY: 'inventoryModuleService',
  },
}))

jest.mock('@medusajs/medusa/core-flows', () => ({ useQueryGraphStep: jest.fn() }))

import '../create-fulfillment-workflow'
import '../mark-shipped-workflow'
import '../mark-delivered-workflow'
import '../return-workflow'
import '../refund-workflow'
import '../exchange-workflow'

// ── Types ─────────────────────────────────────────────────────────────────────

type StepResult<T = unknown> = { result: T }

type MockOrder = {
  id: string
  status: string
  currency_code: string
  email: string
  shipping_address?: Record<string, string>
  items?: Array<{ id: string; quantity: number; fulfilled_quantity: number; unit_price: number }>
}

type MockFulfillment = {
  id: string
  shipped_at?: string | null
  delivered_at?: string | null
}

type MockPayment = {
  id: string
  amount: number
  captured_at?: string | null
  refunds?: Array<{ amount: number }>
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEFAULT_ORDER: MockOrder = {
  id: 'order_01',
  status: 'pending',
  currency_code: 'inr',
  email: 'priya@example.com',
  shipping_address: {
    first_name: 'Priya',
    last_name: 'Sharma',
    address_1: '12 MG Road',
    city: 'Bengaluru',
    country_code: 'in',
    postal_code: '560001',
  },
  items: [
    { id: 'li_01', quantity: 2, fulfilled_quantity: 2, unit_price: 14500000 },
    { id: 'li_02', quantity: 1, fulfilled_quantity: 1, unit_price: 5000000 },
  ],
}

const DEFAULT_FULFILLMENT: MockFulfillment = {
  id: 'ful_01',
  shipped_at: null,
  delivered_at: null,
}

const DEFAULT_PAYMENT: MockPayment = {
  id: 'pay_01',
  amount: 34000000,
  captured_at: '2026-01-01T10:00:00.000Z',
  refunds: [],
}

// ── Container factory ─────────────────────────────────────────────────────────

function makeContainer(
  overrides: {
    order?: Partial<MockOrder> | null
    fulfillment?: Partial<MockFulfillment> | null
    payment?: Partial<MockPayment> | null
    lineItems?: unknown[]
  } = {},
) {
  const order =
    overrides.order === null
      ? null
      : overrides.order !== undefined
        ? { ...DEFAULT_ORDER, ...overrides.order }
        : DEFAULT_ORDER

  const fulfillment =
    overrides.fulfillment === null
      ? null
      : overrides.fulfillment !== undefined
        ? { ...DEFAULT_FULFILLMENT, ...overrides.fulfillment }
        : DEFAULT_FULFILLMENT

  const payment =
    overrides.payment === null
      ? null
      : overrides.payment !== undefined
        ? { ...DEFAULT_PAYMENT, ...overrides.payment }
        : DEFAULT_PAYMENT

  const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
  const mockEventBus = { emit: jest.fn().mockResolvedValue(undefined) }

  const mockOrderService = {
    retrieveOrder: jest.fn().mockResolvedValue(order),
    createReturn: jest.fn().mockResolvedValue({ id: 'ret_01', status: 'requested' }),
    createOrders: jest.fn().mockResolvedValue({ id: 'order_draft_01' }),
  }

  const mockFulfillmentService = {
    retrieveFulfillment: jest.fn().mockResolvedValue(fulfillment),
    createFulfillment: jest.fn().mockResolvedValue({ id: 'ful_01' }),
    updateFulfillment: jest
      .fn()
      .mockImplementation(async (id: string, data: Record<string, unknown>) => ({ id, ...data })),
    cancelFulfillment: jest.fn().mockResolvedValue(undefined),
  }

  const mockPaymentService = {
    retrievePayment: jest.fn().mockResolvedValue(payment),
    refundPayment: jest.fn().mockResolvedValue({ id: 'ref_01' }),
  }

  const mockInventoryService = {
    adjustInventory: jest.fn().mockResolvedValue(undefined),
  }

  const mockQuery = {
    graph: jest.fn().mockResolvedValue({
      data: overrides.lineItems ?? [
        { id: 'li_01', variant: { inventory_items: [{ inventory_item_id: 'inv_01' }] } },
        { id: 'li_02', variant: { inventory_items: [{ inventory_item_id: 'inv_02' }] } },
      ],
    }),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      switch (key) {
        case 'logger':
          return mockLogger
        case 'eventBus':
          return mockEventBus
        case 'orderModuleService':
          return mockOrderService
        case 'fulfillmentModuleService':
          return mockFulfillmentService
        case 'paymentModuleService':
          return mockPaymentService
        case 'inventoryModuleService':
          return mockInventoryService
        case 'query':
          return mockQuery
        default:
          throw new Error(`Unknown service key: ${key}`)
      }
    }),
  }

  return {
    container,
    mockLogger,
    mockEventBus,
    mockOrderService,
    mockFulfillmentService,
    mockPaymentService,
    mockInventoryService,
    mockQuery,
  }
}

type Container = ReturnType<typeof makeContainer>['container']

async function runStep<R>(
  name: string,
  input: unknown,
  container: Container,
): Promise<StepResult<R>> {
  return capturedHandlers[name]!(input, { container }) as Promise<StepResult<R>>
}

async function runCompensation(name: string, data: unknown, container: Container): Promise<void> {
  return capturedCompensations[name]!(data, { container }) as Promise<void>
}

beforeEach(() => jest.clearAllMocks())

// ── create-fulfillment-workflow ───────────────────────────────────────────────

describe('validate-order-for-fulfillment', () => {
  it('passes for a pending order and returns order metadata', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ order_id: string; currency_code: string; email: string }>(
      'validate-order-for-fulfillment',
      { order_id: 'order_01' },
      container,
    )
    expect(r.result.order_id).toBe('order_01')
    expect(r.result.currency_code).toBe('inr')
    expect(r.result.email).toBe('priya@example.com')
  })

  it('passes for a processing order', async () => {
    const { container } = makeContainer({ order: { status: 'processing' } })
    await expect(
      runStep('validate-order-for-fulfillment', { order_id: 'order_01' }, container),
    ).resolves.toBeDefined()
  })

  it('throws for an order with non-fulfillable status', async () => {
    const { container } = makeContainer({ order: { status: 'shipped' } })
    await expect(
      runStep('validate-order-for-fulfillment', { order_id: 'order_01' }, container),
    ).rejects.toThrow('cannot be fulfilled')
  })

  it('throws when the order service returns null', async () => {
    const { container } = makeContainer({ order: null })
    await expect(
      runStep('validate-order-for-fulfillment', { order_id: 'order_missing' }, container),
    ).rejects.toThrow()
  })
})

describe('create-fulfillment-record', () => {
  const INPUT = {
    order_id: 'order_01',
    order_currency_code: 'inr',
    order_email: 'priya@example.com',
    location_id: 'loc_01',
    provider_id: 'manual',
    items: [{ line_item_id: 'li_01', quantity: 2, title: 'Ōkura Chair', sku: 'OKR-TK-L' }],
  }

  it('calls createFulfillment with the correct location and items', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runStep('create-fulfillment-record', INPUT, container)
    expect(mockFulfillmentService.createFulfillment).toHaveBeenCalledWith(
      expect.objectContaining({
        location_id: 'loc_01',
        provider_id: 'manual',
        items: expect.arrayContaining([
          expect.objectContaining({ line_item_id: 'li_01', quantity: 2 }),
        ]),
      }),
    )
  })

  it('returns the fulfillment ID', async () => {
    const { container } = makeContainer()
    const r = await runStep<string>('create-fulfillment-record', INPUT, container)
    expect(r.result).toBe('ful_01')
  })

  it('includes order_id in fulfillment metadata', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runStep('create-fulfillment-record', INPUT, container)
    expect(mockFulfillmentService.createFulfillment).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ order_id: 'order_01' }),
      }),
    )
  })

  it('compensation calls cancelFulfillment with the fulfillment ID', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runCompensation('create-fulfillment-record', 'ful_99', container)
    expect(mockFulfillmentService.cancelFulfillment).toHaveBeenCalledWith('ful_99')
  })
})

describe('emit-fulfillment-created-event', () => {
  it('emits fulfillment.created with fulfillment and order IDs', async () => {
    const { container, mockEventBus } = makeContainer()
    await runStep(
      'emit-fulfillment-created-event',
      { fulfillment_id: 'ful_01', order_id: 'order_01' },
      container,
    )
    expect(mockEventBus.emit).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'fulfillment.created',
        data: { fulfillment_id: 'ful_01', order_id: 'order_01' },
      }),
    ])
  })

  it('returns emitted: true', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ emitted: boolean }>(
      'emit-fulfillment-created-event',
      { fulfillment_id: 'ful_01', order_id: 'order_01' },
      container,
    )
    expect(r.result.emitted).toBe(true)
  })
})

// ── mark-shipped-workflow ─────────────────────────────────────────────────────

describe('validate-fulfillment-for-shipment', () => {
  it('passes for an unshipped fulfillment', async () => {
    const { container } = makeContainer()
    await expect(
      runStep('validate-fulfillment-for-shipment', { fulfillment_id: 'ful_01' }, container),
    ).resolves.toBeDefined()
  })

  it('throws when the fulfillment is already shipped', async () => {
    const { container } = makeContainer({ fulfillment: { shipped_at: '2026-01-02T00:00:00Z' } })
    await expect(
      runStep('validate-fulfillment-for-shipment', { fulfillment_id: 'ful_01' }, container),
    ).rejects.toThrow('already been marked as shipped')
  })

  it('throws when the fulfillment is not found', async () => {
    const { container } = makeContainer({ fulfillment: null })
    await expect(
      runStep('validate-fulfillment-for-shipment', { fulfillment_id: 'ful_missing' }, container),
    ).rejects.toThrow()
  })
})

describe('create-shipment-with-tracking', () => {
  it('calls updateFulfillment with shipped_at, labels, and metadata', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runStep(
      'create-shipment-with-tracking',
      {
        fulfillment_id: 'ful_01',
        tracking_number: 'DELHIVERY-123',
        carrier: 'Delhivery',
      },
      container,
    )
    expect(mockFulfillmentService.updateFulfillment).toHaveBeenCalledWith(
      'ful_01',
      expect.objectContaining({
        shipped_at: expect.any(Date),
        labels: expect.arrayContaining([
          expect.objectContaining({ tracking_number: 'DELHIVERY-123' }),
        ]),
        metadata: expect.objectContaining({
          carrier: 'Delhivery',
          tracking_number: 'DELHIVERY-123',
        }),
      }),
    )
  })

  it('returns the tracking number and carrier', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ fulfillment_id: string; tracking_number: string; carrier: string }>(
      'create-shipment-with-tracking',
      { fulfillment_id: 'ful_01', tracking_number: 'BLUE-DART-999', carrier: 'Blue Dart' },
      container,
    )
    expect(r.result.tracking_number).toBe('BLUE-DART-999')
    expect(r.result.carrier).toBe('Blue Dart')
    expect(r.result.fulfillment_id).toBe('ful_01')
  })

  it('compensation clears shipped_at and labels', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runCompensation(
      'create-shipment-with-tracking',
      { fulfillment_id: 'ful_01', previous_shipped_at: null },
      container,
    )
    expect(mockFulfillmentService.updateFulfillment).toHaveBeenCalledWith(
      'ful_01',
      expect.objectContaining({ shipped_at: undefined, labels: [] }),
    )
  })
})

describe('emit-shipment-created-event', () => {
  it('emits order.shipment_created with tracking payload', async () => {
    const { container, mockEventBus } = makeContainer()
    await runStep(
      'emit-shipment-created-event',
      {
        fulfillment_id: 'ful_01',
        tracking_number: 'DELHIVERY-123',
        carrier: 'Delhivery',
      },
      container,
    )
    expect(mockEventBus.emit).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'order.shipment_created',
        data: expect.objectContaining({
          fulfillment_id: 'ful_01',
          tracking_number: 'DELHIVERY-123',
          carrier: 'Delhivery',
        }),
      }),
    ])
  })
})

// ── mark-delivered-workflow ───────────────────────────────────────────────────

describe('validate-fulfillment-for-delivery', () => {
  it('passes for a shipped, undelivered fulfillment', async () => {
    const { container } = makeContainer({
      fulfillment: { shipped_at: '2026-01-02T00:00:00Z', delivered_at: null },
    })
    await expect(
      runStep('validate-fulfillment-for-delivery', { fulfillment_id: 'ful_01' }, container),
    ).resolves.toBeDefined()
  })

  it('throws when the fulfillment has not been shipped', async () => {
    const { container } = makeContainer({ fulfillment: { shipped_at: null, delivered_at: null } })
    await expect(
      runStep('validate-fulfillment-for-delivery', { fulfillment_id: 'ful_01' }, container),
    ).rejects.toThrow('not been shipped yet')
  })

  it('throws when the fulfillment is already delivered', async () => {
    const { container } = makeContainer({
      fulfillment: { shipped_at: '2026-01-02T00:00:00Z', delivered_at: '2026-01-03T00:00:00Z' },
    })
    await expect(
      runStep('validate-fulfillment-for-delivery', { fulfillment_id: 'ful_01' }, container),
    ).rejects.toThrow('already been marked as delivered')
  })
})

describe('mark-fulfillment-delivered', () => {
  it('calls updateFulfillment with a delivered_at Date', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runStep('mark-fulfillment-delivered', { fulfillment_id: 'ful_01' }, container)
    expect(mockFulfillmentService.updateFulfillment).toHaveBeenCalledWith(
      'ful_01',
      expect.objectContaining({ delivered_at: expect.any(Date) }),
    )
  })

  it('returns fulfillment_id and an ISO delivered_at string', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ fulfillment_id: string; delivered_at: string }>(
      'mark-fulfillment-delivered',
      { fulfillment_id: 'ful_01' },
      container,
    )
    expect(r.result.fulfillment_id).toBe('ful_01')
    expect(typeof r.result.delivered_at).toBe('string')
    expect(new Date(r.result.delivered_at).getTime()).toBeGreaterThan(0)
  })

  it('compensation clears delivered_at', async () => {
    const { container, mockFulfillmentService } = makeContainer()
    await runCompensation('mark-fulfillment-delivered', { fulfillment_id: 'ful_01' }, container)
    expect(mockFulfillmentService.updateFulfillment).toHaveBeenCalledWith(
      'ful_01',
      expect.objectContaining({ delivered_at: undefined }),
    )
  })
})

describe('emit-order-delivered-event', () => {
  it('emits order.delivered with fulfillment_id', async () => {
    const { container, mockEventBus } = makeContainer()
    await runStep(
      'emit-order-delivered-event',
      {
        fulfillment_id: 'ful_01',
        delivered_at: '2026-01-03T12:00:00Z',
      },
      container,
    )
    expect(mockEventBus.emit).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'order.delivered',
        data: expect.objectContaining({ fulfillment_id: 'ful_01' }),
      }),
    ])
  })
})

// ── return-workflow ───────────────────────────────────────────────────────────

describe('validate-return-items', () => {
  it('passes when quantity is within the fulfilled quantity', async () => {
    const { container } = makeContainer()
    await expect(
      runStep(
        'validate-return-items',
        {
          order_id: 'order_01',
          items: [{ line_item_id: 'li_01', quantity: 1 }],
        },
        container,
      ),
    ).resolves.toBeDefined()
  })

  it('passes for exact fulfilled quantity', async () => {
    const { container } = makeContainer()
    await expect(
      runStep(
        'validate-return-items',
        {
          order_id: 'order_01',
          items: [{ line_item_id: 'li_01', quantity: 2 }],
        },
        container,
      ),
    ).resolves.toBeDefined()
  })

  it('throws when quantity exceeds fulfilled_quantity', async () => {
    const { container } = makeContainer()
    await expect(
      runStep(
        'validate-return-items',
        {
          order_id: 'order_01',
          items: [{ line_item_id: 'li_01', quantity: 5 }],
        },
        container,
      ),
    ).rejects.toThrow('only 2 fulfilled')
  })

  it('throws when the line item does not exist on the order', async () => {
    const { container } = makeContainer()
    await expect(
      runStep(
        'validate-return-items',
        {
          order_id: 'order_01',
          items: [{ line_item_id: 'li_unknown', quantity: 1 }],
        },
        container,
      ),
    ).rejects.toThrow('not found on order')
  })
})

describe('create-return-record', () => {
  it('calls orderService.createReturn with the correct items', async () => {
    const { container, mockOrderService } = makeContainer()
    await runStep(
      'create-return-record',
      {
        order_id: 'order_01',
        items: [{ line_item_id: 'li_01', quantity: 1, reason: 'Damaged on arrival' }],
      },
      container,
    )
    expect(mockOrderService.createReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order_01',
        items: expect.arrayContaining([expect.objectContaining({ id: 'li_01', quantity: 1 })]),
      }),
    )
  })

  it('returns return_id, order_id, and status', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ return_id: string; order_id: string; status: string }>(
      'create-return-record',
      { order_id: 'order_01', items: [{ line_item_id: 'li_01', quantity: 1 }] },
      container,
    )
    expect(r.result.return_id).toBe('ret_01')
    expect(r.result.order_id).toBe('order_01')
    expect(r.result.status).toBe('requested')
  })
})

describe('restore-inventory-for-return', () => {
  it('calls adjustInventory for each returned item', async () => {
    const { container, mockInventoryService } = makeContainer()
    await runStep(
      'restore-inventory-for-return',
      {
        order_id: 'order_01',
        items: [{ line_item_id: 'li_01', quantity: 1 }],
        location_id: 'loc_01',
      },
      container,
    )
    expect(mockInventoryService.adjustInventory).toHaveBeenCalledWith('inv_01', 'loc_01', 1)
  })

  it('restores inventory for multiple items in one call', async () => {
    const { container, mockInventoryService } = makeContainer()
    await runStep(
      'restore-inventory-for-return',
      {
        order_id: 'order_01',
        items: [
          { line_item_id: 'li_01', quantity: 2 },
          { line_item_id: 'li_02', quantity: 1 },
        ],
        location_id: 'loc_01',
      },
      container,
    )
    expect(mockInventoryService.adjustInventory).toHaveBeenCalledTimes(2)
    expect(mockInventoryService.adjustInventory).toHaveBeenCalledWith('inv_01', 'loc_01', 2)
    expect(mockInventoryService.adjustInventory).toHaveBeenCalledWith('inv_02', 'loc_01', 1)
  })

  it('skips inventory restore when location_id is omitted', async () => {
    const { container, mockInventoryService } = makeContainer()
    await runStep(
      'restore-inventory-for-return',
      {
        order_id: 'order_01',
        items: [{ line_item_id: 'li_01', quantity: 1 }],
      },
      container,
    )
    expect(mockInventoryService.adjustInventory).not.toHaveBeenCalled()
  })
})

// ── refund-workflow ───────────────────────────────────────────────────────────

describe('validate-refund-amount', () => {
  it('passes for an amount within the captured balance', async () => {
    const { container } = makeContainer()
    await expect(
      runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 10000000 }, container),
    ).resolves.toBeDefined()
  })

  it('passes for a full refund equal to the captured amount', async () => {
    const { container } = makeContainer({
      payment: { amount: 10000000, captured_at: '2026-01-01T00:00:00Z', refunds: [] },
    })
    await expect(
      runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 10000000 }, container),
    ).resolves.toBeDefined()
  })

  it('throws when the payment is not captured', async () => {
    const { container } = makeContainer({ payment: { captured_at: null } })
    await expect(
      runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 1000 }, container),
    ).rejects.toThrow('has not been captured')
  })

  it('throws when the refund amount exceeds the captured amount', async () => {
    const { container } = makeContainer({ payment: { amount: 10000000 } })
    await expect(
      runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 20000000 }, container),
    ).rejects.toThrow('exceeds the refundable balance')
  })

  it('throws for a zero refund amount', async () => {
    const { container } = makeContainer()
    await expect(
      runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 0 }, container),
    ).rejects.toThrow('greater than zero')
  })

  it('deducts prior refunds from the refundable balance', async () => {
    const { container } = makeContainer({
      payment: {
        amount: 10000000,
        captured_at: '2026-01-01T00:00:00Z',
        refunds: [{ amount: 9000000 }],
      },
    })
    await expect(
      runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 2000000 }, container),
    ).rejects.toThrow('exceeds the refundable balance')
  })
})

describe('process-refund', () => {
  it('calls refundPayment with amount and reason', async () => {
    const { container, mockPaymentService } = makeContainer()
    await runStep(
      'process-refund',
      {
        payment_id: 'pay_01',
        amount: 5000000,
        reason: 'Damaged item',
      },
      container,
    )
    expect(mockPaymentService.refundPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_id: 'pay_01',
        amount: 5000000,
        metadata: expect.objectContaining({ reason: 'Damaged item' }),
      }),
    )
  })

  it('returns refund_id, payment_id, and amount', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ refund_id: string; payment_id: string; amount: number }>(
      'process-refund',
      { payment_id: 'pay_01', amount: 5000000, reason: 'Damaged item' },
      container,
    )
    expect(r.result.refund_id).toBe('ref_01')
    expect(r.result.payment_id).toBe('pay_01')
    expect(r.result.amount).toBe(5000000)
  })
})

describe('emit-refund-created-event', () => {
  it('emits payment.refund_created with all fields', async () => {
    const { container, mockEventBus } = makeContainer()
    await runStep(
      'emit-refund-created-event',
      {
        refund_id: 'ref_01',
        payment_id: 'pay_01',
        amount: 5000000,
        reason: 'Damaged item',
      },
      container,
    )
    expect(mockEventBus.emit).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'payment.refund_created',
        data: {
          refund_id: 'ref_01',
          payment_id: 'pay_01',
          amount: 5000000,
          reason: 'Damaged item',
        },
      }),
    ])
  })
})

// ── exchange-workflow ─────────────────────────────────────────────────────────

describe('create-return-for-exchange', () => {
  it('creates a return tagged with type: exchange', async () => {
    const { container, mockOrderService } = makeContainer()
    await runStep(
      'create-return-for-exchange',
      {
        order_id: 'order_01',
        return_items: [{ line_item_id: 'li_01', quantity: 1, reason: 'Wrong size' }],
        location_id: 'loc_01',
      },
      container,
    )
    expect(mockOrderService.createReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order_01',
        metadata: expect.objectContaining({ type: 'exchange' }),
      }),
    )
  })

  it('returns the return_id', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ return_id: string }>(
      'create-return-for-exchange',
      { order_id: 'order_01', return_items: [{ line_item_id: 'li_01', quantity: 1 }] },
      container,
    )
    expect(r.result.return_id).toBe('ret_01')
  })
})

describe('create-exchange-draft-order', () => {
  const EXCHANGE_INPUT = {
    original_order_id: 'order_01',
    return_id: 'ret_01',
    new_items: [{ variant_id: 'var_02', quantity: 1, unit_price: 5000000, title: 'Brass Cushion' }],
  }

  it('creates a draft order with status: draft', async () => {
    const { container, mockOrderService } = makeContainer()
    await runStep('create-exchange-draft-order', EXCHANGE_INPUT, container)
    expect(mockOrderService.createOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    )
  })

  it('links metadata to the original order and return', async () => {
    const { container, mockOrderService } = makeContainer()
    await runStep('create-exchange-draft-order', EXCHANGE_INPUT, container)
    expect(mockOrderService.createOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          type: 'exchange',
          original_order_id: 'order_01',
          return_id: 'ret_01',
        }),
      }),
    )
  })

  it('inherits currency_code from the original order', async () => {
    const { container, mockOrderService } = makeContainer({ order: { currency_code: 'inr' } })
    await runStep('create-exchange-draft-order', EXCHANGE_INPUT, container)
    expect(mockOrderService.createOrders).toHaveBeenCalledWith(
      expect.objectContaining({ currency_code: 'inr' }),
    )
  })

  it('returns the new draft order ID', async () => {
    const { container } = makeContainer()
    const r = await runStep<{ new_order_id: string }>(
      'create-exchange-draft-order',
      EXCHANGE_INPUT,
      container,
    )
    expect(r.result.new_order_id).toBe('order_draft_01')
  })
})

describe('emit-exchange-created-event', () => {
  it('emits order.exchange_created with all three IDs', async () => {
    const { container, mockEventBus } = makeContainer()
    await runStep(
      'emit-exchange-created-event',
      {
        order_id: 'order_01',
        return_id: 'ret_01',
        new_order_id: 'order_draft_01',
      },
      container,
    )
    expect(mockEventBus.emit).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'order.exchange_created',
        data: { order_id: 'order_01', return_id: 'ret_01', new_order_id: 'order_draft_01' },
      }),
    ])
  })
})

// ── Full lifecycle scenarios ──────────────────────────────────────────────────

describe('full lifecycle — pending order → fulfilled → shipped → delivered', () => {
  it('all three workflow pipelines run to completion', async () => {
    const { container, mockFulfillmentService, mockEventBus } = makeContainer()

    // Pipeline 1: create fulfillment
    await runStep('validate-order-for-fulfillment', { order_id: 'order_01' }, container)
    await runStep(
      'create-fulfillment-record',
      {
        order_id: 'order_01',
        order_currency_code: 'inr',
        order_email: 'priya@example.com',
        location_id: 'loc_01',
        provider_id: 'manual',
        items: [{ line_item_id: 'li_01', quantity: 2, title: 'Ōkura Chair' }],
      },
      container,
    )
    await runStep(
      'emit-fulfillment-created-event',
      { fulfillment_id: 'ful_01', order_id: 'order_01' },
      container,
    )

    // Pipeline 2: mark shipped
    await runStep('validate-fulfillment-for-shipment', { fulfillment_id: 'ful_01' }, container)
    await runStep(
      'create-shipment-with-tracking',
      {
        fulfillment_id: 'ful_01',
        tracking_number: 'DELHIVERY-456',
        carrier: 'Delhivery',
      },
      container,
    )
    await runStep(
      'emit-shipment-created-event',
      {
        fulfillment_id: 'ful_01',
        tracking_number: 'DELHIVERY-456',
        carrier: 'Delhivery',
      },
      container,
    )

    // Pipeline 3: mark delivered (fulfillment now has shipped_at set)
    mockFulfillmentService.retrieveFulfillment.mockResolvedValue({
      ...DEFAULT_FULFILLMENT,
      shipped_at: new Date().toISOString(),
      delivered_at: null,
    })
    await runStep('validate-fulfillment-for-delivery', { fulfillment_id: 'ful_01' }, container)
    await runStep('mark-fulfillment-delivered', { fulfillment_id: 'ful_01' }, container)
    await runStep(
      'emit-order-delivered-event',
      {
        fulfillment_id: 'ful_01',
        delivered_at: new Date().toISOString(),
      },
      container,
    )

    expect(mockFulfillmentService.createFulfillment).toHaveBeenCalledTimes(1)
    // updateFulfillment called once for ship, once for deliver
    expect(mockFulfillmentService.updateFulfillment).toHaveBeenCalledTimes(2)
    // three events emitted across all pipelines
    expect(mockEventBus.emit).toHaveBeenCalledTimes(3)
  })
})

describe('full lifecycle — return pipeline with inventory restore', () => {
  it('validates, creates return, and restores inventory', async () => {
    const { container, mockOrderService, mockInventoryService } = makeContainer()

    await runStep(
      'validate-return-items',
      {
        order_id: 'order_01',
        items: [{ line_item_id: 'li_01', quantity: 1 }],
      },
      container,
    )
    await runStep(
      'create-return-record',
      {
        order_id: 'order_01',
        items: [{ line_item_id: 'li_01', quantity: 1, reason: 'Not as described' }],
      },
      container,
    )
    await runStep(
      'restore-inventory-for-return',
      {
        order_id: 'order_01',
        items: [{ line_item_id: 'li_01', quantity: 1 }],
        location_id: 'loc_01',
      },
      container,
    )

    expect(mockOrderService.createReturn).toHaveBeenCalledTimes(1)
    expect(mockInventoryService.adjustInventory).toHaveBeenCalledWith('inv_01', 'loc_01', 1)
  })
})

describe('full lifecycle — refund pipeline for captured payment', () => {
  it('validates, processes, and emits refund', async () => {
    const { container, mockPaymentService, mockEventBus } = makeContainer()

    await runStep('validate-refund-amount', { payment_id: 'pay_01', amount: 14500000 }, container)
    await runStep(
      'process-refund',
      {
        payment_id: 'pay_01',
        amount: 14500000,
        reason: 'Customer request — wrong item',
      },
      container,
    )
    await runStep(
      'emit-refund-created-event',
      {
        refund_id: 'ref_01',
        payment_id: 'pay_01',
        amount: 14500000,
        reason: 'Customer request — wrong item',
      },
      container,
    )

    expect(mockPaymentService.refundPayment).toHaveBeenCalledTimes(1)
    expect(mockEventBus.emit).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'payment.refund_created' }),
    ])
  })
})
