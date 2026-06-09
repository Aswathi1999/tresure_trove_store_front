/**
 * Creates a publishable API key linked to the default sales channel and prints
 * it so it can be pasted into apps/storefront/.env.local as
 * NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.
 *
 * Run with:
 *   pnpm db:seed-publishable-key
 *
 * Idempotent — if a key titled "Storefront (local)" already exists it is
 * reused instead of creating a duplicate.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from '@medusajs/medusa/core-flows'

const KEY_TITLE = 'Storefront (local)'

export default async function seedPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apiKeyService = container.resolve(Modules.API_KEY)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const [defaultChannel] = await salesChannelService.listSalesChannels({
    name: 'Default Sales Channel',
  })

  if (!defaultChannel) {
    logger.error('[seed-publishable-key] No "Default Sales Channel" found — aborting.')
    return
  }

  const existing = await apiKeyService.listApiKeys({ title: KEY_TITLE, type: 'publishable' })

  let token: string

  if (existing.length > 0) {
    token = existing[0].token
    logger.info(`[seed-publishable-key] Reusing existing key "${KEY_TITLE}"`)
  } else {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title: KEY_TITLE, type: 'publishable', created_by: 'seed-script' }],
      },
    })
    token = result[0].token
    logger.info(`[seed-publishable-key] Created key "${KEY_TITLE}"`)

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: result[0].id, add: [defaultChannel.id] },
    })
    logger.info(`[seed-publishable-key] Linked key to "${defaultChannel.name}"`)
  }

  logger.info('')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(' Paste this into apps/storefront/.env.local:')
  logger.info('')
  logger.info(`   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`)
  logger.info('')
  logger.info(' Then restart pnpm dev.')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}
