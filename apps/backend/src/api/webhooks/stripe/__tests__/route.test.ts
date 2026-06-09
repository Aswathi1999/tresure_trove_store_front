import crypto from 'node:crypto'
import { POST } from '../route'

const WEBHOOK_SECRET = 'test-stripe-webhook-secret'
const FIXED_TIMESTAMP = '1700000000'

function makeSignatureHeader(rawBody: Buffer | string, secret = WEBHOOK_SECRET): string {
  const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  const signedPayload = `${FIXED_TIMESTAMP}.${payload}`
  const signature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')
  return `t=${FIXED_TIMESTAMP},v1=${signature}`
}

function makeReq(overrides: {
  signature?: string
  rawBody?: Buffer | string | null | undefined
  body?: Record<string, unknown>
}): any {
  const { signature, rawBody, body = {} } = overrides
  const mockLogger = { warn: jest.fn(), info: jest.fn(), debug: jest.fn(), error: jest.fn() }
  return {
    headers: signature !== undefined ? { 'stripe-signature': signature } : {},
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
  process.env['STRIPE_WEBHOOK_SECRET'] = WEBHOOK_SECRET
})

afterEach(() => {
  delete process.env['STRIPE_WEBHOOK_SECRET']
})

describe('POST /webhooks/stripe', () => {
  describe('signature validation', () => {
    it('returns 400 when stripe-signature header is missing', async () => {
      const req = makeReq({ rawBody: Buffer.from('{}') })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Missing signature' })
    })

    it('returns 400 when STRIPE_WEBHOOK_SECRET env var is missing', async () => {
      delete process.env['STRIPE_WEBHOOK_SECRET']
      const body = Buffer.from('{}')
      const req = makeReq({ signature: makeSignatureHeader(body), rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Missing signature' })
    })

    it('returns 400 when raw body is unavailable', async () => {
      const req = makeReq({ signature: 't=123,v1=abc', rawBody: undefined })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Raw body unavailable' })
    })

    it('returns 400 when HMAC signature is invalid', async () => {
      const body = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }))
      const badSig = makeSignatureHeader(body, 'wrong-secret')
      const req = makeReq({ signature: badSig, rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid signature' })
    })

    it('returns 400 when signature header has no t= part', async () => {
      const body = Buffer.from('{}')
      const req = makeReq({ signature: 'v1=abc123def456', rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid signature' })
    })

    it('returns 400 when signature header has no v1= part', async () => {
      const body = Buffer.from('{}')
      const req = makeReq({ signature: 't=1700000000', rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid signature' })
    })

    it('returns 400 when v1 signature has wrong hex length (timingSafeEqual throws)', async () => {
      const body = Buffer.from('{}')
      const req = makeReq({ signature: 't=1700000000,v1=not-valid-hex!!', rawBody: body })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid signature' })
    })
  })

  describe('event routing with valid signature', () => {
    function makeSignedReq(body: Record<string, unknown>) {
      const rawBody = Buffer.from(JSON.stringify(body))
      const sig = makeSignatureHeader(rawBody)
      return makeReq({ signature: sig, rawBody, body })
    }

    it('returns 200 for payment_intent.succeeded event', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_001', amount: 50000, currency: 'usd' } },
      })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('logs payment intent id for payment_intent.succeeded', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_001', amount: 50000, currency: 'usd' } },
      })
      const res = makeRes()
      await POST(req, res)
      const logger = req.scope.resolve()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('pi_001'))
    })

    it('returns 200 for payment_intent.payment_failed event', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_002', last_payment_error: { message: 'Card declined' } } },
      })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('logs failure reason for payment_intent.payment_failed', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_002', last_payment_error: { message: 'Card declined' } } },
      })
      const res = makeRes()
      await POST(req, res)
      const logger = req.scope.resolve()
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Card declined'))
    })

    it('falls back to "unknown" reason when last_payment_error is absent', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_003' } },
      })
      const res = makeRes()
      await POST(req, res)
      const logger = req.scope.resolve()
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('unknown'))
    })

    it('returns 200 for charge.refunded event', async () => {
      const req = makeSignedReq({
        type: 'charge.refunded',
        data: { object: { id: 'ch_001', amount_refunded: 25000 } },
      })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('logs charge id and amount_refunded for charge.refunded', async () => {
      const req = makeSignedReq({
        type: 'charge.refunded',
        data: { object: { id: 'ch_001', amount_refunded: 25000 } },
      })
      const res = makeRes()
      await POST(req, res)
      const logger = req.scope.resolve()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('ch_001'))
    })

    it('returns 200 for payment_intent.canceled event', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.canceled',
        data: { object: { id: 'pi_004' } },
      })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('logs payment intent id for payment_intent.canceled', async () => {
      const req = makeSignedReq({
        type: 'payment_intent.canceled',
        data: { object: { id: 'pi_004' } },
      })
      const res = makeRes()
      await POST(req, res)
      const logger = req.scope.resolve()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('pi_004'))
    })

    it('returns 200 for unknown event type', async () => {
      const req = makeSignedReq({ type: 'customer.created', data: { object: {} } })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('calls debug log for unknown event type', async () => {
      const req = makeSignedReq({ type: 'customer.created', data: { object: {} } })
      const res = makeRes()
      await POST(req, res)
      const logger = req.scope.resolve()
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('customer.created'))
    })

    it('works when raw body is a string instead of Buffer', async () => {
      const bodyObj = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_005', amount: 9900, currency: 'usd' } },
      }
      const bodyStr = JSON.stringify(bodyObj)
      const sig = makeSignatureHeader(bodyStr)
      const req = makeReq({ signature: sig, rawBody: bodyStr, body: bodyObj })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('accepts multiple v1 signatures — passes when any one matches', async () => {
      const body = Buffer.from(JSON.stringify({ type: 'charge.refunded', data: { object: {} } }))
      const validSig = makeSignatureHeader(body)
      const v1Part = validSig.split(',v1=')[1]
      const multiSig = `t=${FIXED_TIMESTAMP},v1=badhex000,v1=${v1Part}`
      const req = makeReq({ signature: multiSig, rawBody: body, body: JSON.parse(body.toString()) })
      const res = makeRes()
      await POST(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })
})
