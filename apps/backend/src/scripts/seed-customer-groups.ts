import { ExecArgs } from '@medusajs/framework/types'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { ICustomerModuleService, IPricingModuleService } from '@medusajs/types'

const RETAIL_GROUP = {
  name: 'retail',
  metadata: { description: 'Regular retail customers' },
}

const TRADE_GROUP = {
  name: 'trade',
  metadata: { description: 'Interior designers and architects eligible for trade pricing' },
}

const TRADE_PRICE_LIST_TITLE = 'Trade Price List'

export default async function seedCustomerGroups({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)
  const pricingService: IPricingModuleService = container.resolve(Modules.PRICING)

  logger.info('[seed-customer-groups] Starting customer group seed...')

  // ── 1. Check for existing groups ───────────────────────────────────────────
  const existingGroups = await customerService.listCustomerGroups({})
  const existingRetail = existingGroups.find((g) => g.name === RETAIL_GROUP.name)
  const existingTrade = existingGroups.find((g) => g.name === TRADE_GROUP.name)

  // ── 2. Create retail group ─────────────────────────────────────────────────
  let retailGroup: (typeof existingGroups)[number]

  if (existingRetail) {
    logger.warn(
      `[seed-customer-groups] "retail" group already exists id=${existingRetail.id} — skipping`,
    )
    retailGroup = existingRetail
  } else {
    retailGroup = await customerService.createCustomerGroups(RETAIL_GROUP)
    logger.info(`[seed-customer-groups] Created "retail" group id=${retailGroup.id}`)
  }

  // ── 3. Create trade group ──────────────────────────────────────────────────
  let tradeGroup: (typeof existingGroups)[number]

  if (existingTrade) {
    logger.warn(
      `[seed-customer-groups] "trade" group already exists id=${existingTrade.id} — skipping`,
    )
    tradeGroup = existingTrade
  } else {
    tradeGroup = await customerService.createCustomerGroups(TRADE_GROUP)
    logger.info(`[seed-customer-groups] Created "trade" group id=${tradeGroup.id}`)
  }

  // ── 4. Create trade price list associated with the trade group ─────────────
  const allPriceLists = await pricingService.listPriceLists()
  const existingTradeList = allPriceLists.find((pl) => pl.title === TRADE_PRICE_LIST_TITLE)

  if (existingTradeList) {
    logger.warn(
      `[seed-customer-groups] Trade price list already exists id=${existingTradeList.id} — skipping`,
    )
  } else {
    const [tradeList] = await pricingService.createPriceLists([
      {
        title: TRADE_PRICE_LIST_TITLE,
        description: 'Discounted pricing for interior designers and architects',
        type: 'override',
        status: 'active',
        rules: { customer_group_id: [tradeGroup.id] },
      },
    ])
    logger.info(`[seed-customer-groups] Created trade price list id=${tradeList.id}`)
    logger.info(
      '[seed-customer-groups] Trade price list linked to "trade" group — ' +
        'add variant prices via Medusa Admin to activate trade pricing on the storefront',
    )
  }

  logger.info('[seed-customer-groups] Done.')
  logger.info(`[seed-customer-groups] Retail group id=${retailGroup.id}`)
  logger.info(`[seed-customer-groups] Trade group id=${tradeGroup.id}`)
}
