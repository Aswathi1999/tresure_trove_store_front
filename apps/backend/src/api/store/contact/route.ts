// Rate limiting is intentionally not implemented here.
// It is deferred to TASK-097 (Security hardening) where Nginx-level or middleware-level
// rate limiting will be applied to /store/contact.

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

interface ContactBody {
  name: unknown
  email: unknown
  message: unknown
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function maskEmail(email: string): string {
  return `${email.slice(0, 3)}***`
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const { name, email, message } = (req.body ?? {}) as ContactBody

  const details: Record<string, string> = {}

  if (typeof name !== 'string' || name.length === 0) {
    details['name'] = 'Name is required.'
  }

  if (typeof email !== 'string' || email.length === 0) {
    details['email'] = 'Email is required.'
  } else if (!isValidEmail(email)) {
    details['email'] = 'A valid email address is required.'
  }

  if (typeof message !== 'string' || message.length === 0) {
    details['message'] = 'Message is required.'
  } else if (message.length < 20) {
    details['message'] = 'Message must be at least 20 characters.'
  }

  if (Object.keys(details).length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload.',
        details,
      },
    })
    return
  }

  logger.info(
    JSON.stringify({
      event: 'contact_form_submission',
      timestamp: new Date().toISOString(),
      name: name as string,
      email: maskEmail(email as string),
      messageLength: (message as string).length,
    }),
  )

  res.status(200).json({
    success: true,
    message: 'Your message has been received.',
  })
}
