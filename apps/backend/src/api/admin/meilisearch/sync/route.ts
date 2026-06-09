import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { syncProductsToMeilisearchWorkflow } from '../../../../workflows/sync-products-to-meilisearch'
import { MEILISEARCH_MODULE } from '../../../../modules/meilisearch'
import type MeilisearchModuleService from '../../../../modules/meilisearch/service'

const BATCH_SIZE = 50

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const meilisearch = req.scope.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)

  try {
    // Ensure index settings are applied before bulk sync
    await meilisearch.setupIndex()

    let offset = 0
    let totalSynced = 0
    let totalDeleted = 0
    let hasMore = true

    while (hasMore) {
      const { result } = await syncProductsToMeilisearchWorkflow(req.scope).run({
        input: { limit: BATCH_SIZE, offset },
      })

      totalSynced += result.synced
      totalDeleted += result.deleted
      hasMore = result.synced + result.deleted === BATCH_SIZE
      offset += BATCH_SIZE
    }

    logger.info(
      `[meilisearch] Full sync complete — synced: ${totalSynced}, removed: ${totalDeleted}`,
    )

    res.json({ success: true, synced: totalSynced, deleted: totalDeleted })
  } catch (error) {
    const err = error as Error
    logger.error(`[meilisearch] Sync failed: ${err.message}`)
    res.status(500).json({ success: false, error: err.message })
  }
}
