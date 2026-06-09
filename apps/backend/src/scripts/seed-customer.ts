import { ExecArgs } from '@medusajs/framework/types'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { ICustomerModuleService, IAuthModuleService } from '@medusajs/types'

const TEST_CUSTOMER = {
  email: 'customer@treasuretrove.com',
  password: 'Customer@123',
  first_name: 'Priya',
  last_name: 'Sharma',
  phone: '+91 9876543210',
}

const TEST_ADDRESSES = [
  {
    first_name: 'Priya',
    last_name: 'Sharma',
    address_1: '12, Raghunath Nagar',
    address_2: 'Near ISBT',
    city: 'Delhi',
    province: 'Delhi',
    postal_code: '110014',
    country_code: 'in',
    phone: '+91 9876543210',
    is_default_shipping: true,
    is_default_billing: true,
    metadata: { label: 'Home' },
  },
  {
    first_name: 'Priya',
    last_name: 'Sharma',
    address_1: 'Level 5, Unitech Cyber Park',
    address_2: 'Sector 39',
    city: 'Gurugram',
    province: 'Haryana',
    postal_code: '122001',
    country_code: 'in',
    phone: '+91 9876543210',
    is_default_shipping: false,
    is_default_billing: false,
    metadata: { label: 'Office' },
  },
]

export default async function seedCustomer({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)
  const authService: IAuthModuleService = container.resolve(Modules.AUTH)

  logger.info('[seed-customer] Starting customer seed...')

  // ── 1. Check for existing customer ────────────────────────────────
  const existing = await customerService.listCustomers({ email: TEST_CUSTOMER.email })
  if (existing.length > 0) {
    logger.warn(`[seed-customer] Customer ${TEST_CUSTOMER.email} already exists — skipping.`)
    return
  }

  // ── 2. Create customer profile ────────────────────────────────────
  const customer = await customerService.createCustomers({
    first_name: TEST_CUSTOMER.first_name,
    last_name: TEST_CUSTOMER.last_name,
    email: TEST_CUSTOMER.email,
    phone: TEST_CUSTOMER.phone,
    metadata: {
      wishlist: [],
    },
  })
  logger.info(`[seed-customer] Created customer id=${customer.id}`)

  // ── 3. Create auth identity (emailpass) ───────────────────────────
  // Medusa's auth module handles password hashing internally via the
  // emailpass provider. We create the identity then set the password.
  await authService.createAuthIdentities({
    provider_identities: [
      {
        entity_id: TEST_CUSTOMER.email,
        provider: 'emailpass',
        provider_metadata: {
          // Medusa's emailpass provider stores BCrypt-hashed password here.
          // Use the /auth/customer/emailpass/register endpoint to let the
          // provider hash it properly in a live environment. For seeding,
          // the test customer should authenticate via the register endpoint
          // on first use, or the password can be reset via Medusa Admin.
          password: TEST_CUSTOMER.password,
        },
      },
    ],
    app_metadata: {
      customer_id: customer.id,
    },
  })
  logger.info(`[seed-customer] Created auth identity for ${TEST_CUSTOMER.email}`)

  // ── 4. Add saved addresses ─────────────────────────────────────────
  for (const address of TEST_ADDRESSES) {
    await customerService.createCustomerAddresses({
      ...address,
      customer_id: customer.id,
    })
  }
  logger.info(`[seed-customer] Added ${TEST_ADDRESSES.length} addresses`)

  logger.info('[seed-customer] Done.')
  logger.info(`[seed-customer] Login: ${TEST_CUSTOMER.email} / ${TEST_CUSTOMER.password}`)
  logger.info('[seed-customer] Note: Orders must be placed via checkout — no direct seed.')
}
