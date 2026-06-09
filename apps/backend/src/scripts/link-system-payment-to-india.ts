/**
 * Enables Medusa's built-in "system" payment provider (id: pp_system_default)
 * on the India region. The system provider auto-authorizes any payment session
 * without calling an external API — perfect for COD or for local dev before
 * Razorpay is wired.
 *
 * Run with:
 *   pnpm db:link-system-payment-india
 *
 * Idempotent — if the link exists, the catch swallows the unique-constraint
 * error.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

const PROVIDER_ID = 'pp_system_default'

export default async function linkSystemPayment({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)

  const [region] = await regionService.listRegions({ name: 'India' })
  if (!region) {
    logger.error('[payment] No India region — run db:setup-shipping-india first.')
    return
  }

  await remoteLink
    .create({
      [Modules.REGION]: { region_id: region.id },
      [Modules.PAYMENT]: { payment_provider_id: PROVIDER_ID },
    })
    .catch((err: Error) => {
      logger.info(`[payment] Link already exists or skipped: ${err.message}`)
    })

  logger.info(`[payment] Linked ${PROVIDER_ID} → region India (${region.id})`)
}
