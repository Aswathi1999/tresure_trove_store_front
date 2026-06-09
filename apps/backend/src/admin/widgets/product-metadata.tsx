import { useState } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps } from '@medusajs/framework/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Dimensions = {
  width: string
  depth: string
  height: string
  unit: string
}

type ProductMetadata = {
  wood_type?: string
  dimensions?: Partial<Dimensions>
  warranty?: string
  [key: string]: unknown
}

type AdminProduct = {
  id: string
  metadata?: ProductMetadata | null
}

// ─── Widget ───────────────────────────────────────────────────────────────────

function ProductMetadataWidget({ data }: DetailWidgetProps<AdminProduct>) {
  const product = data as AdminProduct
  const meta = (product.metadata ?? {}) as ProductMetadata
  const dims = (meta.dimensions ?? {}) as Partial<Dimensions>

  const [woodType, setWoodType] = useState(meta.wood_type ?? '')
  const [warranty, setWarranty] = useState(meta.warranty ?? '')
  const [width, setWidth] = useState(dims.width ?? '')
  const [depth, setDepth] = useState(dims.depth ?? '')
  const [height, setHeight] = useState(dims.height ?? '')
  const [unit, setUnit] = useState(dims.unit ?? 'cm')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  async function handleSave() {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const hasDimensions = width || depth || height
      const updatedMetadata: ProductMetadata = {
        ...meta,
        ...(woodType ? { wood_type: woodType } : {}),
        ...(warranty ? { warranty } : {}),
        ...(hasDimensions ? { dimensions: { width, depth, height, unit } } : {}),
      }
      const res = await fetch(`/admin/products/${product.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      data-testid="product-metadata-widget"
      className="rounded-lg border overflow-hidden shadow-elevation-card-rest"
      style={{ background: '#ffffff', borderColor: '#cdc6b7' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{
          background: 'linear-gradient(to right, #fff8f3, #fdf6f0)',
          borderColor: '#cdc6b7',
        }}
      >
        <h2
          className="text-sm font-bold uppercase"
          style={{ letterSpacing: '0.10em', color: '#1F1B16' }}
        >
          Product Details
        </h2>
        <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
          Custom metadata for Treasure Trove products
        </p>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Wood Type */}
        <div className="space-y-1.5">
          <label
            htmlFor="meta-wood-type"
            className="block text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.10em', color: '#76574d' }}
          >
            Wood Type
          </label>
          <input
            id="meta-wood-type"
            data-testid="wood-type-input"
            type="text"
            value={woodType}
            onChange={(e) => setWoodType(e.target.value)}
            placeholder="e.g. Teak, Walnut, Oak"
            className="w-full border rounded-md px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#cdc6b7', background: '#ffffff', color: '#1F1B16' }}
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-1.5">
          <p
            className="text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.10em', color: '#76574d' }}
          >
            Dimensions
          </p>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label
                htmlFor="meta-dim-width"
                className="block text-[10px] mb-1"
                style={{ color: '#7c7768' }}
              >
                Width
              </label>
              <input
                id="meta-dim-width"
                data-testid="dim-width-input"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="0"
                className="w-full border rounded-md px-2 py-2 text-sm outline-none"
                style={{ borderColor: '#cdc6b7', background: '#ffffff', color: '#1F1B16' }}
              />
            </div>
            <div>
              <label
                htmlFor="meta-dim-depth"
                className="block text-[10px] mb-1"
                style={{ color: '#7c7768' }}
              >
                Depth
              </label>
              <input
                id="meta-dim-depth"
                data-testid="dim-depth-input"
                type="number"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="0"
                className="w-full border rounded-md px-2 py-2 text-sm outline-none"
                style={{ borderColor: '#cdc6b7', background: '#ffffff', color: '#1F1B16' }}
              />
            </div>
            <div>
              <label
                htmlFor="meta-dim-height"
                className="block text-[10px] mb-1"
                style={{ color: '#7c7768' }}
              >
                Height
              </label>
              <input
                id="meta-dim-height"
                data-testid="dim-height-input"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0"
                className="w-full border rounded-md px-2 py-2 text-sm outline-none"
                style={{ borderColor: '#cdc6b7', background: '#ffffff', color: '#1F1B16' }}
              />
            </div>
            <div>
              <label
                htmlFor="meta-dim-unit"
                className="block text-[10px] mb-1"
                style={{ color: '#7c7768' }}
              >
                Unit
              </label>
              <select
                id="meta-dim-unit"
                data-testid="dim-unit-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border rounded-md px-2 py-2 text-sm outline-none"
                style={{ borderColor: '#cdc6b7', background: '#ffffff', color: '#1F1B16' }}
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
        </div>

        {/* Warranty */}
        <div className="space-y-1.5">
          <label
            htmlFor="meta-warranty"
            className="block text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.10em', color: '#76574d' }}
          >
            Warranty
          </label>
          <input
            id="meta-warranty"
            data-testid="warranty-input"
            type="text"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            placeholder="e.g. 5 years structural"
            className="w-full border rounded-md px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#cdc6b7', background: '#ffffff', color: '#1F1B16' }}
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            data-testid="save-metadata-btn"
            onClick={handleSave}
            disabled={saving}
            className="text-[11px] font-bold uppercase px-5 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#695e31', color: '#ffffff', letterSpacing: '0.08em' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          {saveStatus === 'saved' && (
            <p
              data-testid="save-success"
              className="text-[11px] font-medium"
              style={{ color: '#3d7a5e' }}
            >
              Saved successfully.
            </p>
          )}
          {saveStatus === 'error' && (
            <p data-testid="save-error" className="text-[11px] font-medium text-ui-fg-error">
              Failed to save. Try again.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.details.side.before',
})

export default ProductMetadataWidget
