import { useState, useEffect } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps } from '@medusajs/framework/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminInventoryItem = {
  id: string
  sku?: string | null
  title?: string | null
  stocked_quantity?: number | null
  reserved_quantity?: number | null
  available_quantity?: number | null
  metadata?: Record<string, unknown> | null
}

type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock'

// ─── Brand palette (Treasure Trove UI reference) ─────────────────────────────
// primary: #695e31 | orange: #B45A3C | gold: #D5C68F | cream: #FAF6EE

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; bg: string; text: string; border: string; bar: string; dot: string }
> = {
  out_of_stock: {
    label: 'Out of Stock',
    bg: '#ffdad6',
    text: '#93000a',
    border: '#ffb4ab',
    bar: '#ba1a1a',
    dot: '#ba1a1a',
  },
  low_stock: {
    label: 'Low Stock',
    bg: '#ffeee8',
    text: '#8c3a22',
    border: '#fed4c6',
    bar: '#B45A3C',
    dot: '#B45A3C',
  },
  in_stock: {
    label: 'In Stock',
    bg: '#e6f4ed',
    text: '#2d5c46',
    border: '#bfcc99',
    bar: '#3d7a5e',
    dot: '#3d7a5e',
  },
}

const DEFAULT_THRESHOLD = 5

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(available: number, threshold: number): StockStatus {
  if (available <= 0) return 'out_of_stock'
  if (available <= threshold) return 'low_stock'
  return 'in_stock'
}

function getBarWidth(stocked: number, available: number): string {
  if (stocked <= 0) return '0%'
  const pct = Math.min(100, Math.round((available / stocked) * 100))
  return `${pct}%`
}

// ─── Widget ───────────────────────────────────────────────────────────────────

function InventoryAlertWidget({ data }: DetailWidgetProps<AdminInventoryItem>) {
  const item = data as AdminInventoryItem

  const stocked = item.stocked_quantity ?? 0
  const reserved = item.reserved_quantity ?? 0
  const available = item.available_quantity ?? Math.max(0, stocked - reserved)

  const savedThreshold =
    typeof item.metadata?.low_stock_threshold === 'number'
      ? (item.metadata.low_stock_threshold as number)
      : DEFAULT_THRESHOLD

  const [threshold, setThreshold] = useState(savedThreshold)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    setThreshold(savedThreshold)
  }, [savedThreshold])

  const status = getStatus(available, threshold)
  const cfg = STATUS_CONFIG[status]
  const barW = getBarWidth(stocked, available)

  async function handleSaveThreshold() {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch(`/admin/inventory-items/${item.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            ...(item.metadata ?? {}),
            low_stock_threshold: threshold,
          },
        }),
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
      className="rounded-lg border overflow-hidden shadow-elevation-card-rest"
      style={{ background: '#ffffff', borderColor: '#cdc6b7' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{
          background: 'linear-gradient(to right, #fff8f3, #fdf6f0)',
          borderColor: '#cdc6b7',
        }}
      >
        <div>
          <h2
            className="text-sm font-bold uppercase"
            style={{ letterSpacing: '0.10em', color: '#1F1B16' }}
          >
            Stock Alert
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
            {item.sku ? `SKU: ${item.sku}` : 'Low stock monitoring'}
          </p>
        </div>

        {/* Status badge */}
        <span
          data-testid="stock-status-badge"
          className="text-[11px] font-bold uppercase px-3 py-1 rounded-full border"
          style={{
            background: cfg.bg,
            color: cfg.text,
            borderColor: cfg.border,
            letterSpacing: '0.08em',
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
            style={{ background: cfg.dot }}
          />
          {cfg.label}
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Stock levels ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Stocked', value: stocked, color: '#695e31' },
            { label: 'Reserved', value: reserved, color: '#B45A3C' },
            { label: 'Available', value: available, color: cfg.dot },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-md p-3 text-center border"
              style={{ background: '#fff8f3', borderColor: '#ebe1d7' }}
            >
              <p className="text-xl font-bold" style={{ color }}>
                {value}
              </p>
              <p
                className="text-[10px] font-semibold uppercase mt-0.5"
                style={{ letterSpacing: '0.08em', color: '#7c7768' }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Stock bar ────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ letterSpacing: '0.08em', color: '#4A443D' }}
            >
              Available vs Stocked
            </span>
            <span className="text-[11px]" style={{ color: '#7c7768' }}>
              {stocked > 0 ? `${Math.round((available / stocked) * 100)}%` : '0%'}
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '6px', background: '#ebe1d7' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: barW, background: cfg.bar }}
            />
          </div>
        </div>

        {/* ── Threshold ────────────────────────────────────────────── */}
        <div
          className="rounded-md border p-4"
          style={{ background: '#fff8f3', borderColor: '#cdc6b7' }}
        >
          <label
            htmlFor="tt-stock-threshold"
            className="block text-[11px] font-bold uppercase mb-2"
            style={{ letterSpacing: '0.10em', color: '#76574d' }}
          >
            Low Stock Threshold
          </label>
          <p className="text-[11px] mb-3" style={{ color: '#4A443D' }}>
            Show amber warning when available stock falls to or below this number.
          </p>
          <div className="flex items-center gap-3">
            <input
              id="tt-stock-threshold"
              data-testid="low-stock-threshold-input"
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-24 border rounded-md px-3 py-2 text-sm font-semibold outline-none transition-colors"
              style={{
                borderColor: '#cdc6b7',
                background: '#ffffff',
                color: '#1F1B16',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#695e31'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cdc6b7'
              }}
            />
            <span className="text-[12px]" style={{ color: '#7c7768' }}>
              units
            </span>

            <button
              data-testid="save-threshold-btn"
              onClick={handleSaveThreshold}
              disabled={saving || threshold === savedThreshold}
              className="ml-auto text-[11px] font-bold uppercase px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#695e31',
                color: '#ffffff',
                letterSpacing: '0.08em',
              }}
              onMouseEnter={(e) => {
                if (!saving && threshold !== savedThreshold)
                  (e.currentTarget as HTMLButtonElement).style.background = '#50461b'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = '#695e31'
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          {saveStatus === 'saved' && (
            <p className="text-[11px] mt-2 font-medium" style={{ color: '#3d7a5e' }}>
              Threshold updated.
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-[11px] mt-2 font-medium text-ui-fg-error">
              Failed to save. Try again.
            </p>
          )}
        </div>

        {/* ── Alert message ─────────────────────────────────────────── */}
        {status !== 'in_stock' && (
          <div
            className="rounded-md border px-4 py-3 flex items-start gap-3"
            style={{ background: cfg.bg, borderColor: cfg.border }}
          >
            <span className="text-lg mt-0.5 flex-shrink-0" style={{ color: cfg.dot }}>
              {status === 'out_of_stock' ? '⊘' : '⚠'}
            </span>
            <p className="text-[12px] leading-relaxed" style={{ color: cfg.text }}>
              {status === 'out_of_stock'
                ? `This variant has no available stock. Restock immediately to avoid lost sales.`
                : `Only ${available} unit${available !== 1 ? 's' : ''} available — at or below the threshold of ${threshold}. Consider restocking soon.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'inventory_item.details.side.before',
})

export default InventoryAlertWidget
