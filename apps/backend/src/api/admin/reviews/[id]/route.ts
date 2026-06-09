import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { PRODUCT_REVIEW_MODULE } from '../../../../modules/product-review'
import type ProductReviewModuleService from '../../../../modules/product-review/service'

type UpdateReviewBody = {
  status?: 'pending' | 'approved' | 'rejected'
  verified?: boolean
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const id = req.params['id']!
  const service: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const body = req.body as UpdateReviewBody

  const update: Record<string, unknown> = { id }
  if (body.status && ['pending', 'approved', 'rejected'].includes(body.status)) {
    update['status'] = body.status
  }
  if (typeof body.verified === 'boolean') {
    update['verified'] = body.verified
  }

  if (Object.keys(update).length === 1) {
    res.status(400).json({ message: 'Provide status or verified to update.' })
    return
  }

  const [review] = await service.updateProductReviews([update])
  res.json({ review })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const id = req.params['id']!
  const service: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  await service.deleteProductReviews(id)
  res.json({ id, object: 'product_review', deleted: true })
}
