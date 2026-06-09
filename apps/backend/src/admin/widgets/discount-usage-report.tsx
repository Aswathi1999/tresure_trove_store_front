import { useState, useEffect } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationMethod = {
  type: 'percentage' | 'fixed'
  value: number
  currency_code?: string
}

type Promotion = {
  id: string
  code: string
  usage_count?: number
  is_automatic?: boolean
  status?: string
  application_method?: ApplicationMethod
}

type GiftCard = {
  id: string
  code: string
  value: number
  balance: number
  currency_code?: string
  is_disabled?: boolean
}

type ReportData = {
  topCodes: Promotion[]
  totalRedemptions: number
  totalDiscountPaise: number
  giftCardLiability: number
  giftCardCount: number
  loaded: boolean
  error: string
}

// ─── Brand palette ────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    key: 'redemptions',
    label: 'Total Redemptions',
    icon: '◎',
    bg: '#f2e2a9',
    text: '#50461b',
    border: '#D5C68F',
    icon_color: '#695e31',
  },
  {
    key: 'discount',
    label: 'Discount Distributed',
    icon: '₹',
    bg: '#ffeee8',
    text: '#8c3a22',
    border: '#fed4c6',
    icon_color: '#B45A3C',
  },
  {
    key: 'giftcard',
    label: 'Gift Card Liability',
    icon: '◈',
    bg: '#e6f4ed',
    text: '#2d5c46',
    border: '#bfcc99',
    icon_color: '#3d7a5e',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(amount: number): string {
  // Medusa v2 stores prices/discounts in the major unit (rupees), not paise —
  // so format the amount directly without dividing.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusStyle(status?: string): { bg: string; text: string; border: string } {
  if (status === 'active') return { bg: '#e6f4ed', text: '#2d5c46', border: '#bfcc99' }
  if (status === 'expired') return { bg: '#ffdad6', text: '#93000a', border: '#ffb4ab' }
  if (status === 'disabled') return { bg: '#ffdad6', text: '#93000a', border: '#ffb4ab' }
  return { bg: '#f7ece2', text: '#4A443D', border: '#cdc6b7' }
}

// ─── Widget ───────────────────────────────────────────────────────────────────

function DiscountUsageReportWidget() {
  const [report, setReport] = useState<ReportData>({
    topCodes: [],
    totalRedemptions: 0,
    totalDiscountPaise: 0,
    giftCardLiability: 0,
    giftCardCount: 0,
    loaded: false,
    error: '',
  })

  useEffect(() => {
    let live = true

    async function fetchReport() {
      try {
        const [promoRes, giftRes] = await Promise.all([
          fetch('/admin/promotions?limit=100', { credentials: 'include' }),
          fetch('/admin/gift-cards?limit=100', { credentials: 'include' }),
        ])

        const promoBody = promoRes.ok
          ? ((await promoRes.json()) as { promotions?: Promotion[] })
          : { promotions: [] }

        const giftBody = giftRes.ok
          ? ((await giftRes.json()) as { gift_cards?: GiftCard[] })
          : { gift_cards: [] }

        const promotions = promoBody.promotions ?? []
        const giftCards = giftBody.gift_cards ?? []

        const topCodes = [...promotions]
          .sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0))
          .slice(0, 10)

        const totalRedemptions = promotions.reduce((s, p) => s + (p.usage_count ?? 0), 0)

        const totalDiscountPaise = promotions.reduce((s, p) => {
          const method = p.application_method
          if (!method || method.type !== 'fixed') return s
          return s + (method.value ?? 0) * (p.usage_count ?? 0)
        }, 0)

        const giftCardLiability = giftCards
          .filter((g) => !g.is_disabled)
          .reduce((s, g) => s + (g.balance ?? 0), 0)

        if (live) {
          setReport({
            topCodes,
            totalRedemptions,
            totalDiscountPaise,
            giftCardLiability,
            giftCardCount: giftCards.filter((g) => !g.is_disabled).length,
            loaded: true,
            error: '',
          })
        }
      } catch (err) {
        if (live) {
          setReport((prev) => ({
            ...prev,
            loaded: true,
            error: err instanceof Error ? err.message : 'Failed to load report.',
          }))
        }
      }
    }

    fetchReport()
    return () => {
      live = false
    }
  }, [])

  const statValues = [
    report.totalRedemptions.toString(),
    fmtINR(report.totalDiscountPaise),
    fmtINR(report.giftCardLiability),
  ]

  return (
    <div
      className="rounded-lg border overflow-hidden shadow-elevation-card-rest mb-6"
      style={{ background: '#ffffff', borderColor: '#cdc6b7' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
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
            Discount Usage Report
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
            Live redemption data across all promotions and gift cards
          </p>
        </div>
        {!report.loaded && (
          <div
            className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#695e31', borderTopColor: 'transparent' }}
          />
        )}
      </div>

      <div className="px-6 py-5 space-y-5">
        {report.error && <p className="text-ui-fg-error text-sm">{report.error}</p>}

        {/* ── Stat cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {STAT_CARDS.map((card, i) => (
            <div
              key={card.key}
              className="rounded-md border p-4 flex flex-col gap-1"
              style={{ background: card.bg, borderColor: card.border }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold" style={{ color: card.icon_color }}>
                  {card.icon}
                </span>
                <p
                  className="text-[10px] font-bold uppercase"
                  style={{ letterSpacing: '0.10em', color: card.text }}
                >
                  {card.label}
                </p>
              </div>
              <p className="text-xl font-bold" style={{ color: card.text }}>
                {report.loaded ? statValues[i] : '—'}
              </p>
              {card.key === 'giftcard' && report.loaded && (
                <p className="text-[11px]" style={{ color: card.text, opacity: 0.75 }}>
                  {report.giftCardCount} active card{report.giftCardCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Top 10 codes table ───────────────────────────────────── */}
        <div>
          <p
            className="text-[11px] font-bold uppercase mb-3"
            style={{ letterSpacing: '0.10em', color: '#76574d' }}
          >
            Top Codes by Redemptions
          </p>

          {!report.loaded ? (
            <p className="text-[12px]" style={{ color: '#7c7768' }}>
              Loading…
            </p>
          ) : report.topCodes.length === 0 ? (
            <p className="text-[12px]" style={{ color: '#7c7768' }}>
              No promotion codes found. Create your first code in the Promotions section.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden" style={{ borderColor: '#cdc6b7' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#fff8f3', borderBottom: '1px solid #cdc6b7' }}>
                    {['#', 'Code', 'Type', 'Value', 'Redemptions', 'Status'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-[10px] font-bold uppercase"
                        style={{ letterSpacing: '0.08em', color: '#76574d' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.topCodes.map((promo, idx) => {
                    const method = promo.application_method
                    const typeLabel =
                      method?.type === 'percentage'
                        ? 'Percentage'
                        : method?.type === 'fixed'
                          ? 'Fixed Amount'
                          : 'Automatic'
                    const valueLabel =
                      method?.type === 'percentage'
                        ? `${method.value}%`
                        : method?.type === 'fixed'
                          ? fmtINR(method.value ?? 0)
                          : '—'
                    const sSty = statusStyle(promo.status)

                    return (
                      <tr
                        key={promo.id}
                        style={{
                          borderBottom:
                            idx < report.topCodes.length - 1 ? '1px solid #ebe1d7' : 'none',
                          background: idx % 2 === 0 ? '#ffffff' : '#fff8f3',
                        }}
                      >
                        <td className="px-4 py-3 text-[12px]" style={{ color: '#7c7768' }}>
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="font-mono text-[12px] font-bold px-2 py-0.5 rounded"
                            style={{ background: '#f2e2a9', color: '#50461b' }}
                          >
                            {promo.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px]" style={{ color: '#4A443D' }}>
                          {typeLabel}
                        </td>
                        <td
                          className="px-4 py-3 text-[12px] font-semibold"
                          style={{ color: '#695e31' }}
                        >
                          {valueLabel}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#f2e2a9', color: '#50461b' }}
                          >
                            {promo.usage_count ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                            style={{ ...sSty, letterSpacing: '0.06em' }}
                          >
                            {promo.status ?? 'active'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'promotion.list.before',
})

export default DiscountUsageReportWidget
