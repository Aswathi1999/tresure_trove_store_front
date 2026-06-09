'use client'

interface MarqueeBarProps {
  items: string[]
}

export function MarqueeBar({ items }: MarqueeBarProps) {
  if (items.length === 0) return null
  // Duplicate the sequence so the -50% transform loops seamlessly.
  const sequence = [...items, ...items]

  return (
    <div
      data-testid="marquee-container"
      className="bg-[var(--color-tt-ink)] overflow-hidden py-3 group"
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 45s linear infinite;
          display: flex;
          align-items: center;
          width: max-content;
        }
        .marquee-track:hover,
        .group:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-track">
        {sequence.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center whitespace-nowrap text-[var(--color-tt-gold)] text-xs font-bold uppercase"
            style={{ letterSpacing: '0.22em' }}
          >
            {item}
            <span
              aria-hidden="true"
              className="px-10 lg:px-14 text-[var(--color-tt-gold)]/60 text-sm font-normal"
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
