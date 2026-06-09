import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review'
import type ProductReviewModuleService from '../../../modules/product-review/service'

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const service: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const status = req.query['status'] as string | undefined
  const productId = req.query['product_id'] as string | undefined
  const limit = Math.min(parseInt(String(req.query['limit'] ?? '50'), 10) || 50, 200)
  const offset = Math.max(parseInt(String(req.query['offset'] ?? '0'), 10) || 0, 0)

  const filters: Record<string, unknown> = {}
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    filters['status'] = status
  }
  if (productId) {
    filters['product_id'] = productId
  }

  const [reviews, count] = await service.listAndCountProductReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: 'DESC' },
  })

  res.json({ reviews, count, limit, offset })
}
