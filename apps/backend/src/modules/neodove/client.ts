import { logger } from '../../lib/logger'
import type {
  NeoDoveContactPayload,
  NeoDoveContactResponse,
  NeoDoveLeadPayload,
  NeoDoveLeadResponse,
} from './types'

export class NeoDoveClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    this.baseUrl = process.env['NEODOVE_API_BASE_URL'] ?? 'https://api.neodove.com'
    this.apiKey = process.env['NEODOVE_API_KEY'] ?? ''
  }

  async createLead(payload: NeoDoveLeadPayload): Promise<NeoDoveLeadResponse> {
    if (!this.apiKey) {
      logger.warn('[neodove] NEODOVE_API_KEY is not set — skipping createLead')
      return { success: false, message: 'API key not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      const body = (await response.json()) as Record<string, unknown>

      if (!response.ok) {
        logger.error(
          `[neodove] createLead failed: HTTP ${response.status} — ${JSON.stringify(body)}`,
        )
        return { success: false, message: String(body['message'] ?? response.statusText) }
      }

      return {
        success: true,
        leadId: typeof body['leadId'] === 'string' ? body['leadId'] : undefined,
        message: typeof body['message'] === 'string' ? body['message'] : undefined,
        data: body,
      }
    } catch (error) {
      const err = error as Error
      logger.error(`[neodove] createLead threw: ${err.message}`)
      return { success: false, message: err.message }
    }
  }

  async createContact(payload: NeoDoveContactPayload): Promise<NeoDoveContactResponse> {
    if (!this.apiKey) {
      logger.warn('[neodove] NEODOVE_API_KEY is not set — skipping createContact')
      return { success: false, message: 'API key not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      const body = (await response.json()) as Record<string, unknown>

      if (!response.ok) {
        logger.error(
          `[neodove] createContact failed: HTTP ${response.status} — ${JSON.stringify(body)}`,
        )
        return { success: false, message: String(body['message'] ?? response.statusText) }
      }

      return {
        success: true,
        contactId: typeof body['contactId'] === 'string' ? body['contactId'] : undefined,
        message: typeof body['message'] === 'string' ? body['message'] : undefined,
        data: body,
      }
    } catch (error) {
      const err = error as Error
      logger.error(`[neodove] createContact threw: ${err.message}`)
      return { success: false, message: err.message }
    }
  }
}
