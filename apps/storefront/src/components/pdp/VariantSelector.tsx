'use client'

import { useState, useMemo, useEffect } from 'react'
import { StockIndicator } from './StockIndicator'
import { AddToCartButton } from './AddToCartButton'
import { BuyNowButton } from './BuyNowButton'
import { formatPrice } from '@/lib/cart-types'
import { usePdpImage } from './PdpImageContext'

interface PdpVariant {
  id: string
  title: string
  /** Selected option values keyed by the option's display title (e.g. { Colour: 'Red', Size: 'M' }). */
  options: Record<string, string>
  price: number
  originalPrice?: number
  inventory: number
  available: boolean
  sku: string
  imageUrl?: string
  swatchColor?: string
}

/** One switchable option axis. `isSwatch` renders as colour swatches; otherwise pills. */
interface OptionAxis {
  title: string
  values: string[]
  isSwatch: boolean
}

// Common finish names → hex. Lets new products work with zero swatch metadata
// when their finish values match a well-known color name. Keys must be lower-case.
const COMMON_FINISH_COLORS: Record<string, string> = {
  white: '#f5f5f5',
  black: '#1a1a1a',
  red: '#b91c1c',
  green: '#15803d',
  blue: '#1d4ed8',
  yellow: '#eab308',
  orange: '#ea580c',
  silver: '#94a3b8',
  sliver: '#94a3b8',
  grey: '#6b7280',
  gray: '#6b7280',
  cream: '#f3eadb',
  beige: '#e7d8b1',
  brown: '#7c5a2b',
  walnut: '#5b3a1f',
  teak: '#9b6b3f',
  oak: '#c0a06b',
  mahogany: '#4a1f1a',
  gold: '#c8a35c',
  brass: '#b08d57',
  natural: '#d4a574',
}

interface VariantSelectorProps {
  variants: PdpVariant[]
  /** Every product option, in admin order. Each becomes its own switcher. */
  axes: OptionAxis[]
  /** Swatch-axis value → hex, from product metadata (finishColor_<value>). */
  swatchColors: Record<string, string>
  /** Swatch-axis value → image url, from product metadata (finishImage_<value>). */
  swatchImages?: Record<string, string>
  productTitle: string
  imageUrl: string
}

export function VariantSelector({
  variants,
  axes,
  swatchColors,
  swatchImages,
  productTitle,
  imageUrl,
}: VariantSelectorProps) {
  // Only axes that offer a real choice (≥2 values) are shown — a single-value
  // option (incl. Medusa's "Default") can't be switched, so it's hidden.
  const visibleAxes = useMemo(() => axes.filter((a) => a.values.length > 1), [axes])
  const swatchAxis = useMemo(() => visibleAxes.find((a) => a.isSwatch), [visibleAxes])
  const swatchImageMap = swatchImages ?? {}

  // Seed selection from the first AVAILABLE variant so the initial combo is
  // guaranteed to be real. Falling back to first-of-each-axis can land on a
  // combination that no variant satisfies, which locks the selector.
  const seed = useMemo(() => variants.find((v) => v.available) ?? variants[0], [variants])

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const a of axes) {
      init[a.title] = seed?.options[a.title] ?? a.values[0] ?? ''
    }
    return init
  })
  const [quantity, setQuantity] = useState(1)

  const pdpImage = usePdpImage()

  // Case-insensitive lookup so admin metadata keys like `finishImage_Red` and
  // `finishImage_red` both resolve, regardless of how the option value is cased.
  function lookupCI(map: Record<string, string>, key: string): string | undefined {
    if (map[key]) return map[key]
    const lower = key.toLowerCase()
    for (const k of Object.keys(map)) {
      if (k.toLowerCase() === lower) return map[k]
    }
    return undefined
  }

  // Does a variant match the given selection across every axis (optionally
  // ignoring one axis we're testing a candidate value for)?
  const matchesSelection = (
    v: PdpVariant,
    sel: Record<string, string>,
    exceptTitle?: string,
  ): boolean => axes.every((a) => a.title === exceptTitle || v.options[a.title] === sel[a.title])

  const activeVariant = useMemo(() => {
    const exact = variants.find((v) => matchesSelection(v, selected))
    if (exact) return exact
    // Fall back to any variant on the swatch axis value, then the first variant.
    if (swatchAxis) {
      const bySwatch = variants.find(
        (v) => v.options[swatchAxis.title] === selected[swatchAxis.title],
      )
      if (bySwatch) return bySwatch
    }
    return variants[0]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants, selected, swatchAxis])

  // Resolve the image for the currently active variant. Priority:
  //   1. The active variant's own image
  //   2. Any variant matching the selected swatch value that has an image
  //   3. product metadata finishImage_<value>
  function resolveVariantImage(): string | null {
    if (activeVariant?.imageUrl) return activeVariant.imageUrl
    if (swatchAxis) {
      const val = selected[swatchAxis.title] ?? ''
      const sameWithImage = variants.find((v) => v.options[swatchAxis.title] === val && v.imageUrl)
      if (sameWithImage?.imageUrl) return sameWithImage.imageUrl
      const fromMeta = lookupCI(swatchImageMap, val)
      if (fromMeta) return fromMeta
    }
    return null
  }

  const activeVariantImage = resolveVariantImage()

  useEffect(() => {
    if (!pdpImage) return
    pdpImage.setOverrideUrl(activeVariantImage)
  }, [pdpImage, activeVariantImage])

  const isOutOfStock = (activeVariant?.inventory ?? 0) === 0

  // A value is selectable (clickable) when ANY available variant carries it —
  // even if it conflicts with the current selection, because clicking it
  // auto-corrects the other axes. It's disabled only when no in-stock variant
  // has it at all.
  const existsAvailable = (title: string, value: string) =>
    variants.some((v) => v.available && v.options[title] === value)

  // Whether the value is in stock WITHOUT changing the other current selections.
  // Used to show a subtle "incompatible" ring while keeping the button active.
  const compatibleWithCurrent = (title: string, value: string) =>
    variants.some(
      (v) => v.available && v.options[title] === value && matchesSelection(v, selected, title),
    )

  function selectValue(title: string, value: string) {
    const next = { ...selected, [title]: value }
    // Keep the current combo if an in-stock variant satisfies it exactly.
    const exact = variants.find((v) => v.available && matchesSelection(v, next))
    if (exact) {
      setSelected(next)
      return
    }
    // Otherwise adopt a whole in-stock variant that has this value, so the other
    // axes auto-correct to a valid combination instead of locking up.
    const fallback = variants.find((v) => v.available && v.options[title] === value)
    if (fallback) {
      const corrected: Record<string, string> = {}
      for (const a of axes) corrected[a.title] = fallback.options[a.title] ?? ''
      setSelected(corrected)
      return
    }
    // No in-stock variant for this value — still reflect the choice (out of stock).
    setSelected(next)
  }

  const discountPct = activeVariant?.originalPrice
    ? Math.round((1 - activeVariant.price / activeVariant.originalPrice) * 100)
    : null

  const activeImageUrl = activeVariantImage ?? imageUrl

  // Swatch color resolution chain:
  //   1. swatchColor on any variant with this value (per-variant admin metadata)
  //   2. product metadata finishColor_<value>
  //   3. built-in common color name map
  //   4. light grey fallback
  function resolveSwatchColor(title: string, value: string): string {
    const variantWithColor = variants.find((v) => v.options[title] === value && v.swatchColor)
    if (variantWithColor?.swatchColor) return variantWithColor.swatchColor
    const fromProductMeta = lookupCI(swatchColors, value)
    if (fromProductMeta) return fromProductMeta
    const byName = COMMON_FINISH_COLORS[value.toLowerCase()]
    if (byName) return byName
    return '#ccc'
  }

  return (
    <div className="space-y-8">
      {/* Price */}
      <div className="flex items-baseline gap-4" data-testid="price-display">
        <span className="text-3xl font-semibold text-[var(--color-tt-ink)]">
          {formatPrice(activeVariant?.price ?? 0)}
        </span>
        {activeVariant?.originalPrice && (
          <>
            <span className="text-xl text-[var(--color-tt-outline)] line-through font-light">
              {formatPrice(activeVariant.originalPrice)}
            </span>
            {discountPct && (
              <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-orange)]">
                {discountPct}% Off
              </span>
            )}
          </>
        )}
      </div>

      {/* One section per product option, in admin order */}
      {visibleAxes.map((axis) =>
        axis.isSwatch ? (
          /* Colour / finish swatches — the primary axis: stays clickable as long
             as some in-stock variant carries the value; selecting auto-corrects
             the other axes when the exact combo isn't available. */
          <div key={axis.title} data-testid="finish-selector">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
              {axis.title}:{' '}
              <span className="font-normal tracking-normal normal-case text-[var(--color-tt-outline)]">
                {selected[axis.title]}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {axis.values.map((value) => {
                const color = resolveSwatchColor(axis.title, value)
                const selectable = existsAvailable(axis.title, value)
                const compatible = compatibleWithCurrent(axis.title, value)
                return (
                  <button
                    key={value}
                    title={value}
                    disabled={!selectable}
                    onClick={() => selectValue(axis.title, value)}
                    data-testid={`finish-${value.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-200
                    ${selected[axis.title] === value ? 'border-[var(--color-tt-gold)] scale-110' : 'border-transparent hover:scale-105'}
                    ${!selectable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    ${selectable && !compatible ? 'ring-1 ring-[var(--color-tt-outline-variant)] ring-offset-1' : ''}
                  `}
                    style={{ backgroundColor: color }}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          /* Generic pill axis (Size, Material, Weight, Pattern, …) — constrained
             by the current selection: a value is disabled when no in-stock
             variant pairs it with the other currently-selected options. */
          <div
            key={axis.title}
            data-testid={`option-selector-${axis.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3">{axis.title}</p>
            <div className="flex flex-wrap gap-2">
              {axis.values.map((value) => {
                const enabled = compatibleWithCurrent(axis.title, value)
                const isSelected = selected[axis.title] === value
                return (
                  <button
                    key={value}
                    onClick={() => selectValue(axis.title, value)}
                    disabled={!enabled}
                    data-testid={`option-${axis.title.toLowerCase().replace(/\s+/g, '-')}-${value.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-[var(--color-tt-ink)] text-white border border-[var(--color-tt-ink)]'
                          : enabled
                            ? 'border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] hover:border-[var(--color-tt-ink)]'
                            : 'border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-outline)] opacity-40 cursor-not-allowed line-through'
                      }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        ),
      )}

      {/* Stock */}
      <StockIndicator inventory={activeVariant?.inventory ?? 0} />

      {/* Quantity + Add to cart */}
      <div className="flex gap-3">
        <div
          className="flex items-center border border-[var(--color-tt-outline-variant)] bg-white"
          data-testid="quantity-selector"
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={isOutOfStock}
            className="px-4 py-3.5 hover:bg-[var(--color-tt-surface-container)] transition-colors duration-150 disabled:opacity-40"
            data-testid="quantity-decrement"
          >
            <span className="text-sm font-bold leading-none">−</span>
          </button>
          <span
            className="px-4 font-semibold text-sm min-w-[2rem] text-center"
            data-testid="quantity-value"
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            disabled={isOutOfStock}
            className="px-4 py-3.5 hover:bg-[var(--color-tt-surface-container)] transition-colors duration-150 disabled:opacity-40"
            data-testid="quantity-increment"
          >
            <span className="text-sm font-bold leading-none">+</span>
          </button>
        </div>

        <AddToCartButton
          variantId={activeVariant?.id ?? ''}
          quantity={quantity}
          outOfStock={isOutOfStock}
          productTitle={productTitle}
          price={activeVariant?.price ?? 0}
          imageUrl={activeImageUrl}
        />
      </div>

      <BuyNowButton
        variantId={activeVariant?.id ?? ''}
        quantity={quantity}
        outOfStock={isOutOfStock}
      />
    </div>
  )
}
