// @ts-nocheck
/**
 * Custom Medusa middleware for Treasure Trove store routes.
 *
 * Medusa v2 automatically enforces the following on all /store/* routes —
 * no custom code is needed for these:
 *
 *   ✅ CORS           — storeCors from medusa-config.ts (via STORE_CORS env)
 *   ✅ Publishable key — x-publishable-api-key header validated by the framework
 *   ✅ Auth scope      — publishable key is scoped to a sales channel in the admin
 */

import { defineMiddlewares } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import multer from 'multer'
import { buildVariantSku, hasBlankSku, optionValuesOf, randomSuffix } from '../lib/variant-sku'

// Fill a blank SKU on a single variant-like object, in place.
function fillVariantSku(variant: Record<string, unknown>, handle: string | null | undefined): void {
  if (!variant || typeof variant !== 'object') return
  if (!hasBlankSku(variant)) return
  variant['sku'] = buildVariantSku(handle, optionValuesOf(variant), randomSuffix())
}

// Apply our creation defaults to a variant, in place. Returns true if changed.
//  - blank SKU  -> unique generated SKU (dedicated inventory item per variant)
//  - manage_inventory not enabled -> force true, so Medusa auto-creates that
//    dedicated inventory item at creation. Without this the variant has NO item
//    and the admin "Manage inventory items" page forces linking another product's
//    item (shared stock). We always track inventory for this catalogue.
function applyVariantDefaults(
  variant: Record<string, unknown>,
  handle: string | null | undefined,
): boolean {
  if (!variant || typeof variant !== 'object') return false
  let changed = false
  if (hasBlankSku(variant)) {
    fillVariantSku(variant, handle)
    changed = true
  }
  if (variant['manage_inventory'] !== true) {
    variant['manage_inventory'] = true
    changed = true
  }
  return changed
}

// Handler shared by the variant-CREATE endpoints (single + batch). Registered
// ONLY on the exact create paths — never on `/variants/:id/...` subroutes such
// as `/inventory-items`, whose schemas reject an injected `sku` field.
async function fillVariantAddSkus(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction,
): Promise<void> {
  if (req.method !== 'POST') return next()

  // Hard guard: only the create endpoints — `.../variants` and `.../variants/batch`.
  // Never `.../variants/:id/...` (e.g. inventory-items), whose body rejects `sku`.
  if (!/\/admin\/products\/[^/]+\/variants(\/batch)?$/.test(req.path)) return next()

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // Resolve the product handle from the :id in the path for a readable SKU.
  const idMatch = req.path.match(/\/admin\/products\/([^/]+)\/variants/)
  let handle: string | undefined = idMatch?.[1]
  if (idMatch?.[1]) {
    try {
      const productModule = req.scope.resolve(Modules.PRODUCT)
      const product = await productModule.retrieveProduct(idMatch[1], { select: ['handle'] })
      handle = product?.handle ?? handle
    } catch {
      // fall back to the id in the path
    }
  }

  let filled = 0
  const patchVariant = (v: unknown) => {
    if (v && typeof v === 'object') {
      if (applyVariantDefaults(v as Record<string, unknown>, handle)) filled++
    }
  }
  const apply = (body: unknown) => {
    if (!body || typeof body !== 'object') return
    const b = body as { create?: unknown; variants?: unknown }
    if (Array.isArray(b.create))
      b.create.forEach(patchVariant) // batch endpoint
    else if (Array.isArray(b.variants)) b.variants.forEach(patchVariant)
    else patchVariant(body) // single-variant create
  }
  apply(req.body)
  if ((req as { validatedBody?: unknown }).validatedBody)
    apply((req as { validatedBody?: unknown }).validatedBody)
  if (filled > 0) logger.info(`[auto-variant-sku] Filled ${filled} blank SKU(s) on variant add`)
  next()
}

// Guardrail: reject linking an inventory item that already belongs to a DIFFERENT
// product (the admin "Manage inventory items" → Select/Add flow). Sharing one
// inventory item across products makes them share stock + reservations — the
// null-SKU quirk's manual twin. Linking within the SAME product (e.g. a bundle)
// is still allowed. Fails open if the lookup errors so it never blocks wrongly.
async function blockCrossProductInventoryLink(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
): Promise<void> {
  if (req.method !== 'POST') return next()
  if (!/\/admin\/products\/[^/]+\/variants\/[^/]+\/inventory-items$/.test(req.path)) return next()

  const inventoryItemId = (req.body as { inventory_item_id?: unknown } | null)?.inventory_item_id
  if (typeof inventoryItemId !== 'string' || !inventoryItemId) return next()

  const currentProductId = req.path.match(/\/admin\/products\/([^/]+)\/variants\//)?.[1]

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: 'inventory_item',
      fields: ['id', 'variants.product.id', 'variants.product.title'],
      filters: { id: [inventoryItemId] },
    })
    const variants = (data?.[0]?.variants ?? []) as Array<{
      product?: { id?: string; title?: string } | null
    }>
    const otherTitles = [
      ...new Set(
        variants
          .filter((v) => v?.product?.id && v.product.id !== currentProductId)
          .map((v) => v.product!.title)
          .filter(Boolean),
      ),
    ]
    if (otherTitles.length > 0) {
      const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
      logger.warn(
        `[inventory-guard] Blocked linking ${inventoryItemId} (already used by ${otherTitles.join(
          ', ',
        )}) to product ${currentProductId}`,
      )
      return res.status(409).json({
        type: 'not_allowed',
        message: `That inventory item already belongs to another product (${otherTitles.join(
          ', ',
        )}). Each variant should have its own inventory item — create a new one instead of sharing.`,
      })
    }
  } catch {
    // Fail open: never block a legitimate request just because the check errored.
  }
  next()
}

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (
    _req: unknown,
    file: { mimetype: string; originalname: string },
    cb: (err: Error | null, accept: boolean) => void,
  ) => {
    cb(null, file.mimetype === 'text/csv' || file.originalname.endsWith('.csv'))
  },
})

export default defineMiddlewares({
  routes: [
    {
      // Log all store product requests so filter/sort params are visible in server logs.
      matcher: '/store/products*',
      middlewares: [
        (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
          const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
          logger.debug(
            `[store] GET /store/products query=${JSON.stringify(req.query)} publishableKey=${
              req.headers['x-publishable-api-key'] ? 'present' : 'missing'
            }`,
          )
          next()
        },
      ],
    },
    {
      // Preserve raw body for Razorpay HMAC webhook signature verification.
      // preserveRawBody makes req.rawBody available in the route handler.
      matcher: '/webhooks/razorpay',
      bodyParser: { preserveRawBody: true },
    },
    {
      // Disable default JSON body parser for CSV import — multer handles the body.
      matcher: '/admin/products/import',
      bodyParser: false,
      middlewares: [csvUpload.single('file') as unknown as MedusaNextFunction],
    },
    {
      // Auto-fill blank variant SKUs when CREATING a product with inline variants.
      // Done here (before the create workflow) so Medusa allocates each variant a
      // fresh, dedicated inventory item keyed on the SKU. A blank SKU at creation
      // lets Medusa bind the variant to an existing null-SKU inventory item from an
      // unrelated product, which then shares stock + reservations. We patch both
      // req.body and req.validatedBody so it works regardless of validation order.
      matcher: '/admin/products',
      middlewares: [
        (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
          if (req.method !== 'POST') return next()
          const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
          let filled = 0
          const apply = (body: unknown) => {
            if (!body || typeof body !== 'object') return
            const b = body as { handle?: string; title?: string; variants?: unknown }
            if (!Array.isArray(b.variants)) return
            const handle = b.handle || b.title
            for (const v of b.variants) {
              if (v && typeof v === 'object') {
                if (applyVariantDefaults(v as Record<string, unknown>, handle)) filled++
              }
            }
          }
          apply(req.body)
          if ((req as { validatedBody?: unknown }).validatedBody)
            apply((req as { validatedBody?: unknown }).validatedBody)
          if (filled > 0)
            logger.info(`[auto-variant-sku] Filled ${filled} blank SKU(s) on product create`)
          next()
        },
      ],
    },
    {
      // Auto-fill when CREATING a single variant on an existing product.
      // Exact path only — must NOT catch `/variants/:id/...` subroutes (e.g.
      // inventory-items), whose schemas reject an injected `sku` field.
      matcher: '/admin/products/*/variants',
      middlewares: [fillVariantAddSkus],
    },
    {
      // Auto-fill for the batch endpoint (body shape { create: [...] }).
      matcher: '/admin/products/*/variants/batch',
      middlewares: [fillVariantAddSkus],
    },
    {
      // Guardrail: block linking an inventory item owned by another product
      // (the "Manage inventory items → Select/Add" flow) to prevent shared stock.
      matcher: '/admin/products/*/variants/*/inventory-items',
      middlewares: [blockCrossProductInventoryLink],
    },
    {
      // Reject creating a collection with a title that already exists (case-insensitive).
      matcher: '/admin/collections',
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
          logger.info(
            `[dup-check collection] hit method=${req.method} bodyKeys=${
              req.body ? Object.keys(req.body).join(',') : 'null'
            }`,
          )
          if (req.method !== 'POST') return next()
          const title = (req.body as { title?: unknown } | null)?.title
          if (typeof title !== 'string' || !title.trim()) return next()
          const productModule = req.scope.resolve(Modules.PRODUCT)
          const existing = await productModule.listProductCollections(
            { title: { $ilike: title.trim() } },
            { select: ['id', 'title'], take: 1 },
          )
          logger.info(`[dup-check collection] title="${title.trim()}" found=${existing.length}`)
          if (existing.length > 0) {
            return res.status(409).json({
              type: 'duplicate_collection',
              message: `A collection with title "${title.trim()}" already exists.`,
            })
          }
          next()
        },
      ],
    },
    {
      // Reject creating a category with a name that already exists (case-insensitive).
      matcher: '/admin/product-categories',
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
          logger.info(
            `[dup-check category] hit method=${req.method} bodyKeys=${
              req.body ? Object.keys(req.body).join(',') : 'null'
            }`,
          )
          if (req.method !== 'POST') return next()
          const name = (req.body as { name?: unknown } | null)?.name
          if (typeof name !== 'string' || !name.trim()) return next()
          const productModule = req.scope.resolve(Modules.PRODUCT)
          const existing = await productModule.listProductCategories(
            { name: { $ilike: name.trim() } },
            { select: ['id', 'name'], take: 1 },
          )
          logger.info(`[dup-check category] name="${name.trim()}" found=${existing.length}`)
          if (existing.length > 0) {
            return res.status(409).json({
              type: 'duplicate_category',
              message: `A category with name "${name.trim()}" already exists.`,
            })
          }
          next()
        },
      ],
    },
    {
      // Sanitize all string fields in the contact form body before the handler runs.
      // Strips HTML tags (XSS prevention) and trims surrounding whitespace.
      matcher: '/store/contact',
      middlewares: [
        (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
          if (req.body !== null && typeof req.body === 'object') {
            const body = req.body as Record<string, unknown>
            for (const key of Object.keys(body)) {
              if (typeof body[key] === 'string') {
                body[key] = (body[key] as string).replace(/<[^>]*>/g, '').trim()
              }
            }
          }
          next()
        },
      ],
    },
    {
      // Strip HTML from review submissions to prevent stored-XSS, since the body
      // is rendered as plain text on the storefront review list.
      matcher: '/store/products/*/reviews',
      middlewares: [
        (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
          if (req.method !== 'POST') return next()
          if (req.body !== null && typeof req.body === 'object') {
            const body = req.body as Record<string, unknown>
            for (const key of ['customer_name', 'customer_email', 'title', 'body']) {
              if (typeof body[key] === 'string') {
                body[key] = (body[key] as string).replace(/<[^>]*>/g, '').trim()
              }
            }
          }
          next()
        },
      ],
    },
  ],
})
