import crypto from 'node:crypto'
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export const AUTHENTICATE = false

export const POST = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const signature = req.headers['x-razorpay-signature'] as string | undefined
  const webhookSecret = process.env['RAZORPAY_WEBHOOK_SECRET']

  if (!signature || !webhookSecret) {
    logger.warn('[razorpay-webhook] Missing signature or webhook secret')
    res.status(400).json({ success: false, error: 'Missing signature' })
    return
  }

  const rawBody = (req as MedusaRequest & { rawBody?: Buffer | string }).rawBody
  if (!rawBody) {
    logger.warn('[razorpay-webhook] Raw body unavailable — ensure raw body middleware is enabled')
    res.status(400).json({ success: false, error: 'Raw body unavailable' })
    return
  }

  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  const signaturesMatch = (() => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
      )
    } catch {
      return false
    }
  })()

  if (!signaturesMatch) {
    logger.warn('[razorpay-webhook] Invalid HMAC signature — request rejected')
    res.status(400).json({ success: false, error: 'Invalid signature' })
    return
  }

  const body = req.body as Record<string, unknown>
  const event = body.event as string | undefined

  logger.info(`[razorpay-webhook] Received event: ${event}`)

  switch (event) {
    case 'payment.captured': {
      const payload = body.payload as Record<string, unknown> | undefined
      const paymentEntity = (payload?.payment as Record<string, unknown> | undefined)?.entity as
        | Record<string, unknown>
        | undefined

      logger.info(
        `[razorpay-webhook] Payment captured: id=${paymentEntity?.id} amount=${paymentEntity?.amount} currency=${paymentEntity?.currency}`,
      )
      break
    }

    case 'payment.failed': {
      const payload = body.payload as Record<string, unknown> | undefined
      const paymentEntity = (payload?.payment as Record<string, unknown> | undefined)?.entity as
        | Record<string, unknown>
        | undefined

      logger.warn(
        `[razorpay-webhook] Payment failed: id=${paymentEntity?.id} reason=${
          (paymentEntity?.error_description as string | undefined) ?? 'unknown'
        }`,
      )
      break
    }

    default:
      logger.debug(`[razorpay-webhook] Unhandled event type: ${event}`)
  }

  res.status(200).json({ success: true })
}
