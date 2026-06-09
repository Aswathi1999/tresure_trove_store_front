import { randomBytes } from 'crypto'

/**
 * Shared helpers for auto-generating variant SKUs.
 *
 * The PRIMARY use is the admin API middleware (`src/api/middlewares.ts`), which
 * fills a blank SKU into the request body BEFORE the product/variant is created.
 * That timing matters: Medusa allocates the variant's inventory item during
 * creation keyed on the SKU, so a SKU present up front forces a fresh, dedicated
 * inventory item. Setting the SKU after creation (the old subscriber approach)
 * renames the variant but leaves the inventory item null-SKU and shareable.
 *
 * Format: `<HANDLE>-<OPT1>-<OPT2>-<SUFFIX>` upper-cased.
 *   e.g.  SUNAPPI-WHITE-WOOD-9F3KA
 */

export function slug(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

/** Short, globally-unique suffix so two unrelated products never collide on a SKU. */
export function randomSuffix(length = 5): string {
  return randomBytes(8).toString('hex').toUpperCase().slice(0, length)
}

export function buildVariantSku(
  handle: string | null | undefined,
  optionValues: Array<string | null | undefined>,
  suffix: string,
): string {
  return [slug(handle), ...optionValues.map(slug), suffix].filter(Boolean).join('-')
}

/** A variant needs a SKU when it has none or only whitespace. */
export function hasBlankSku(variant: { sku?: unknown } | null | undefined): boolean {
  const sku = variant?.sku
  return typeof sku !== 'string' || sku.trim().length === 0
}

/**
 * Variant option values can arrive in several shapes depending on the route:
 *   - admin create product:   options: { Material: 'Oak', Finish: 'Matte' }
 *   - variant relations:       options: [{ value: 'Oak' }, { value: 'Matte' }]
 * Returns a flat list of value strings in either case.
 */
export function optionValuesOf(variant: { options?: unknown } | null | undefined): string[] {
  const opts = variant?.options
  if (!opts) return []
  if (Array.isArray(opts)) {
    return opts
      .map((o) => (o && typeof o === 'object' ? (o as { value?: unknown }).value : o))
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
  }
  if (typeof opts === 'object') {
    return Object.values(opts as Record<string, unknown>).filter(
      (v): v is string => typeof v === 'string' && v.length > 0,
    )
  }
  return []
}
