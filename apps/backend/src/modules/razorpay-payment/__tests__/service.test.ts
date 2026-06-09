import crypto from 'node:crypto'

const MOCK_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REQUIRES_MORE: 'requires_more',
  ERROR: 'error',
}
const MOCK_ACTIONS = {
  AUTHORIZED: 'authorized',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  NOT_SUPPORTED: 'not_supported',
}

jest.mock('@medusajs/framework/utils', () => ({
  AbstractPaymentProvider: class {
    constructor(_cradle: unknown, _options: unknown) {}
  },
  PaymentSessionStatus: MOCK_STATUS,
  PaymentActions: MOCK_ACTIONS,
  ModuleProvider: jest.fn(),
  Modules: { PAYMENT: 'payment' },
}))

const mockRazorpayInstance = {
  orders: { create: jest.fn(), fetch: jest.fn() },
  payments: { refund: jest.fn() },
}

jest.mock('razorpay', () => jest.fn().mockImplementation(() => mockRazorpayInstance))

import RazorpayProviderService, { type RazorpayOptions } from '../service'

const BASE_OPTIONS: RazorpayOptions = {
  keyId: 'rzp_test_key',
  keySecret: 'test_secret',
  webhookSecret: 'webhook_secret',
}

function makeService(options = BASE_OPTIONS): RazorpayProviderService {
  return new RazorpayProviderService({}, options)
}

function hmac(secret: string, payload: string | Buffer): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

beforeEach(() => jest.clearAllMocks())

describe('RazorpayProviderService', () => {
  describe('validateOptions()', () => {
    it('throws when keyId is missing', () => {
      expect(() =>
        RazorpayProviderService.validateOptions({ keyId: '', keySecret: 'x', webhookSecret: 'x' }),
      ).toThrow('keyId')
    })

    it('throws when keySecret is missing', () => {
      expect(() =>
        RazorpayProviderService.validateOptions({ keyId: 'x', keySecret: '', webhookSecret: 'x' }),
      ).toThrow('keySecret')
    })

    it('throws when webhookSecret is missing', () => {
      expect(() =>
        RazorpayProviderService.validateOptions({ keyId: 'x', keySecret: 'x', webhookSecret: '' }),
      ).toThrow('webhookSecret')
    })

    it('does not throw when all options are provided', () => {
      expect(() =>
        RazorpayProviderService.validateOptions({ keyId: 'x', keySecret: 'x', webhookSecret: 'x' }),
      ).not.toThrow()
    })
  })

  describe('initiatePayment()', () => {
    it('calls razorpay.orders.create with amount in paise and correct currency', async () => {
      const service = makeService()
      const createdOrder = { id: 'order_001', status: 'created' }
      mockRazorpayInstance.orders.create.mockResolvedValue(createdOrder)

      const result = await service.initiatePayment({
        currency_code: 'inr',
        amount: 500,
        data: { session_id: 'sess_abc' },
      } as any)

      // Medusa passes the major unit (₹500); Razorpay must receive paise (50000).
      expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50000, currency: 'INR' }),
      )
      expect(result.id).toBe('order_001')
      expect(result.status).toBe(MOCK_STATUS.PENDING)
    })

    it('passes session_id in notes', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.create.mockResolvedValue({ id: 'order_002', status: 'created' })

      await service.initiatePayment({
        currency_code: 'usd',
        amount: 10000,
        data: { session_id: 'sess_xyz' },
      } as any)

      expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ notes: { session_id: 'sess_xyz' } }),
      )
    })

    it('wraps and rethrows razorpay errors', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.create.mockRejectedValue(new Error('Network error'))
      await expect(
        service.initiatePayment({ currency_code: 'inr', amount: 100, data: {} } as any),
      ).rejects.toThrow('Network error')
    })
  })

  describe('authorizePayment()', () => {
    it('returns PENDING when payment data fields are missing', async () => {
      const service = makeService()
      const result = await service.authorizePayment({ data: {} } as any)
      expect(result.status).toBe(MOCK_STATUS.PENDING)
    })

    it('returns PENDING when only some fields are present', async () => {
      const service = makeService()
      const result = await service.authorizePayment({
        data: { id: 'order_001', razorpay_payment_id: 'pay_001' },
      } as any)
      expect(result.status).toBe(MOCK_STATUS.PENDING)
    })

    it('returns ERROR when HMAC signature is invalid', async () => {
      const service = makeService()
      const result = await service.authorizePayment({
        data: {
          id: 'order_001',
          razorpay_payment_id: 'pay_001',
          razorpay_signature: hmac('wrong_secret', 'order_001|pay_001'),
        },
      } as any)
      expect(result.status).toBe(MOCK_STATUS.ERROR)
    })

    it('returns AUTHORIZED when signature is valid', async () => {
      const service = makeService()
      const validSig = hmac(BASE_OPTIONS.keySecret, 'order_001|pay_001')
      const result = await service.authorizePayment({
        data: {
          id: 'order_001',
          razorpay_payment_id: 'pay_001',
          razorpay_signature: validSig,
        },
      } as any)
      expect(result.status).toBe(MOCK_STATUS.AUTHORIZED)
    })
  })

  describe('capturePayment()', () => {
    it('returns existing data unchanged (Razorpay auto-captures)', async () => {
      const service = makeService()
      const data = { id: 'order_001', razorpay_payment_id: 'pay_001' }
      const result = await service.capturePayment({ data } as any)
      expect(result.data).toEqual(data)
    })
  })

  describe('refundPayment()', () => {
    it('throws when razorpay_payment_id is missing', async () => {
      const service = makeService()
      await expect(service.refundPayment({ data: {}, amount: 1000 } as any)).rejects.toThrow(
        'missing payment id',
      )
    })

    it('calls razorpay.payments.refund with correct amount and speed', async () => {
      const service = makeService()
      const refundResult = { id: 'rfnd_001' }
      mockRazorpayInstance.payments.refund.mockResolvedValue(refundResult)

      const result = await service.refundPayment({
        data: { razorpay_payment_id: 'pay_001' },
        amount: 250,
      } as any)

      // Medusa passes the major unit (₹250); Razorpay must receive paise (25000).
      expect(mockRazorpayInstance.payments.refund).toHaveBeenCalledWith('pay_001', {
        amount: 25000,
        speed: 'normal',
      })
      expect(result.data).toMatchObject({ refund: refundResult })
    })

    it('wraps and rethrows razorpay refund errors', async () => {
      const service = makeService()
      mockRazorpayInstance.payments.refund.mockRejectedValue(new Error('Refund denied'))
      await expect(
        service.refundPayment({ data: { razorpay_payment_id: 'pay_001' }, amount: 100 } as any),
      ).rejects.toThrow('Refund denied')
    })
  })

  describe('getPaymentStatus()', () => {
    it('returns PENDING when orderId is missing', async () => {
      const service = makeService()
      const result = await service.getPaymentStatus({ data: {} } as any)
      expect(result.status).toBe(MOCK_STATUS.PENDING)
    })

    it('returns PENDING for Razorpay status "created"', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.fetch.mockResolvedValue({ id: 'order_001', status: 'created' })
      const result = await service.getPaymentStatus({ data: { id: 'order_001' } } as any)
      expect(result.status).toBe(MOCK_STATUS.PENDING)
    })

    it('returns REQUIRES_MORE for Razorpay status "attempted"', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.fetch.mockResolvedValue({ id: 'order_001', status: 'attempted' })
      const result = await service.getPaymentStatus({ data: { id: 'order_001' } } as any)
      expect(result.status).toBe(MOCK_STATUS.REQUIRES_MORE)
    })

    it('returns CAPTURED for Razorpay status "paid"', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.fetch.mockResolvedValue({ id: 'order_001', status: 'paid' })
      const result = await service.getPaymentStatus({ data: { id: 'order_001' } } as any)
      expect(result.status).toBe(MOCK_STATUS.CAPTURED)
    })

    it('returns PENDING for unknown Razorpay order status', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.fetch.mockResolvedValue({ id: 'order_001', status: 'unknown' })
      const result = await service.getPaymentStatus({ data: { id: 'order_001' } } as any)
      expect(result.status).toBe(MOCK_STATUS.PENDING)
    })

    it('wraps and rethrows errors from orders.fetch', async () => {
      const service = makeService()
      mockRazorpayInstance.orders.fetch.mockRejectedValue(new Error('API error'))
      await expect(service.getPaymentStatus({ data: { id: 'order_001' } } as any)).rejects.toThrow(
        'API error',
      )
    })
  })

  describe('getWebhookActionAndData()', () => {
    function makeWebhookPayload(
      event: string,
      paymentEntity: Record<string, unknown> = {},
      signatureOverride?: string,
    ): any {
      const data = { event, payload: { payment: { entity: paymentEntity } } }
      const rawData = JSON.stringify(data)
      const signature = signatureOverride ?? hmac(BASE_OPTIONS.webhookSecret, rawData)
      return {
        headers: { 'x-razorpay-signature': signature },
        rawData,
        data,
      }
    }

    it('returns NOT_SUPPORTED when signature header is missing', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData({
        headers: {},
        rawData: '{}',
        data: {},
      } as any)
      expect(result.action).toBe(MOCK_ACTIONS.NOT_SUPPORTED)
    })

    it('returns NOT_SUPPORTED when rawData is missing', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData({
        headers: { 'x-razorpay-signature': 'abc' },
        rawData: '',
        data: {},
      } as any)
      expect(result.action).toBe(MOCK_ACTIONS.NOT_SUPPORTED)
    })

    it('returns NOT_SUPPORTED when signature is invalid', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(
        makeWebhookPayload('payment.captured', {}, hmac('wrong_secret', '{}')),
      )
      expect(result.action).toBe(MOCK_ACTIONS.NOT_SUPPORTED)
    })

    it('returns AUTHORIZED for payment.authorized event', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(
        makeWebhookPayload('payment.authorized', {
          amount: 50000,
          notes: { session_id: 'sess_001' },
        }),
      )
      expect(result.action).toBe(MOCK_ACTIONS.AUTHORIZED)
      expect(result.data).toEqual({ session_id: 'sess_001', amount: 50000 })
    })

    it('returns SUCCESSFUL for payment.captured event', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(
        makeWebhookPayload('payment.captured', {
          amount: 75000,
          notes: { session_id: 'sess_002' },
        }),
      )
      expect(result.action).toBe(MOCK_ACTIONS.SUCCESSFUL)
      expect(result.data).toEqual({ session_id: 'sess_002', amount: 75000 })
    })

    it('returns FAILED for payment.failed event', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(
        makeWebhookPayload('payment.failed', {
          amount: 30000,
          notes: { session_id: 'sess_003' },
        }),
      )
      expect(result.action).toBe(MOCK_ACTIONS.FAILED)
      expect(result.data).toEqual({ session_id: 'sess_003', amount: 30000 })
    })

    it('returns NOT_SUPPORTED for unknown event type', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(makeWebhookPayload('order.paid'))
      expect(result.action).toBe(MOCK_ACTIONS.NOT_SUPPORTED)
    })

    it('defaults session_id to empty string when notes are missing', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(
        makeWebhookPayload('payment.captured', { amount: 1000 }),
      )
      expect(result.action).toBe(MOCK_ACTIONS.SUCCESSFUL)
      expect((result.data as any).session_id).toBe('')
    })

    it('defaults amount to 0 when not present in entity', async () => {
      const service = makeService()
      const result = await service.getWebhookActionAndData(
        makeWebhookPayload('payment.captured', { notes: { session_id: 'sess_x' } }),
      )
      expect((result.data as any).amount).toBe(0)
    })
  })
})
