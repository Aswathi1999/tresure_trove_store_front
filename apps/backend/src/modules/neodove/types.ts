export interface NeoDoveLeadPayload {
  name: string
  phone: string
  email?: string
  tags?: string[]
  customFields?: Record<string, string | number | boolean>
}

export interface NeoDoveContactPayload {
  name: string
  phone: string
  email?: string
  tags?: string[]
  customFields?: Record<string, string | number | boolean>
}

export interface NeoDoveLeadResponse {
  success: boolean
  leadId?: string
  message?: string
  data?: Record<string, unknown>
}

export interface NeoDoveContactResponse {
  success: boolean
  contactId?: string
  message?: string
  data?: Record<string, unknown>
}
