// Shared character-level validation rules for every address form across the
// storefront (checkout shipping + billing, and the account address book) so
// validation is identical everywhere. These are applied AFTER each field's
// length/`required` check, so empty-field messages stay unchanged.
//
// Uses Unicode property escapes (\p{L} letters, \p{N} numbers) so accented and
// non-Latin names/places are accepted — we only reject the wrong CLASS of
// character (e.g. digits in a name, letters in a phone), not non-English input.

/** Names: letters, spaces, and . ' - only — no digits or other symbols. */
export const NAME_REGEX = /^[\p{L}\s.'-]+$/u
export const NAME_MSG = 'Name can only contain letters (no numbers)'

/** Cities / states / countries: letters, spaces, and . ' - — no digits/symbols. */
export const PLACE_REGEX = /^[\p{L}\s.'-]+$/u
export const CITY_MSG = 'City can only contain letters'
export const STATE_MSG = 'State can only contain letters (no numbers or symbols)'
export const COUNTRY_MSG = 'Country can only contain letters'

/** Phone: digits plus the usual phone punctuation (+ - ( ) space) — no letters. */
export const PHONE_REGEX = /^[\d+()\s-]+$/
export const PHONE_MSG = 'Phone number can only contain digits'
/** Reject phone values that are punctuation-only or too short/long to be real. */
export const phoneHasEnoughDigits = (value: string): boolean => {
  const digits = (value.match(/\d/g) ?? []).length
  return digits >= 7 && digits <= 15
}
export const PHONE_DIGITS_MSG = 'Enter a valid phone number'

/** Street address: letters, digits, spaces and common address punctuation. */
export const STREET_REGEX = /^[\p{L}\p{N}\s,.\-/#&'()]+$/u
export const STREET_MSG = 'Enter a valid street address'

// ── Live input filters ────────────────────────────────────────────────────────
// Strip disallowed characters AS THE USER TYPES (or pastes), so invalid input
// never makes it into the field. Each mirrors the matching *_REGEX above. The
// Zod schema still runs on submit as a safety net.
export const stripName = (v: string): string => v.replace(/[^\p{L}\s.'-]/gu, '')
export const stripPlace = (v: string): string => v.replace(/[^\p{L}\s.'-]/gu, '')
export const stripPhone = (v: string): string => v.replace(/[^\d+()\s-]/g, '')
export const stripDigits = (v: string): string => v.replace(/\D/g, '')
export const stripStreet = (v: string): string => v.replace(/[^\p{L}\p{N}\s,.\-/#&'()]/gu, '')
