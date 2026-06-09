import { useState, useRef, useCallback } from 'react'
import { defineRouteConfig } from '@medusajs/admin-sdk'
import {
  ArrowDownTray,
  ArrowUpTray,
  CheckCircle,
  XCircle,
  InformationCircle,
} from '@medusajs/icons'

// ─── Types ────────────────────────────────────────────────────────────────────

type CsvRow = {
  title: string
  handle: string
  description: string
  status: string
  price_inr: string
  price_usd: string
  sku: string
  inventory: string
  wood_type: string
  warranty: string
  width: string
  depth: string
  height: string
  unit: string
}

type ImportResult = {
  row: CsvRow
  success: boolean
  error?: string
  productId?: string
}

type ImportState = 'idle' | 'parsing' | 'preview' | 'importing' | 'done'

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADERS: (keyof CsvRow)[] = [
  'title',
  'handle',
  'description',
  'status',
  'price_inr',
  'price_usd',
  'sku',
  'inventory',
  'wood_type',
  'warranty',
  'width',
  'depth',
  'height',
  'unit',
]

const TEMPLATE_ROW =
  'Okura Lounge Chair,okura-lounge-chair,"Handcrafted solid teak lounge chair",draft,145000,1750,SKU-OLC-001,10,Teak,5 years,85,75,80,cm'

const COLUMN_DESCRIPTIONS: Record<keyof CsvRow, string> = {
  title: 'Product name (required)',
  handle: 'URL slug — lowercase, hyphens only (required)',
  description: 'Full product description',
  status: 'draft | published | archived',
  price_inr: 'Price in rupees (e.g., 145000 for ₹1,45,000)',
  price_usd: 'Price in dollars (e.g., 1750 for $1,750)',
  sku: 'Unique variant SKU',
  inventory: 'Stock quantity',
  wood_type: 'Teak | Walnut | Oak | Mango | Rosewood',
  warranty: 'Warranty period, e.g. 5 years',
  width: 'Width in chosen unit',
  depth: 'Depth in chosen unit',
  height: 'Height in chosen unit',
  unit: 'cm | in',
}

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split('\n').filter((l) => l.trim())
  for (const line of lines) {
    const row: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        inQuotes = !inQuotes
      } else if (c === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += c
      }
    }
    row.push(current.trim())
    rows.push(row)
  }
  return rows
}

function rowsToCsvRows(matrix: string[][]): CsvRow[] {
  const [header, ...body] = matrix
  if (!header) return []
  return body
    .filter((r) => r.some((c) => c !== ''))
    .map((r) => {
      const obj: Record<string, string> = {}
      header.forEach((h, i) => {
        obj[h] = r[i] ?? ''
      })
      return obj as unknown as CsvRow
    })
}

function buildProductPayload(row: CsvRow) {
  const priceInrRupees = parseInt(row.price_inr, 10)
  const priceUsdDollars = parseInt(row.price_usd, 10)
  const priceInr = priceInrRupees * 100
  const priceUsd = priceUsdDollars * 100

  const hasDimensions = row.width || row.depth || row.height

  return {
    title: row.title,
    handle: row.handle || undefined,
    description: row.description || undefined,
    status: ['draft', 'published', 'archived'].includes(row.status) ? row.status : 'draft',
    options: [{ title: 'Default', values: ['Default'] }],
    variants: [
      {
        title: 'Default',
        sku: row.sku || undefined,
        prices: [
          ...(!isNaN(priceInr) ? [{ amount: priceInr, currency_code: 'inr' }] : []),
          ...(!isNaN(priceUsd) ? [{ amount: priceUsd, currency_code: 'usd' }] : []),
        ],
        options: { Default: 'Default' },
      },
    ],
    metadata: {
      ...(row.wood_type ? { wood_type: row.wood_type } : {}),
      ...(row.warranty ? { warranty: row.warranty } : {}),
      ...(hasDimensions
        ? {
            dimensions: {
              width: row.width,
              depth: row.depth,
              height: row.height,
              unit: row.unit || 'cm',
            },
          }
        : {}),
    },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function ProductImportPage() {
  const [state, setState] = useState<ImportState>('idle')
  const [rows, setRows] = useState<CsvRow[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [parseError, setParseError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file.')
      return
    }
    setState('parsing')
    setParseError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const matrix = parseCsv(text)
      const parsed = rowsToCsvRows(matrix)
      if (parsed.length === 0) {
        setParseError('No data rows found. Check the CSV format.')
        setState('idle')
        return
      }
      setRows(parsed)
      setState('preview')
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleImport = async () => {
    setState('importing')
    const importResults: ImportResult[] = []
    for (const row of rows) {
      try {
        const payload = buildProductPayload(row)
        const res = await fetch('/admin/products', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const msg = (body as { message?: string }).message ?? `HTTP ${res.status}`
          importResults.push({ row, success: false, error: msg })
        } else {
          const body = (await res.json()) as { product?: { id?: string } }
          importResults.push({ row, success: true, productId: body.product?.id })
        }
      } catch (err) {
        importResults.push({
          row,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
    setResults(importResults)
    setState('done')
  }

  const handleDownloadTemplate = () => {
    const content = HEADERS.join(',') + '\n' + TEMPLATE_ROW
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'treasure-trove-products-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const successCount = results.filter((r) => r.success).length
  const errorCount = results.filter((r) => !r.success).length

  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-ui-fg-base text-2xl font-semibold">Bulk Import Products</h1>
          <p className="text-ui-fg-subtle text-sm mt-1">
            Upload a CSV file to create multiple products at once. Each row becomes one product with
            a single default variant.
          </p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-sm font-medium text-ui-fg-interactive border border-ui-border-base rounded-md px-3 py-2 hover:bg-ui-bg-base-hover transition-colors"
        >
          <ArrowDownTray className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Column Reference */}
      <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ui-border-base bg-ui-bg-subtle">
          <InformationCircle className="w-4 h-4 text-ui-fg-muted" />
          <span className="text-ui-fg-base text-sm font-medium">CSV Column Reference</span>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-y divide-ui-border-base text-sm">
          {HEADERS.map((h, i) => (
            <div
              key={h}
              className={`flex gap-3 px-4 py-2.5 ${i % 2 === 0 ? '' : 'bg-ui-bg-subtle/50'}`}
            >
              <span className="font-mono text-xs text-ui-fg-interactive min-w-[120px] pt-0.5">
                {h}
              </span>
              <span className="text-ui-fg-subtle">{COLUMN_DESCRIPTIONS[h]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      {(state === 'idle' || state === 'parsing') && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-8 py-14 cursor-pointer transition-colors ${
            dragOver
              ? 'border-ui-fg-interactive bg-ui-bg-interactive/10'
              : 'border-ui-border-base bg-ui-bg-subtle hover:border-ui-fg-interactive hover:bg-ui-bg-base'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-ui-bg-base border border-ui-border-base flex items-center justify-center">
            <ArrowUpTray className="w-5 h-5 text-ui-fg-muted" />
          </div>
          <div className="text-center">
            <p className="text-ui-fg-base text-sm font-medium">
              {state === 'parsing' ? 'Parsing…' : 'Drop your CSV here or click to browse'}
            </p>
            <p className="text-ui-fg-muted text-xs mt-1">.csv files only</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0])
            }}
          />
        </div>
      )}

      {parseError && (
        <p className="text-ui-fg-error text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {parseError}
        </p>
      )}

      {/* Preview */}
      {state === 'preview' && (
        <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border-base">
            <span className="text-ui-fg-base text-sm font-medium">
              Preview — {rows.length} product{rows.length !== 1 ? 's' : ''} to import
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRows([])
                  setState('idle')
                }}
                className="text-ui-fg-subtle text-sm hover:text-ui-fg-base transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="bg-ui-button-inverted text-ui-fg-on-inverted text-sm font-medium px-4 py-1.5 rounded-md hover:bg-ui-button-inverted-hover transition-colors"
              >
                Import {rows.length} products
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
                  {['Title', 'Handle', 'Status', 'SKU', 'Price (INR)', 'Wood Type'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-ui-fg-muted text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-base">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-ui-bg-subtle transition-colors">
                    <td className="px-4 py-3 text-ui-fg-base font-medium">{row.title || '—'}</td>
                    <td className="px-4 py-3 text-ui-fg-subtle font-mono text-xs">
                      {row.handle || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          row.status === 'published'
                            ? 'bg-ui-tag-green-bg text-ui-tag-green-text'
                            : row.status === 'archived'
                              ? 'bg-ui-tag-red-bg text-ui-tag-red-text'
                              : 'bg-ui-tag-neutral-bg text-ui-tag-neutral-text'
                        }`}
                      >
                        {row.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ui-fg-subtle font-mono text-xs">
                      {row.sku || '—'}
                    </td>
                    <td className="px-4 py-3 text-ui-fg-base">
                      {row.price_inr
                        ? `₹${parseInt(row.price_inr, 10).toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-ui-fg-subtle">{row.wood_type || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Importing progress */}
      {state === 'importing' && (
        <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-6 flex items-center gap-4">
          <div className="w-5 h-5 border-2 border-ui-fg-interactive border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-ui-fg-base text-sm font-medium">Importing products…</p>
            <p className="text-ui-fg-subtle text-xs mt-0.5">Do not close this page.</p>
          </div>
        </div>
      )}

      {/* Results */}
      {state === 'done' && (
        <div className="flex flex-col gap-4">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {successCount > 0 && (
                <div className="flex items-center gap-2 text-ui-tag-green-text">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{successCount} imported</span>
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-center gap-2 text-ui-tag-red-text">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{errorCount} failed</span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setRows([])
                setResults([])
                setState('idle')
              }}
              className="text-ui-fg-interactive text-sm font-medium hover:underline"
            >
              Import another file
            </button>
          </div>

          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
                  {['Product', 'Status', 'Detail'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-ui-fg-muted text-xs font-medium uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-base">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-ui-bg-subtle transition-colors">
                    <td className="px-4 py-3 text-ui-fg-base font-medium">{r.row.title}</td>
                    <td className="px-4 py-3">
                      {r.success ? (
                        <span className="flex items-center gap-1 text-ui-tag-green-text text-xs font-medium">
                          <CheckCircle className="w-4 h-4" /> Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-ui-tag-red-text text-xs font-medium">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ui-fg-subtle text-xs font-mono">
                      {r.success ? r.productId : r.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: 'Import CSV',
})

export default ProductImportPage
