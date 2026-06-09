export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface RevalidateWebhookPayload {
  slug: string
  type: 'blog' | 'material' | 'material-story' | 'homepage' | 'product'
}
