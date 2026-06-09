import crypto from 'node:crypto'
import { POST } from '../route'

const WEBHOOK_SECRET = 'test-webhook-secret'

function makeHmac(body: string | Buffer, secret = WEBHOOK_SECRET): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

function makeReq(overrides: {
  signature?: string
  rawBody?: Buffer | string | null
  body?: Record<string, unknown>
  headers?: Record<string, string>
}): any {
  const { signature, rawBody, body = {}, headers = {} } = overrides
  const mockLogger = { warn: jest.fn(), info: jest.fn(), debug: jest.fn(), error: jest.fn() }
  return {
    headers: { 'x-razorpay-signature': signature, ...headers },
    rawBody,
    body,
    scope: { resolve: jest.fn().mockReturnValue(mockLogger) },
    _logger: mockLogger,
  }
}

function makeRes(): any {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  process.env['RAZORPAY_WEBHOOK_SECRET'] = WEBHOOK_SECRET
})

afterEach(() => {
  delete process.env['RAZORPAY_WEBHOOK_SECRET']
})

describe('POST /webhooks/razorpay', () => {
  describe('signature validation', () => {
    it('returns 400 when x-razorpay-signature header is missing', async () => {
      const req = makeReq({ signature: undefined, rawBody: Buffer.from('{}') })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Missing signature' })
    })

    it('returns 400 when RAZORPAY_WEBHOOK_SECRET env var is missing', async () => {
      delete process.env['RAZORPAY_WEBHOOK_SECRET']
      const body = Buffer.from('{}')
      const req = makeReq({ signature: makeHmac(body), rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Missing signature' })
    })

    it('returns 400 when raw body is unavailable', async () => {
      const req = makeReq({ signature: 'abc123', rawBody: undefined })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Raw body unavailable' })
    })

    it('returns 400 when HMAC signature is invalid', async () => {
      const body = Buffer.from(JSON.stringify({ event: 'payment.captured' }))
      const req = makeReq({ signature: makeHmac(body, 'wrong-secret'), rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid signature' })
    })

    it('returns 400 when signature has wrong hex length (timingSafeEqual throws)', async () => {
      const body = Buffer.from('{}')
      const req = makeReq({ signature: 'not-valid-hex!!', rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid signature' })
    })
  })

  describe('event routing with valid signature', () => {
    async function postEvent(event: string, payload?: Record<string, unknown>) {
      const bodyObj = { event, payload }
      const rawBody = Buffer.from(JSON.stringify(bodyObj))
      const req = makeReq({
        signature: makeHmac(rawBody),
        rawBody,
        body: bodyObj,
      })
      const res = makeRes()
      await POST(req, res)
      return { req, res }
    }

    it('returns 200 for payment.captured event', async () => {
      const { res } = await postEvent('payment.captured', {
        payment: { entity: { id: 'pay_123', amount: 50000, currency: 'INR' } },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('logs payment details for payment.captured event', async () => {
      const { req } = await postEvent('payment.captured', {
        payment: { entity: { id: 'pay_123', amount: 50000, currency: 'INR' } },
      })
      const logger = req.scope.resolve()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('pay_123'))
    })

    it('returns 200 for payment.failed event', async () => {
      const { res } = await postEvent('payment.failed', {
        payment: { entity: { id: 'pay_456', error_description: 'Insufficient funds' } },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('logs warning for payment.failed event', async () => {
      const { req } = await postEvent('payment.failed', {
        payment: { entity: { id: 'pay_456', error_description: 'Insufficient funds' } },
      })
      const logger = req.scope.resolve()
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Insufficient funds'))
    })

    it('returns 200 for unknown event type', async () => {
      const { res } = await postEvent('order.paid')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('works when raw body is a string instead of Buffer', async () => {
      const bodyStr = JSON.stringify({ event: 'payment.captured', payload: {} })
      const req = makeReq({
        signature: makeHmac(bodyStr),
        rawBody: bodyStr,
        body: { event: 'payment.captured', payload: {} },
      })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })
})
