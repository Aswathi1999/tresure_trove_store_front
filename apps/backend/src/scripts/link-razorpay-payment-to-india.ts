/**
 * Enables the Razorpay payment provider (id: pp_razorpay_razorpay) on the India
 * region so the storefront can open a Razorpay payment session for INR carts.
 *
 * Requires RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET to be
 * set in apps/backend/.env — the provider is only registered (medusa-config.ts)
 * when those keys exist, so run this AFTER adding the keys and restarting the
 * backend once.
 *
 * Run with:
 *   pnpm db:link-razorpay-payment-india
 *
 * Idempotent — if the link exists, the catch swallows the unique-constraint
 * error.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

const PROVIDER_ID = 'pp_razorpay_razorpay'

export default async function linkRazorpayPayment({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)

  const [region] = await regionService.listRegions({ name: 'India' })
  if (!region) {
    logger.error('[payment] No India region — run db:seed-regions first.')
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
