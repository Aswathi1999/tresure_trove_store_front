import { Leaf } from 'lucide-react'

interface SustainabilityRatingProps {
  rating: number
  showLabel?: boolean
}

export function SustainabilityRating({ rating, showLabel = false }: SustainabilityRatingProps) {
  return (
    <div data-testid="sustainability-rating" className="flex items-center gap-1.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Leaf
          key={i}
          size={14}
          strokeWidth={1.5}
          fill={i < rating ? 'currentColor' : 'none'}
          data-testid={`leaf-${i + 1}`}
          className={
            i < rating ? 'text-[var(--color-tt-brown)]' : 'text-[var(--color-tt-outline-variant)]'
          }
        />
      ))}
      {showLabel && (
        <span className="ml-1 text-[11px] text-[var(--color-tt-outline)] uppercase tracking-widest">
          {rating}/5 Sustainability
        </span>
      )}
    </div>
  )
}
