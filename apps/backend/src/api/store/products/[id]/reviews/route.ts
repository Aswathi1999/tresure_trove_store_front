import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { PRODUCT_REVIEW_MODULE } from '../../../../../modules/product-review'
import type ProductReviewModuleService from '../../../../../modules/product-review/service'

type CreateReviewBody = {
  customer_name?: string
  customer_email?: string
  rating?: number
  title?: string
  body?: string
}

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const productId = req.params['id']!
  const service: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const limit = Math.min(parseInt(String(req.query['limit'] ?? '20'), 10) || 20, 100)
  const offset = Math.max(parseInt(String(req.query['offset'] ?? '0'), 10) || 0, 0)

  const [reviews, count] = await service.listAndCountProductReviews(
    { product_id: productId, status: 'approved' },
    { take: limit, skip: offset, order: { created_at: 'DESC' } },
  )

  const allApproved = await service.listProductReviews({
    product_id: productId,
    status: 'approved',
  })
  const total = allApproved.length
  const sum = allApproved.reduce((acc, r) => acc + (r.rating ?? 0), 0)
  const average = total > 0 ? sum / total : 0

  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of allApproved) {
    const bucket = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
    distribution[bucket] += 1
  }

  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      customer_name: r.customer_name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      verified: r.verified,
      created_at: r.created_at,
    })),
    count,
    aggregate: {
      total,
      average: Math.round(average * 10) / 10,
      distribution,
    },
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const productId = req.params['id']!
  const service: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const body = (req.body ?? {}) as CreateReviewBody

  const rating = Number(body.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ message: 'rating must be a number between 1 and 5' })
    return
  }

  const reviewBody = (body.body ?? '').trim().slice(0, 4000)
  const customerName = (body.customer_name ?? '').trim().slice(0, 80) || 'Anonymous'
  const customerEmail = (body.customer_email ?? '').trim().slice(0, 120) || null
  const title = (body.title ?? '').trim().slice(0, 120)

  const customerId =
    (req as MedusaRequest & { auth_context?: { actor_id?: string } }).auth_context?.actor_id ?? null

  try {
    const [review] = await service.createProductReviews([
      {
        product_id: productId,
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        rating: Math.round(rating),
        title,
        body: reviewBody,
        status: 'pending',
        verified: false,
      },
    ])

    res.status(201).json({
      review: {
        id: review!.id,
        status: review!.status,
        message: 'Thank you — your review is pending moderation.',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`[reviews] Failed to create review for product ${productId}: ${message}`)
    res.status(500).json({ message: 'Could not save your review.', detail: message })
  }
}
