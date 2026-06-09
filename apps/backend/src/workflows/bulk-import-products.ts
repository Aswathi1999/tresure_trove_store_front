import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import { Modules } from '@medusajs/framework/utils'
import { createProductsWorkflow, updateProductsWorkflow } from '@medusajs/core-flows'

// ─── Types ─────────────────────────────────────────────────────────────────

export type BulkImportRow = {
  title: string
  handle: string
  description: string
  variant_sku: string
  price_inr: number
  price_usd: number
  stock: number
  material: string
  size: string
  finish: string
  wood_type: string
  dimensions: string
  warranty: string
}

export type BulkImportInput = {
  rows: BulkImportRow[]
}

export type BulkImportResult = {
  created: string[]
  updated: string[]
  skipped: string[]
  failed: { handle: string; error: string }[]
}

// ─── Internal types ────────────────────────────────────────────────────────

type ProductGroup = {
  handle: string
  title: string
  description: string
  wood_type: string
  dimensions: string
  warranty: string
  variants: BulkImportRow[]
}

// ─── Pure helpers (used in transform blocks — no I/O) ─────────────────────

function groupRowsByHandle(rows: BulkImportRow[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>()
  for (const row of rows) {
    if (!row.handle || !row.title) continue
    const existing = map.get(row.handle)
    if (existing) {
      existing.variants.push(row)
    } else {
      map.set(row.handle, {
        handle: row.handle,
        title: row.title,
        description: row.description,
        wood_type: row.wood_type,
        dimensions: row.dimensions,
        warranty: row.warranty,
        variants: [row],
      })
    }
  }
  return [...map.values()]
}

function parseDimensions(
  raw: string,
): { width: number; depth: number; height: number; unit: string } | null {
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\s*(\w+)?$/)
  if (!match) return null
  return {
    width: parseFloat(match[1]),
    depth: parseFloat(match[2]),
    height: parseFloat(match[3]),
    unit: match[4] ?? 'cm',
  }
}

function buildVariantInputs(group: ProductGroup) {
  return group.variants.map((v) => {
    const optionValues: Record<string, string> = {}
    if (v.material) optionValues['Material'] = v.material
    if (v.size) optionValues['Size'] = v.size
    if (v.finish) optionValues['Finish'] = v.finish

    return {
      title: [v.material, v.size, v.finish].filter(Boolean).join(' / ') || group.title,
      sku: v.variant_sku || undefined,
      manage_inventory: true,
      inventory_quantity: v.stock,
      options: optionValues,
      prices: [
        ...(v.price_inr > 0 ? [{ amount: v.price_inr, currency_code: 'inr' }] : []),
        ...(v.price_usd > 0 ? [{ amount: v.price_usd, currency_code: 'usd' }] : []),
      ],
    }
  })
}

// ─── Step 1: fetch existing product handles ────────────────────────────────

const fetchExistingHandlesStep = createStep(
  'fetch-existing-product-handles',
  async ({ handles }: { handles: string[] }, { container }) => {
    if (handles.length === 0) return new StepResponse([] as string[])

    const productModuleService = container.resolve(Modules.PRODUCT)
    const found = await productModuleService.listProducts(
      { handle: handles },
      { select: ['handle'], take: handles.length },
    )
    return new StepResponse(found.map((p: { handle: string }) => p.handle))
  },
)

// ─── Step 2: create new products ──────────────────────────────────────────

const createNewProductsStep = createStep(
  'create-new-products',
  async ({ groups }: { groups: ProductGroup[] }, { container }) => {
    const created: string[] = []
    const failed: { handle: string; error: string }[] = []

    for (const group of groups) {
      try {
        const uniqueMaterials = [...new Set(group.variants.map((v) => v.material).filter(Boolean))]
        const uniqueSizes = [...new Set(group.variants.map((v) => v.size).filter(Boolean))]
        const uniqueFinishes = [...new Set(group.variants.map((v) => v.finish).filter(Boolean))]

        const options: { title: string; values: string[] }[] = []
        if (uniqueMaterials.length) options.push({ title: 'Material', values: uniqueMaterials })
        if (uniqueSizes.length) options.push({ title: 'Size', values: uniqueSizes })
        if (uniqueFinishes.length) options.push({ title: 'Finish', values: uniqueFinishes })

        const dimensions = group.dimensions ? parseDimensions(group.dimensions) : null

        await createProductsWorkflow(container).run({
          input: {
            products: [
              {
                title: group.title,
                handle: group.handle,
                description: group.description || undefined,
                status: 'draft' as const,
                options,
                variants: buildVariantInputs(group),
                metadata: {
                  ...(group.wood_type ? { wood_type: group.wood_type } : {}),
                  ...(dimensions ? { dimensions } : {}),
                  ...(group.warranty ? { warranty: group.warranty } : {}),
                },
              },
            ],
          },
        })

        created.push(group.handle)
      } catch (err) {
        failed.push({
          handle: group.handle,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    return new StepResponse({ created, failed })
  },
)

// ─── Step 3: add new variants to existing products (idempotent by SKU) ─────

const addVariantsToExistingStep = createStep(
  'add-variants-to-existing-products',
  async ({ groups }: { groups: ProductGroup[] }, { container }) => {
    const updated: string[] = []
    const skipped: string[] = []
    const failed: { handle: string; error: string }[] = []

    if (groups.length === 0) return new StepResponse({ updated, skipped, failed })

    const productModuleService = container.resolve(Modules.PRODUCT)

    for (const group of groups) {
      try {
        const [existing] = await productModuleService.listProducts(
          { handle: [group.handle] },
          { select: ['id', 'handle'], relations: ['variants'], take: 1 },
        )

        if (!existing) {
          skipped.push(group.handle)
          continue
        }

        const existingSkus = new Set<string>(
          (existing.variants ?? [])
            .map((v: { sku: string | null }) => v.sku)
            .filter((s: string | null): s is string => s !== null),
        )

        const newVariants = group.variants.filter(
          (v) => !v.variant_sku || !existingSkus.has(v.variant_sku),
        )

        if (newVariants.length === 0) {
          skipped.push(group.handle)
          continue
        }

        await updateProductsWorkflow(container).run({
          input: {
            products: [
              {
                id: existing.id,
                variants: buildVariantInputs({ ...group, variants: newVariants }),
              },
            ],
          },
        })

        updated.push(group.handle)
      } catch (err) {
        failed.push({
          handle: group.handle,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    return new StepResponse({ updated, skipped, failed })
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const bulkImportProductsWorkflow = createWorkflow(
  'bulk-import-products',
  function (input: BulkImportInput) {
    const groups = transform({ input }, ({ input: i }) => groupRowsByHandle(i.rows))

    const handles = transform({ groups }, ({ groups: g }) => g.map((x) => x.handle))

    const existingHandles = fetchExistingHandlesStep({ handles })

    const { newGroups, existingGroups } = transform(
      { groups, existingHandles },
      ({ groups: g, existingHandles: ex }) => {
        const exSet = new Set(ex)
        return {
          newGroups: g.filter((x) => !exSet.has(x.handle)),
          existingGroups: g.filter((x) => exSet.has(x.handle)),
        }
      },
    )

    const createResult = createNewProductsStep({ groups: newGroups })
    const updateResult = addVariantsToExistingStep({ groups: existingGroups })

    const summary = transform(
      { createResult, updateResult },
      ({ createResult: c, updateResult: u }): BulkImportResult => ({
        created: c.created,
        updated: u.updated,
        skipped: u.skipped,
        failed: [...c.failed, ...u.failed],
      }),
    )

    return new WorkflowResponse(summary)
  },
)
