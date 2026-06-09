/**
 * Format a price amount (in smallest currency unit) to a human-readable string.
 * All prices are stored in the smallest currency unit (paise for INR, cents for USD/AED).
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
