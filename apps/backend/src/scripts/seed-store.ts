/**
 * Updates the default Medusa store record to use Treasure Trove branding.
 *
 * Run with:
 *   pnpm db:seed-store
 *
 * Safe to re-run — finds the existing store and updates it in place.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function seedStore({ container }: ExecArgs) {
  const storeService = container.resolve(Modules.STORE)

  const [store] = await storeService.listStores()

  if (!store) {
    console.log('[seed-store] No store record found — skipping.')
    return
  }

  await storeService.updateStores(store.id, {
    name: 'Treasure Trove Store',
    supported_currencies: [
      { currency_code: 'inr', is_default: true },
      { currency_code: 'usd', is_default: false },
    ],
  })

  console.log(`[seed-store] Store updated: "${store.name}" → "Treasure Trove Store"`)
}
