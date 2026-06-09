import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'
import { MEILISEARCH_MODULE } from '../../modules/meilisearch'
import type MeilisearchModuleService from '../../modules/meilisearch/service'
import type { ProductDocument } from '../../modules/meilisearch/service'

type DeleteProductsStepInput = {
  ids: string[]
}

export const deleteProductsFromMeilisearchStep = createStep(
  'delete-products-from-meilisearch-step',
  async ({ ids }: DeleteProductsStepInput, { container }) => {
    const meilisearch = container.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)
    await meilisearch.deleteProducts(ids)
    return new StepResponse(undefined, ids)
  },
  async (ids: string[] | undefined, { container }) => {
    // Compensation is a no-op — we cannot restore deleted products to the index
    // without their full document data. The next product.updated event will re-index.
    if (!ids?.length) return
    const meilisearch = container.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)
    const logger = (container.resolve as (key: string) => { warn: (msg: string) => void })('logger')
    logger.warn(
      `[meilisearch] Compensation: cannot restore ${ids.length} deleted product(s) to index`,
    )
  },
)

export type { ProductDocument }
