'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { medusa } from '@/lib/medusa'

async function getAuthHeaders(): Promise<{ authorization: string } | null> {
  const store = await cookies()
  const token = store.get('tt_session')?.value
  if (!token) return null
  return { authorization: `Bearer ${token}` }
}

// Pull a useful reason out of a Medusa SDK / fetch error so failures are
// diagnosable instead of hidden behind a generic message. Medusa errors expose
// `.message` and a status; network failures (wrong backend URL, unreachable
// host) surface as "fetch failed"/ECONNREFUSED. The status code is the key
// signal: 401 = auth/token, 400/422 = validation, 404 = wrong route/URL,
// 5xx = backend error, no status = network/DNS/CORS-at-edge.
function extractError(error: unknown): string {
  const e = error as {
    message?: string
    status?: number
    statusText?: string
    response?: { status?: number; data?: { message?: string } }
  }
  const status = e?.status ?? e?.response?.status
  const detail = e?.response?.data?.message ?? e?.message ?? 'Unknown error'
  return status ? `[${status}] ${detail}` : detail
}

function toCountryCode(country: string): string {
  const lower = country.toLowerCase().trim()
  if (lower === 'india') return 'in'
  // If already a 2-char code, use it directly
  if (lower.length === 2) return lower
  return lower.slice(0, 2)
}

type ActionResult<T = void> = T extends void
  ? { ok: true } | { ok: false; message: string }
  : { ok: true; data: T } | { ok: false; message: string }

export async function updateProfile(input: {
  firstName: string
  lastName: string
  phone: string
}): Promise<ActionResult> {
  const headers = await getAuthHeaders()
  if (!headers) return { ok: false, message: 'Not authenticated' }
  try {
    await medusa.store.customer.update(
      { first_name: input.firstName, last_name: input.lastName, phone: input.phone },
      {},
      headers,
    )
    revalidatePath('/account')
    revalidatePath('/account/settings')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: `Failed to save profile: ${extractError(error)}` }
  }
}

export async function addAddress(input: {
  label: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pin: string
  country: string
}): Promise<ActionResult<string>> {
  const headers = await getAuthHeaders()
  if (!headers) return { ok: false, message: 'Not authenticated' }

  const nameParts = input.fullName.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  try {
    const { customer } = await medusa.store.customer.createAddress(
      {
        first_name: firstName,
        last_name: lastName,
        phone: input.phone,
        address_1: input.line1,
        address_2: input.line2,
        city: input.city,
        province: input.state,
        postal_code: input.pin,
        country_code: toCountryCode(input.country),
        metadata: { label: input.label },
      },
      {},
      headers,
    )
    revalidatePath('/account')
    revalidatePath('/account/addresses')
    const addresses = customer.addresses ?? []
    const newest = addresses[addresses.length - 1]
    return { ok: true, data: newest?.id ?? '' }
  } catch (error) {
    return { ok: false, message: `Failed to add address: ${extractError(error)}` }
  }
}

export async function updateAddress(
  addressId: string,
  input: {
    label: string
    fullName: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    pin: string
    country: string
  },
): Promise<ActionResult> {
  const headers = await getAuthHeaders()
  if (!headers) return { ok: false, message: 'Not authenticated' }

  const nameParts = input.fullName.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  try {
    await medusa.store.customer.updateAddress(
      addressId,
      {
        first_name: firstName,
        last_name: lastName,
        phone: input.phone,
        address_1: input.line1,
        address_2: input.line2,
        city: input.city,
        province: input.state,
        postal_code: input.pin,
        country_code: toCountryCode(input.country),
        metadata: { label: input.label },
      },
      {},
      headers,
    )
    revalidatePath('/account')
    revalidatePath('/account/addresses')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: `Failed to update address: ${extractError(error)}` }
  }
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const headers = await getAuthHeaders()
  if (!headers) return { ok: false, message: 'Not authenticated' }
  try {
    await medusa.store.customer.deleteAddress(addressId, headers)
    revalidatePath('/account')
    revalidatePath('/account/addresses')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: `Failed to delete address: ${extractError(error)}` }
  }
}

export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  const headers = await getAuthHeaders()
  if (!headers) return { ok: false, message: 'Not authenticated' }
  try {
    await medusa.store.customer.updateAddress(addressId, { is_default_shipping: true }, {}, headers)
    revalidatePath('/account')
    revalidatePath('/account/addresses')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: `Failed to set default address: ${extractError(error)}` }
  }
}
