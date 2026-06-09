import { model } from '@medusajs/framework/utils'

export const ProductReview = model.define('product_review', {
  id: model.id({ prefix: 'pr' }).primaryKey(),
  product_id: model.text().searchable(),
  customer_id: model.text().nullable(),
  customer_name: model.text(),
  customer_email: model.text().nullable(),
  rating: model.number(),
  title: model.text(),
  body: model.text(),
  status: model.text().default('pending'),
  verified: model.boolean().default(false),
})
