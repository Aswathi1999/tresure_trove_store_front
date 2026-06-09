'use client'
import { useEffect, useState } from 'react'

export function useCyclingWord(words: string[], intervalMs = 2200, active = true): string {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), intervalMs)
    return () => clearInterval(id)
  }, [words.length, intervalMs, active])
  return words[idx] ?? ''
}

export const SEARCH_CYCLE_WORDS = [
  'Decor',
  'Accessories',
  'Lamps',
  'Planters',
  'Kitchen',
  'Bed & Bath',
  'Glassware',
  'Tableware',
  'Lighting',
  'Artificial Plants',
]

export const OFFER_MESSAGES = [
  'Up to 40% Off Festive Edit',
  'Free Shipping on Orders Above ₹999',
  '7-Day Easy Returns',
  'Secure Payments · COD Available',
  'New Arrivals Every Week',
]

interface CyclingPlaceholderProps {
  prefix?: string
  words?: string[]
  intervalMs?: number
  className?: string
}

export function CyclingPlaceholder({
  prefix = 'Search',
  words = SEARCH_CYCLE_WORDS,
  intervalMs = 2200,
  className = '',
}: CyclingPlaceholderProps): React.JSX.Element {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), intervalMs)
    return () => clearInterval(id)
  }, [words.length, intervalMs])

  return (
    <span className={`inline-flex items-baseline gap-[0.35em] overflow-hidden ${className}`}>
      <span className="shrink-0">{prefix}</span>
      <span key={words[idx]} className="tt-cycle-word">
        {words[idx]}
      </span>
    </span>
  )
}
