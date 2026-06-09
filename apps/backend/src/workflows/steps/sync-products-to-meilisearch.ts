import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'
import { MEILISEARCH_MODULE } from '../../modules/meilisearch'
import type MeilisearchModuleService from '../../modules/meilisearch/service'
import type { ProductDocument } from '../../modules/meilisearch/service'

type SyncProductsStepInput = {
  products: ProductDocument[]
}

export const syncProductsToMeilisearchStep = createStep(
  'sync-products-to-meilisearch-step',
  async ({ products }: SyncProductsStepInput, { container }) => {
    const meilisearch = container.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)
    await meilisearch.indexProducts(products)
    return new StepResponse(
      undefined,
      products.map((p) => p.id),
    )
  },
  async (productIds: string[] | undefined, { container }) => {
    if (!productIds?.length) return
    const meilisearch = container.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)
    await meilisearch.deleteProducts(productIds)
  },
)
