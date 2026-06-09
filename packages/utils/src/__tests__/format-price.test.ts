/**
 * Unit tests for the formatPrice utility.
 *
 * Validates smallest-currency-unit division, locale-specific symbol and
 * grouping, and edge cases such as zero and large amounts.
 */

import { formatPrice } from '../format-price'

describe('formatPrice', () => {
  // ─── INR ──────────────────────────────────────────────────────────────────

  describe('INR', () => {
    it('divides paise by 100 to get rupees', () => {
      // 100 000 paise = ₹1,000
      expect(formatPrice(100_000, 'INR')).toContain('1,000')
    })

    it('includes the rupee symbol', () => {
      expect(formatPrice(50_000, 'INR')).toContain('₹')
    })

    it('formats 0 paise as ₹0', () => {
      const result = formatPrice(0, 'INR')
      expect(result).toContain('₹')
      expect(result).toContain('0')
    })

    it('shows no decimal places (maximumFractionDigits: 0)', () => {
      // 10 050 paise = ₹100.50 → rounds to whole rupees
      const result = formatPrice(10_050, 'INR')
      expect(result).not.toContain('.')
    })

    it('formats large INR amounts with comma grouping', () => {
      // 10 000 000 paise = ₹1,00,000 (Indian numbering)
      const result = formatPrice(10_000_000, 'INR')
      expect(result).toContain('₹')
      expect(result).toContain(',')
    })
  })

  // ─── USD ──────────────────────────────────────────────────────────────────

  describe('USD', () => {
    it('divides cents by 100 to get dollars', () => {
      expect(formatPrice(5_000, 'USD')).toBe('$50')
    })

    it('includes the dollar sign', () => {
      expect(formatPrice(100, 'USD')).toContain('$')
    })

    it('formats 0 cents as $0', () => {
      expect(formatPrice(0, 'USD')).toBe('$0')
    })

    it('formats large USD amounts with comma grouping', () => {
      // 1 000 000 cents = $10,000
      expect(formatPrice(1_000_000, 'USD')).toBe('$10,000')
    })

    it('shows no decimal places (maximumFractionDigits: 0)', () => {
      // 199 cents = $1.99 → rounds to $2
      const result = formatPrice(199, 'USD')
      expect(result).not.toContain('.')
    })
  })
})
