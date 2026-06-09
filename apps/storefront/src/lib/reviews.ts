const MEDUSA_BASE_URL = process.env['NEXT_PUBLIC_MEDUSA_BACKEND_URL'] ?? 'http://localhost:9000'
const MEDUSA_PUB_KEY = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? ''

export interface ProductReview {
  id: string
  customer_name: string
  rating: number
  title: string
  body: string
  verified: boolean
  created_at: string
}

export interface ReviewAggregate {
  total: number
  average: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export interface ReviewsResponse {
  reviews: ProductReview[]
  count: number
  aggregate: ReviewAggregate
}

export interface SubmitReviewInput {
  rating: number
  body?: string
  customer_name?: string
  customer_email?: string
  title?: string
}

export interface SubmitReviewResult {
  ok: boolean
  message: string
}

export async function getProductReviews(productId: string): Promise<ReviewsResponse> {
  const empty: ReviewsResponse = {
    reviews: [],
    count: 0,
    aggregate: { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  }
  try {
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products/${encodeURIComponent(productId)}/reviews?limit=50`,
      {
        headers: { 'x-publishable-api-key': MEDUSA_PUB_KEY },
        next: { revalidate: 60, tags: ['reviews', `reviews-${productId}`] },
      },
    )
    if (!res.ok) return empty
    return (await res.json()) as ReviewsResponse
  } catch {
    return empty
  }
}

export async function submitProductReview(
  productId: string,
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  try {
    const res = await fetch(
      `${MEDUSA_BASE_URL}/store/products/${encodeURIComponent(productId)}/reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': MEDUSA_PUB_KEY,
        },
        body: JSON.stringify(input),
      },
    )
    if (!res.ok) {
      let message = 'Could not submit your review. Please try again.'
      try {
        const data = (await res.json()) as { message?: string }
        if (data.message) message = data.message
      } catch {
        // ignore
      }
      return { ok: false, message }
    }
    const data = (await res.json()) as { review?: { message?: string } }
    return {
      ok: true,
      message: data.review?.message ?? 'Thank you — your review is pending moderation.',
    }
  } catch {
    return { ok: false, message: 'Network error. Please try again.' }
  }
}
