import { useState, useEffect } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps, AdminOrder } from '@medusajs/framework/types'

// ─── Extended API types ───────────────────────────────────────────────────────

type OrderPayment = { id: string; captured_at?: string | null }
type OrderPaymentCollection = { id: string; payments?: OrderPayment[] }
type OrderFulfillment = {
  id: string
  created_at: string
  shipped_at?: string | null
  delivered_at?: string | null
}
type OrderWithRelations = AdminOrder & {
  canceled_at?: string | null
  payment_collections?: OrderPaymentCollection[]
  fulfillments?: OrderFulfillment[]
}

type AdminNote = {
  id: string
  value: string
  created_at: string
  author?: { first_name?: string; last_name?: string; email?: string }
}

// ─── Timeline types ───────────────────────────────────────────────────────────

type EventType =
  | 'order_placed'
  | 'payment_captured'
  | 'fulfillment_created'
  | 'shipped'
  | 'delivered'
  | 'note'
  | 'cancelled'

type TimelineEvent = {
  id: string
  type: EventType
  label: string
  timestamp: string
  body?: string
  actor?: string
}

// ─── Brand-aligned colours (Treasure Trove palette from UI reference) ─────────
// primary: #695e31 | orange: #B45A3C | gold: #D5C68F | terracotta: #76574d

const EVENT_CONFIG: Record<EventType, { dot: string; ring: string; label: string; badge: string }> =
  {
    order_placed: {
      dot: 'bg-[#695e31]',
      ring: 'ring-[#D5C68F]',
      label: 'text-[#695e31]',
      badge: 'bg-[#f2e2a9] text-[#50461b]',
    },
    payment_captured: {
      dot: 'bg-[#3d7a5e]',
      ring: 'ring-[#bfcc99]',
      label: 'text-[#3d7a5e]',
      badge: 'bg-[#e6f4ed] text-[#2d5c46]',
    },
    fulfillment_created: {
      dot: 'bg-[#B45A3C]',
      ring: 'ring-[#fed4c6]',
      label: 'text-[#B45A3C]',
      badge: 'bg-[#ffeee8] text-[#8c3a22]',
    },
    shipped: {
      dot: 'bg-[#50461b]',
      ring: 'ring-[#D5C68F]',
      label: 'text-[#50461b]',
      badge: 'bg-[#f2e2a9] text-[#3a3210]',
    },
    delivered: {
      dot: 'bg-[#3d7a5e]',
      ring: 'ring-[#bfcc99]',
      label: 'text-[#3d7a5e]',
      badge: 'bg-[#e6f4ed] text-[#2d5c46]',
    },
    note: {
      dot: 'bg-[#AB877B]',
      ring: 'ring-[#ebe1d7]',
      label: 'text-[#76574d]',
      badge: 'bg-[#f7ece2] text-[#5d4036]',
    },
    cancelled: {
      dot: 'bg-ui-tag-red-icon',
      ring: 'ring-ui-tag-red-border',
      label: 'text-ui-tag-red-text',
      badge: 'bg-ui-tag-red-bg text-ui-tag-red-text',
    },
  }

const EVENT_LABELS: Record<EventType, string> = {
  order_placed: 'Order Placed',
  payment_captured: 'Payment Captured',
  fulfillment_created: 'Fulfillment Created',
  shipped: 'Order Shipped',
  delivered: 'Order Delivered',
  note: 'Note Added',
  cancelled: 'Order Cancelled',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function deriveEvents(order: OrderWithRelations): TimelineEvent[] {
  const ev: TimelineEvent[] = []

  ev.push({
    id: 'placed',
    type: 'order_placed',
    label: EVENT_LABELS.order_placed,
    timestamp: order.created_at,
  })

  for (const pc of order.payment_collections ?? []) {
    for (const p of pc.payments ?? []) {
      if (p.captured_at) {
        ev.push({
          id: `pay_${p.id}`,
          type: 'payment_captured',
          label: EVENT_LABELS.payment_captured,
          timestamp: p.captured_at,
        })
      }
    }
  }

  for (const f of order.fulfillments ?? []) {
    ev.push({
      id: `ful_${f.id}`,
      type: 'fulfillment_created',
      label: EVENT_LABELS.fulfillment_created,
      timestamp: f.created_at,
    })
    if (f.shipped_at)
      ev.push({
        id: `ship_${f.id}`,
        type: 'shipped',
        label: EVENT_LABELS.shipped,
        timestamp: f.shipped_at,
      })
    if (f.delivered_at)
      ev.push({
        id: `dlv_${f.id}`,
        type: 'delivered',
        label: EVENT_LABELS.delivered,
        timestamp: f.delivered_at,
      })
  }

  if (order.canceled_at) {
    ev.push({
      id: 'cancelled',
      type: 'cancelled',
      label: EVENT_LABELS.cancelled,
      timestamp: order.canceled_at,
    })
  }

  return ev
}

function sortByTime(events: TimelineEvent[]) {
  return [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )
}

// ─── Widget ───────────────────────────────────────────────────────────────────

function OrderTimelineWidget({ data }: DetailWidgetProps<AdminOrder>) {
  const order = data as OrderWithRelations

  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [noteInput, setNoteInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [noteError, setNoteError] = useState('')

  useEffect(() => {
    let live = true

    async function load() {
      setLoading(true)
      const base = deriveEvents(order)

      let noteEvents: TimelineEvent[] = []
      try {
        const res = await fetch(
          `/admin/notes?resource_type=order&resource_id=${order.id}&limit=50`,
          { credentials: 'include' },
        )
        if (res.ok) {
          const body = (await res.json()) as { notes?: AdminNote[] }
          noteEvents = (body.notes ?? []).map((n) => {
            const who = n.author
              ? [n.author.first_name, n.author.last_name].filter(Boolean).join(' ') ||
                n.author.email ||
                'Admin'
              : 'Admin'
            return {
              id: `note_${n.id}`,
              type: 'note' as EventType,
              label: EVENT_LABELS.note,
              timestamp: n.created_at,
              body: n.value,
              actor: who,
            }
          })
        }
      } catch {
        /* notes unavailable — continue */
      }

      if (live) {
        setEvents(sortByTime([...base, ...noteEvents]))
        setLoading(false)
      }
    }

    load()
    return () => {
      live = false
    }
  }, [order.id, order.updated_at])

  async function handleAddNote() {
    if (!noteInput.trim()) return
    setSubmitting(true)
    setNoteError('')
    try {
      const res = await fetch('/admin/notes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: order.id,
          resource_type: 'order',
          value: noteInput.trim(),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = (await res.json()) as { note?: AdminNote }
      if (body.note) {
        const n = body.note
        const newEv: TimelineEvent = {
          id: `note_${n.id}`,
          type: 'note',
          label: EVENT_LABELS.note,
          timestamp: n.created_at,
          body: n.value,
          actor: 'Admin',
        }
        setEvents((prev) => sortByTime([...prev, newEv]))
        setNoteInput('')
      }
    } catch {
      setNoteError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-elevation-card-rest overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-ui-border-base"
        style={{ background: 'linear-gradient(to right, #fff8f3, #fdf6f0)' }}
      >
        <div>
          <h2
            className="text-ui-fg-base text-sm font-bold uppercase tracking-widest"
            style={{ letterSpacing: '0.10em', color: '#1F1B16' }}
          >
            Order Timeline
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
            Status history &amp; internal notes
          </p>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
          style={{ background: '#f2e2a9', color: '#50461b', borderColor: '#D5C68F' }}
        >
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────── */}
      <div className="px-5 py-5">
        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#695e31', borderTopColor: 'transparent' }}
            />
            <span className="text-[12px]" style={{ color: '#4A443D' }}>
              Loading timeline…
            </span>
          </div>
        ) : events.length === 0 ? (
          <p className="text-[12px] py-8 text-center" style={{ color: '#7c7768' }}>
            No events recorded yet.
          </p>
        ) : (
          <ol>
            {events.map((ev, idx) => {
              const cfg = EVENT_CONFIG[ev.type]
              const isLast = idx === events.length - 1
              return (
                <li key={ev.id} className="flex gap-3.5 relative">
                  {/* Connector line */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div
                      className={`w-3 h-3 rounded-full ring-2 ring-offset-1 flex-shrink-0 ${cfg.dot} ${cfg.ring}`}
                    />
                    {!isLast && (
                      <div
                        className="w-px flex-1 mt-1.5"
                        style={{ background: '#cdc6b7', minHeight: '20px' }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-5'}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-bold uppercase ${cfg.label}`}
                        style={{ letterSpacing: '0.08em' }}
                      >
                        {ev.label}
                      </span>
                      <span
                        className="text-[11px] whitespace-nowrap flex-shrink-0"
                        style={{ color: '#7c7768' }}
                      >
                        {fmt(ev.timestamp)}
                      </span>
                    </div>

                    {ev.body && (
                      <p
                        className="mt-1.5 text-[12px] leading-relaxed rounded px-2.5 py-1.5 break-words border"
                        style={{ background: '#fdf6f0', borderColor: '#ebe1d7', color: '#4a473b' }}
                      >
                        {ev.body}
                      </p>
                    )}
                    {ev.actor && ev.type === 'note' && (
                      <p className="mt-1 text-[11px]" style={{ color: '#AB877B' }}>
                        — {ev.actor}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {/* ── Add Note ───────────────────────────────────────────────── */}
      <div
        className="px-5 pb-5 pt-3 border-t border-ui-border-base"
        style={{ borderColor: '#cdc6b7' }}
      >
        <p
          className="text-[11px] font-bold uppercase mb-2"
          style={{ letterSpacing: '0.10em', color: '#76574d' }}
        >
          Add Internal Note
        </p>
        <textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote()
          }}
          placeholder="Leave an internal note about this order…"
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors resize-none"
          style={{
            borderColor: '#cdc6b7',
            background: '#fff8f3',
            color: '#1f1b15',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#695e31'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#cdc6b7'
          }}
        />
        {noteError && <p className="text-ui-fg-error text-xs mt-1">{noteError}</p>}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px]" style={{ color: '#7c7768' }}>
            ⌘ Enter to save
          </span>
          <button
            onClick={handleAddNote}
            disabled={submitting || !noteInput.trim()}
            className="text-xs font-bold uppercase px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: '#695e31',
              color: '#ffffff',
              letterSpacing: '0.08em',
            }}
            onMouseEnter={(e) => {
              if (!submitting && noteInput.trim())
                (e.target as HTMLButtonElement).style.background = '#50461b'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.background = '#695e31'
            }}
          >
            {submitting ? 'Saving…' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'order.details.side.before',
})

export default OrderTimelineWidget
