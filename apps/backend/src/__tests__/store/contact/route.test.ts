/**
 * Unit tests for src/api/store/contact/route.ts
 *
 * Covers: input validation (missing fields, invalid email, short message),
 * successful response shape, and Winston logging with masked email.
 * The Medusa framework and logger are mocked so no real HTTP server starts.
 */

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

jest.mock('@medusajs/framework/utils', () => ({
  ContainerRegistrationKeys: { LOGGER: 'logger' },
}))

// ─── Types ───────────────────────────────────────────────────────────────────

type MockRes = {
  status: jest.Mock<MockRes>
  json: jest.Mock
}

type MockReq = {
  body: Record<string, unknown> | null
  scope: { resolve: jest.Mock }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReq(body: Record<string, unknown> | null): MockReq {
  return {
    body,
    scope: { resolve: jest.fn(() => mockLogger) },
  }
}

function makeRes(): MockRes {
  const res = {} as MockRes
  res.json = jest.fn()
  res.status = jest.fn().mockReturnValue(res)
  return res
}

function getStatus(res: MockRes): number {
  return (res.status.mock.calls[0] as [number])[0]
}

function getBody(res: MockRes): Record<string, unknown> {
  return (res.json.mock.calls[0] as [Record<string, unknown>])[0]
}

function getLogArg(): string {
  return (mockLogger.info.mock.calls[0] as [string])[0]
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VALID_BODY = {
  name: 'Akshay Kumar',
  email: 'akshay@example.com',
  message: 'This is a valid test message that is long enough.',
}

// ─── Tests ───────────────────────────────────────────────────────────────────

import { POST } from '../../../api/store/contact/route'
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'

describe('POST /store/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── Validation — name ────────────────────────────────────────────────────

  describe('validation — name', () => {
    it('returns 400 when name is absent', async () => {
      const res = makeRes()
      await POST(
        makeReq({
          email: VALID_BODY.email,
          message: VALID_BODY.message,
        }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('details.name is "Name is required." when name is absent', async () => {
      const res = makeRes()
      await POST(
        makeReq({
          email: VALID_BODY.email,
          message: VALID_BODY.message,
        }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      const body = getBody(res) as { error: { details: Record<string, string> } }
      expect(body.error.details.name).toBe('Name is required.')
    })

    it('returns 400 when name is an empty string', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, name: '' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('returns 400 when name is a number', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, name: 42 }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('returns 400 when name is null', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, name: null }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })
  })

  // ─── Validation — email ───────────────────────────────────────────────────

  describe('validation — email', () => {
    it('returns 400 when email is absent', async () => {
      const res = makeRes()
      await POST(
        makeReq({ name: VALID_BODY.name, message: VALID_BODY.message }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('details.email is "Email is required." when email is absent', async () => {
      const res = makeRes()
      await POST(
        makeReq({ name: VALID_BODY.name, message: VALID_BODY.message }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      const body = getBody(res) as { error: { details: Record<string, string> } }
      expect(body.error.details.email).toBe('Email is required.')
    })

    it('returns 400 when email is an empty string', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, email: '' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('returns 400 when email has no @ symbol', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, email: 'notanemail' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('returns 400 when email has no domain after @', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, email: 'user@' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('returns 400 when email has no TLD', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, email: 'user@domain' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('details.email is "A valid email address is required." for invalid format', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, email: 'notanemail' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      const body = getBody(res) as { error: { details: Record<string, string> } }
      expect(body.error.details.email).toBe('A valid email address is required.')
    })

    it('returns 400 when email is not a string', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, email: 123 }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })
  })

  // ─── Validation — message ─────────────────────────────────────────────────

  describe('validation — message', () => {
    it('returns 400 when message is absent', async () => {
      const res = makeRes()
      await POST(
        makeReq({ name: VALID_BODY.name, email: VALID_BODY.email }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('details.message is "Message is required." when message is absent', async () => {
      const res = makeRes()
      await POST(
        makeReq({ name: VALID_BODY.name, email: VALID_BODY.email }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      const body = getBody(res) as { error: { details: Record<string, string> } }
      expect(body.error.details.message).toBe('Message is required.')
    })

    it('returns 400 when message is an empty string', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, message: '' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('returns 400 when message is exactly 19 characters', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, message: 'a'.repeat(19) }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })

    it('details.message is "Message must be at least 20 characters." when too short', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, message: 'Too short' }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      const body = getBody(res) as { error: { details: Record<string, string> } }
      expect(body.error.details.message).toBe('Message must be at least 20 characters.')
    })

    it('returns 200 when message is exactly 20 characters', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, message: 'a'.repeat(20) }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(200)
    })

    it('returns 400 when message is not a string', async () => {
      const res = makeRes()
      await POST(
        makeReq({ ...VALID_BODY, message: ['array'] }) as unknown as MedusaRequest,
        res as unknown as MedusaResponse,
      )
      expect(getStatus(res)).toBe(400)
    })
  })

  // ─── Multiple validation errors ───────────────────────────────────────────

  describe('multiple validation errors', () => {
    it('returns all three field errors when body is empty', async () => {
      const res = makeRes()
      await POST(makeReq({}) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      const body = getBody(res) as { error: { details: Record<string, string> } }
      expect(body.error.details).toHaveProperty('name')
      expect(body.error.details).toHaveProperty('email')
      expect(body.error.details).toHaveProperty('message')
    })

    it('handles a null body gracefully — returns 400', async () => {
      const res = makeRes()
      await POST(makeReq(null) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      expect(getStatus(res)).toBe(400)
    })
  })

  // ─── Error response shape ─────────────────────────────────────────────────

  describe('error response shape', () => {
    it('success is false', async () => {
      const res = makeRes()
      await POST(makeReq({}) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      expect((getBody(res) as { success: boolean }).success).toBe(false)
    })

    it('error.code is "VALIDATION_ERROR"', async () => {
      const res = makeRes()
      await POST(makeReq({}) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      const body = getBody(res) as { error: { code: string } }
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('error.message is "Invalid request payload."', async () => {
      const res = makeRes()
      await POST(makeReq({}) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      const body = getBody(res) as { error: { message: string } }
      expect(body.error.message).toBe('Invalid request payload.')
    })
  })

  // ─── Successful submission ────────────────────────────────────────────────

  describe('successful submission', () => {
    it('returns 200 for a valid request', async () => {
      const res = makeRes()
      await POST(makeReq(VALID_BODY) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      expect(getStatus(res)).toBe(200)
    })

    it('response success is true', async () => {
      const res = makeRes()
      await POST(makeReq(VALID_BODY) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      expect((getBody(res) as { success: boolean }).success).toBe(true)
    })

    it('response message is "Your message has been received."', async () => {
      const res = makeRes()
      await POST(makeReq(VALID_BODY) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      expect((getBody(res) as { message: string }).message).toBe('Your message has been received.')
    })

    it('does not call logger.info on validation failure', async () => {
      const res = makeRes()
      await POST(makeReq({}) as unknown as MedusaRequest, res as unknown as MedusaResponse)
      expect(mockLogger.info).not.toHaveBeenCalled()
    })
  })

  // ─── Winston logging behaviour ────────────────────────────────────────────

  describe('logging behaviour', () => {
    it('resolves the logger from the Medusa DI container', async () => {
      const req = makeReq(VALID_BODY)
      await POST(req as unknown as MedusaRequest, makeRes() as unknown as MedusaResponse)
      expect(req.scope.resolve).toHaveBeenCalledWith('logger')
    })

    it('calls logger.info exactly once on success', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      expect(mockLogger.info).toHaveBeenCalledTimes(1)
    })

    it('log argument is a valid JSON string', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      expect(() => JSON.parse(getLogArg())).not.toThrow()
    })

    it('log event is "contact_form_submission"', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      const log = JSON.parse(getLogArg()) as Record<string, unknown>
      expect(log.event).toBe('contact_form_submission')
    })

    it('log includes the submitted name', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      const log = JSON.parse(getLogArg()) as Record<string, unknown>
      expect(log.name).toBe(VALID_BODY.name)
    })

    it('log includes messageLength equal to message.length', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      const log = JSON.parse(getLogArg()) as Record<string, unknown>
      expect(log.messageLength).toBe(VALID_BODY.message.length)
    })

    it('log includes a timestamp string', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      const log = JSON.parse(getLogArg()) as Record<string, unknown>
      expect(typeof log.timestamp).toBe('string')
    })

    it('email in log is masked — first 3 chars + ***', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      const log = JSON.parse(getLogArg()) as Record<string, unknown>
      expect(log.email).toBe('aks***')
    })

    it('plain-text email does not appear in the log', async () => {
      await POST(
        makeReq(VALID_BODY) as unknown as MedusaRequest,
        makeRes() as unknown as MedusaResponse,
      )
      expect(getLogArg()).not.toContain(VALID_BODY.email)
    })
  })
})
