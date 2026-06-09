'use server'

import { getAuthenticatedCustomerId } from '@/lib/account'

/**
 * Returns the current logged-in customer id, or null for guests.
 * Safe to call from client components.
 */
export async function getCurrentUserIdAction(): Promise<string | null> {
  return getAuthenticatedCustomerId()
}
