import { createWorkflow, transform, WorkflowResponse } from '@medusajs/framework/workflows-sdk'
import { useQueryGraphStep } from '@medusajs/medusa/core-flows'
import { syncProductsToMeilisearchStep } from './steps/sync-products-to-meilisearch'
import { deleteProductsFromMeilisearchStep } from './steps/delete-products-from-meilisearch'
import type { ProductDocument } from '../modules/meilisearch/service'

type SyncProductsWorkflowInput = {
  filters?: Record<string, unknown>
  limit?: number
  offset?: number
}

export const syncProductsToMeilisearchWorkflow = createWorkflow(
  'sync-products-to-meilisearch',
  ({ filters, limit, offset }: SyncProductsWorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: 'product',
      fields: [
        'id',
        'title',
        'handle',
        'thumbnail',
        'description',
        'status',
        'collection.id',
        'collection.title',
        'variants.prices.amount',
        'variants.prices.currency_code',
      ],
      pagination: {
        take: limit ?? 50,
        skip: offset ?? 0,
      },
      filters,
    })

    const { toSync, toDelete } = transform({ products }, ({ products }) => {
      const toSync: ProductDocument[] = []
      const toDelete: string[] = []

      for (const product of products as Record<string, unknown>[]) {
        if (product['status'] !== 'published') {
          toDelete.push(product['id'] as string)
          continue
        }

        const inrPrices = (
          (product['variants'] as { prices: { amount: number; currency_code: string }[] }[]) ?? []
        )
          .flatMap((v) => v.prices ?? [])
          .filter((p) => p.currency_code === 'inr')
          .map((p) => p.amount)

        const collection = product['collection'] as { id: string; title: string } | null

        toSync.push({
          id: product['id'] as string,
          title: product['title'] as string,
          handle: product['handle'] as string,
          thumbnail: (product['thumbnail'] as string | null) ?? null,
          description: (product['description'] as string | null) ?? null,
          collection_id: collection?.id ?? null,
          collection_title: collection?.title ?? null,
          min_price: inrPrices.length ? Math.min(...inrPrices) : null,
          max_price: inrPrices.length ? Math.max(...inrPrices) : null,
        })
      }

      return { toSync, toDelete }
    })

    syncProductsToMeilisearchStep({ products: toSync })
    deleteProductsFromMeilisearchStep({ ids: toDelete })

    return new WorkflowResponse({ synced: toSync.length, deleted: toDelete.length })
  },
)
