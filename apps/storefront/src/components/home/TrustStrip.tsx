import { Truck, RotateCcw, Lock, Banknote, type LucideIcon } from 'lucide-react'
import type { TrustBadge } from '@/lib/payload'

const ICONS: Record<TrustBadge['icon'], LucideIcon> = {
  truck: Truck,
  returns: RotateCcw,
  lock: Lock,
  cod: Banknote,
}

interface TrustStripProps {
  badges: TrustBadge[]
}

export function TrustStrip({ badges }: TrustStripProps) {
  if (badges.length === 0) return null

  return (
    <section aria-label="Trust signals" style={{ backgroundColor: '#F2ECDD' }}>
      {/* Desktop — single row */}
      <div className="tt-stagger hidden lg:flex items-center justify-center h-16 gap-12 px-8">
        {badges.map(({ icon, label, sub }, i) => {
          const Icon = ICONS[icon]
          return (
            <div
              key={label}
              className="flex items-center gap-2.5"
              style={{ '--i': i } as React.CSSProperties}
            >
              <Icon size={22} className="text-[var(--color-tt-orange)] shrink-0" />
              <div>
                <span className="text-[var(--color-tt-ink)] text-sm font-bold">{label}</span>
                {sub && (
                  <span className="text-[var(--color-tt-ink-muted)] text-sm ml-1">{sub}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile — 2×2 grid */}
      <div className="lg:hidden py-5 mx-4 rounded-lg">
        <div className="tt-stagger grid grid-cols-2 gap-4">
          {badges.map(({ icon, label, sub }, i) => {
            const Icon = ICONS[icon]
            return (
              <div
                key={label}
                className="flex items-start gap-2.5"
                style={{ '--i': i } as React.CSSProperties}
              >
                <Icon size={20} className="text-[var(--color-tt-orange)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[var(--color-tt-ink)] text-sm font-bold leading-tight">
                    {label}
                  </p>
                  {sub && (
                    <p className="text-[var(--color-tt-ink-muted)] text-[13px] leading-tight mt-0.5">
                      {sub}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
