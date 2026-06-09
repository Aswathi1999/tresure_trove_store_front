import { useState } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps } from '@medusajs/framework/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type CustomerGroup = { id: string; name: string }

type AdminCustomer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  has_account?: boolean
  groups?: CustomerGroup[]
  metadata?: Record<string, unknown> | null
}

type GroupTier = 'trade' | 'retail' | 'none'

// ─── Brand palette (Treasure Trove UI reference) ─────────────────────────────
// primary gold: #695e31 | gold accent: #D5C68F | cream: #FAF6EE | orange: #B45A3C

const TIER_CONFIG: Record<
  GroupTier,
  {
    label: string
    bg: string
    text: string
    border: string
    dot: string
    icon: string
    desc: string
  }
> = {
  trade: {
    label: 'Trade',
    bg: '#f2e2a9',
    text: '#50461b',
    border: '#D5C68F',
    dot: '#695e31',
    icon: '★',
    desc: 'Interior designer / architect — eligible for trade pricing.',
  },
  retail: {
    label: 'Retail',
    bg: '#dbeafe',
    text: '#1e3a8a',
    border: '#93c5fd',
    dot: '#2563eb',
    icon: '◈',
    desc: 'Standard retail customer.',
  },
  none: {
    label: 'No Group',
    bg: '#f7ece2',
    text: '#4A443D',
    border: '#cdc6b7',
    dot: '#AB877B',
    icon: '○',
    desc: 'Customer is not assigned to any group.',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectTier(groups: CustomerGroup[]): GroupTier {
  const names = groups.map((g) => g.name.toLowerCase())
  if (names.some((n) => n.includes('trade'))) return 'trade'
  if (names.some((n) => n.includes('retail'))) return 'retail'
  return 'none'
}

// ─── Widget ───────────────────────────────────────────────────────────────────

function CustomerGroupBadgeWidget({ data }: DetailWidgetProps<AdminCustomer>) {
  const customer = data as AdminCustomer
  const groups = customer.groups ?? []
  const tier = detectTier(groups)
  const cfg = TIER_CONFIG[tier]

  const [showConfirm, setShowConfirm] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [deactivateStatus, setDeactivateStatus] = useState<'idle' | 'done' | 'error'>('idle')

  const isInactive = customer.has_account === false || deactivateStatus === 'done'
  const fullName =
    [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email

  async function handleDeactivate() {
    setDeactivating(true)
    setDeactivateStatus('idle')
    try {
      const res = await fetch(`/admin/customers/${customer.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ has_account: false }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDeactivateStatus('done')
      setShowConfirm(false)
    } catch {
      setDeactivateStatus('error')
    } finally {
      setDeactivating(false)
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
            Customer Group
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
            {fullName}
          </p>
        </div>

        <span
          data-testid="customer-group-badge"
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full border"
          style={{
            background: cfg.bg,
            color: cfg.text,
            borderColor: cfg.border,
            letterSpacing: '0.08em',
          }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* ── Tier description ─────────────────────────────────────── */}
        <div
          className="rounded-md border px-4 py-3 flex items-start gap-3"
          style={{ background: cfg.bg, borderColor: cfg.border }}
        >
          <span className="text-base flex-shrink-0 mt-0.5" style={{ color: cfg.dot }}>
            {cfg.icon}
          </span>
          <p className="text-[12px] leading-relaxed" style={{ color: cfg.text }}>
            {cfg.desc}
          </p>
        </div>

        {/* ── Assigned groups ───────────────────────────────────────── */}
        <div>
          <p
            className="text-[11px] font-bold uppercase mb-2"
            style={{ letterSpacing: '0.10em', color: '#76574d' }}
          >
            Assigned Groups
          </p>
          {groups.length === 0 ? (
            <p className="text-[12px]" style={{ color: '#7c7768' }}>
              No groups assigned.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const gCfg = TIER_CONFIG[detectTier([g])]
                return (
                  <span
                    key={g.id}
                    data-testid={`group-tag-${g.id}`}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded border"
                    style={{ background: gCfg.bg, color: gCfg.text, borderColor: gCfg.border }}
                  >
                    {g.name}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Account status ───────────────────────────────────────── */}
        <div
          className="rounded-md border p-4 space-y-3"
          style={{ background: '#fff8f3', borderColor: '#cdc6b7' }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: '0.10em', color: '#76574d' }}
            >
              Account Status
            </p>
            <span
              data-testid="account-status-badge"
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
              style={
                isInactive
                  ? { background: '#ffdad6', color: '#93000a', borderColor: '#ffb4ab' }
                  : { background: '#e6f4ed', color: '#2d5c46', borderColor: '#bfcc99' }
              }
            >
              {isInactive ? 'Inactive' : 'Active'}
            </span>
          </div>

          <p className="text-[11px]" style={{ color: '#4A443D' }}>
            Deactivating removes the customer's ability to log in. Orders are preserved.
          </p>

          {!showConfirm ? (
            <button
              data-testid="deactivate-account-btn"
              onClick={() => setShowConfirm(true)}
              disabled={isInactive}
              className="text-[11px] font-bold uppercase px-3 py-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'transparent',
                color: '#93000a',
                borderColor: '#ffb4ab',
                letterSpacing: '0.08em',
              }}
            >
              Deactivate Account
            </button>
          ) : (
            <div
              className="rounded-md border p-3 space-y-2"
              style={{ background: '#ffdad6', borderColor: '#ffb4ab' }}
            >
              <p className="text-[12px] font-semibold" style={{ color: '#93000a' }}>
                Are you sure? This will prevent the customer from logging in.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="text-[11px] font-bold uppercase px-3 py-1.5 rounded disabled:opacity-50"
                  style={{ background: '#ba1a1a', color: '#ffffff', letterSpacing: '0.08em' }}
                >
                  {deactivating ? 'Deactivating…' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-[11px] font-bold uppercase px-3 py-1.5 rounded border"
                  style={{
                    background: '#ffffff',
                    color: '#4A443D',
                    borderColor: '#cdc6b7',
                    letterSpacing: '0.08em',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deactivateStatus === 'done' && (
            <p className="text-[11px] font-medium" style={{ color: '#3d7a5e' }}>
              Account deactivated successfully.
            </p>
          )}
          {deactivateStatus === 'error' && (
            <p className="text-[11px] font-medium text-ui-fg-error">
              Failed to deactivate. Try again.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'customer.details.side.before',
})

export default CustomerGroupBadgeWidget
