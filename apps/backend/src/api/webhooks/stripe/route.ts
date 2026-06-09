import crypto from 'node:crypto'
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export const AUTHENTICATE = false

function verifyStripeSignature(
  rawBody: Buffer | string,
  signatureHeader: string,
  secret: string,
): boolean {
  const parts = signatureHeader.split(',')
  const tPart = parts.find((p) => p.startsWith('t='))
  const v1Parts = parts.filter((p) => p.startsWith('v1='))

  if (!tPart || v1Parts.length === 0) return false

  const timestamp = tPart.slice(2)
  const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  const signedPayload = `${timestamp}.${payload}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')

  return v1Parts.some((part) => {
    const v1 = part.slice(3)
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
    } catch {
      return false
    }
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const signatureHeader = req.headers['stripe-signature'] as string | undefined
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET']

  if (!signatureHeader || !webhookSecret) {
    logger.warn('[stripe-webhook] Missing signature or webhook secret')
    res.status(400).json({ success: false, error: 'Missing signature' })
    return
  }

  const rawBody = (req as MedusaRequest & { rawBody?: Buffer | string }).rawBody
  if (!rawBody) {
    logger.warn('[stripe-webhook] Raw body unavailable — ensure raw body middleware is enabled')
    res.status(400).json({ success: false, error: 'Raw body unavailable' })
    return
  }

  if (!verifyStripeSignature(rawBody, signatureHeader, webhookSecret)) {
    logger.warn('[stripe-webhook] Invalid HMAC signature — request rejected')
    res.status(400).json({ success: false, error: 'Invalid signature' })
    return
  }

  const body = req.body as Record<string, unknown>
  const eventType = body.type as string | undefined
  const eventData = (body.data as Record<string, unknown> | undefined)?.object as
    | Record<string, unknown>
    | undefined

  logger.info(`[stripe-webhook] Received event: ${eventType}`)

  switch (eventType) {
    case 'payment_intent.succeeded': {
      logger.info(
        `[stripe-webhook] Payment intent succeeded: id=${eventData?.id} amount=${eventData?.amount} currency=${eventData?.currency}`,
      )
      break
    }

    case 'payment_intent.payment_failed': {
      const lastError = eventData?.last_payment_error as Record<string, unknown> | undefined
      logger.warn(
        `[stripe-webhook] Payment intent failed: id=${eventData?.id} reason=${(lastError?.message as string | undefined) ?? 'unknown'}`,
      )
      break
    }

    case 'charge.refunded': {
      logger.info(
        `[stripe-webhook] Charge refunded: id=${eventData?.id} amount_refunded=${eventData?.amount_refunded}`,
      )
      break
    }

    case 'payment_intent.canceled': {
      logger.info(`[stripe-webhook] Payment intent canceled: id=${eventData?.id}`)
      break
    }

    default:
      logger.debug(`[stripe-webhook] Unhandled event type: ${eventType}`)
  }

  res.status(200).json({ success: true })
}
