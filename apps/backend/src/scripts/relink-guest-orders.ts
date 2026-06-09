import { Modules } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'

/**
 * Re-link orders that were attached to guest customer records (has_account=false)
 * to the matching registered customer (has_account=true) with the same email.
 *
 * Background: the storefront created guest carts at checkout, so Medusa created
 * a separate guest customer from the cart email and attached the order to it.
 * The logged-in (registered) customer therefore saw no orders. The checkout fix
 * (transferring the cart to the logged-in customer before completion) prevents
 * this going forward; this script repairs orders placed before that fix.
 *
 * SAFETY: report-only by default. Set APPLY=1 to actually update orders.
 * Only re-links when there is EXACTLY ONE registered customer for the email
 * (unambiguous target). Guest customer records are left in place (harmless).
 */
export default async function relinkGuestOrders({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve('logger')
  const customerService = container.resolve(Modules.CUSTOMER)
  const orderService = container.resolve(Modules.ORDER)
  const apply = process.env['APPLY'] === '1'

  logger.info(`[relink] mode: ${apply ? 'APPLY (will update orders)' : 'REPORT-ONLY (no changes)'}`)

  const customers = (await customerService.listCustomers(
    {},
    { select: ['id', 'email', 'has_account'], take: 10000 },
  )) as Array<{ id: string; email: string; has_account: boolean }>

  // Group customer records by lowercased email.
  const byEmail = new Map<string, typeof customers>()
  for (const c of customers) {
    const key = (c.email ?? '').toLowerCase()
    if (!key) continue
    const arr = byEmail.get(key) ?? []
    arr.push(c)
    byEmail.set(key, arr)
  }

  let totalRelinked = 0
  let emailsTouched = 0

  for (const [email, records] of byEmail) {
    const registered = records.filter((c) => c.has_account)
    const guests = records.filter((c) => !c.has_account)
    if (registered.length === 0 || guests.length === 0) continue

    if (registered.length > 1) {
      logger.warn(
        `[relink] SKIP ${email}: ${registered.length} registered customers (ambiguous target)`,
      )
      continue
    }

    const target = registered[0]!
    const guestIds = guests.map((g) => g.id)
    const orders = (await orderService.listOrders(
      { customer_id: guestIds },
      { select: ['id', 'display_id', 'customer_id'] },
    )) as Array<{ id: string; display_id: number }>

    if (orders.length === 0) continue

    emailsTouched++
    logger.info(
      `[relink] ${email}: ${orders.length} order(s) on ${guestIds.length} guest record(s) -> registered ${target.id}`,
    )

    if (apply) {
      await orderService.updateOrders(orders.map((o) => ({ id: o.id, customer_id: target.id })))
      logger.info(`[relink]   updated ${orders.length} order(s)`)
    }
    totalRelinked += orders.length
  }

  logger.info(
    `[relink] DONE — ${apply ? 'updated' : 'would update'} ${totalRelinked} order(s) across ${emailsTouched} email(s)`,
  )
  if (!apply && totalRelinked > 0) {
    logger.info(`[relink] Re-run with APPLY=1 to perform the update.`)
  }
}
