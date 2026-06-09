import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import {
  bulkImportProductsWorkflow,
  type BulkImportRow,
} from '../../../../workflows/bulk-import-products'

// ─── CSV parser ─────────────────────────────────────────────────────────────
// Expected columns (order must match header row):
//   title, handle, description, variant_sku, price_inr, price_usd,
//   stock, material, size, finish, wood_type, dimensions, warranty

const EXPECTED_COLUMNS = [
  'title',
  'handle',
  'description',
  'variant_sku',
  'price_inr',
  'price_usd',
  'stock',
  'material',
  'size',
  'finish',
  'wood_type',
  'dimensions',
  'warranty',
] as const

function parseCsv(text: string): BulkImportRow[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase())

  const missing = EXPECTED_COLUMNS.filter((c) => !headers.includes(c))
  if (missing.length > 0) {
    throw new Error(`CSV is missing required columns: ${missing.join(', ')}`)
  }

  const idx = (col: string) => headers.indexOf(col)

  return lines.slice(1).map((line) => {
    // Handle quoted fields that may contain commas.
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const cell = (col: string) => (values[idx(col)] ?? '').replace(/^"|"$/g, '').trim()

    return {
      title: cell('title'),
      handle: cell('handle'),
      description: cell('description'),
      variant_sku: cell('variant_sku'),
      price_inr: Math.round(parseFloat(cell('price_inr')) || 0),
      price_usd: Math.round(parseFloat(cell('price_usd')) || 0),
      stock: parseInt(cell('stock'), 10) || 0,
      material: cell('material'),
      size: cell('size'),
      finish: cell('finish'),
      wood_type: cell('wood_type'),
      dimensions: cell('dimensions'),
      warranty: cell('warranty'),
    }
  })
}

// ─── POST /admin/products/import ────────────────────────────────────────────

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  type MulterFile = { buffer: Buffer; originalname: string; mimetype: string; size: number }
  // multer attaches the uploaded file to req.file
  const file = (req as MedusaRequest & { file?: MulterFile }).file

  if (!file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FILE',
        message: 'No CSV file uploaded. Send a multipart/form-data request with a "file" field.',
        details: {},
      },
    })
  }

  let rows: BulkImportRow[]

  try {
    const csvText = file.buffer.toString('utf-8')
    rows = parseCsv(csvText)
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CSV_PARSE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to parse CSV file.',
        details: {},
      },
    })
  }

  if (rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_CSV',
        message: 'CSV file contains no data rows.',
        details: {},
      },
    })
  }

  logger.info(`[products/import] Starting bulk import — ${rows.length} rows`)

  try {
    const { result } = await bulkImportProductsWorkflow(req.scope).run({ input: { rows } })

    logger.info(
      `[products/import] Complete — created=${result.created.length} updated=${result.updated.length} ` +
        `skipped=${result.skipped.length} failed=${result.failed.length}`,
    )

    return res.status(200).json({
      success: true,
      summary: {
        total_rows: rows.length,
        created: result.created.length,
        updated: result.updated.length,
        skipped: result.skipped.length,
        failed: result.failed.length,
      },
      details: result,
    })
  } catch (err) {
    logger.error(`[products/import] Workflow failed: ${String(err)}`)
    return res.status(500).json({
      success: false,
      error: {
        code: 'IMPORT_WORKFLOW_FAILED',
        message: err instanceof Error ? err.message : 'Bulk import workflow encountered an error.',
        details: {},
      },
    })
  }
}
