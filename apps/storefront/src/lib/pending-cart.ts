'use client'

// A cart add that a guest started but couldn't finish until logging in. We stash
// the intended variant in localStorage, send them to /login, and SessionSync
// finishes the add once they come back authenticated. Stale intents (older than
// MAX_AGE_MS, or left over from an abandoned login) are ignored.

const KEY = 'tt_pending_cart_add'
const MAX_AGE_MS = 10 * 60 * 1000 // 10 minutes

export function setPendingCartAdd(variantId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ variantId, ts: Date.now() }))
  } catch {
    // localStorage unavailable — the worst case is the shopper re-clicks. Fine.
  }
}

/** Read-and-clear the pending add. Returns null when absent, malformed, or stale. */
export function takePendingCartAdd(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    window.localStorage.removeItem(KEY)
    const parsed = JSON.parse(raw) as { variantId?: unknown; ts?: unknown }
    if (typeof parsed.variantId !== 'string' || !parsed.variantId) return null
    if (typeof parsed.ts !== 'number' || Date.now() - parsed.ts > MAX_AGE_MS) return null
    return parsed.variantId
  } catch {
    return null
  }
}
