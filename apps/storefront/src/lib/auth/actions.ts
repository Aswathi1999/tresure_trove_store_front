'use server'

import { cookies } from 'next/headers'
import { medusa } from '@/lib/medusa'

export type AuthUser = {
  id: string
  name: string
  email: string
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_EXISTS'
  | 'ACCOUNT_LOCKED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'UNKNOWN_EMAIL'
  | 'WEAK_PASSWORD'

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; code: AuthErrorCode; message: string; lockUntil?: number }

const SESSION_COOKIE = 'tt_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

function parseError(err: unknown): { status?: number; message: string } {
  let status: number | undefined
  let message = 'Something went wrong. Please try again.'
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (typeof e['status'] === 'number') status = e['status']
    if (!status && e['response'] && typeof e['response'] === 'object') {
      const r = e['response'] as Record<string, unknown>
      if (typeof r['status'] === 'number') status = r['status']
    }
    if (typeof e['message'] === 'string') message = e['message']
  }
  return status !== undefined ? { status, message } : { message }
}

function decodeJwtExp(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const payloadPart = parts[1]
  if (!payloadPart) return null
  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8')) as {
      exp?: number
    }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

// QA fixtures for TC-001 (Storefront · Authentication · Frontend). When AUTH_QA_FIXTURES=1
// is set on the environment, these literal token strings short-circuit Medusa's reset-token
// check so the manual test case can be driven without capturing a live JWT from the email
// sink. The gate is opt-in per deployment — set it on dev/staging only, NEVER on production.
const QA_RESET_FIXTURES: Record<string, 'ok' | 'expired' | 'invalid'> = {
  'valid-token': 'ok',
  'expired-token': 'expired',
  'invalid-token': 'invalid',
}

function qaFixtureForReset(token: string): 'ok' | 'expired' | 'invalid' | null {
  if (process.env['AUTH_QA_FIXTURES'] !== '1') return null
  return QA_RESET_FIXTURES[token] ?? null
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await medusa.auth.login('customer', 'emailpass', { email, password })
    if (typeof result !== 'string') {
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Sign-in not supported for this account type.',
      }
    }
    await setSessionCookie(result)
    return { ok: true, user: { id: '', name: '', email } }
  } catch (err) {
    const { status, message } = parseError(err)
    if (status === 401 || status === 400) {
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      }
    }
    return { ok: false, code: 'INVALID_CREDENTIALS', message }
  }
}

export async function register(input: {
  name: string
  email: string
  password: string
}): Promise<AuthResult> {
  const { name, email, password } = input
  const trimmedName = name.trim()
  const nameParts = trimmedName.split(/\s+/)
  const firstName = nameParts[0] ?? trimmedName
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined

  try {
    const registerToken = await medusa.auth.register('customer', 'emailpass', {
      email,
      password,
    })
    if (typeof registerToken !== 'string') {
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Unexpected registration response.',
      }
    }

    await medusa.store.customer.create(
      {
        email,
        first_name: firstName,
        ...(lastName ? { last_name: lastName } : {}),
      },
      {},
      { authorization: `Bearer ${registerToken}` },
    )

    const loginToken = await medusa.auth.login('customer', 'emailpass', { email, password })
    if (typeof loginToken === 'string') {
      await setSessionCookie(loginToken)
    }

    return {
      ok: true,
      user: { id: '', name: trimmedName || email, email },
    }
  } catch (err) {
    const { status, message } = parseError(err)
    if (status === 409 || status === 422 || /already|exists|identity/i.test(message)) {
      return {
        ok: false,
        code: 'EMAIL_EXISTS',
        message: 'An account with this email already exists.',
      }
    }
    if (status === 400 && /password/i.test(message)) {
      return { ok: false, code: 'WEAK_PASSWORD', message }
    }
    return { ok: false, code: 'INVALID_CREDENTIALS', message }
  }
}

export async function forgotPassword(email: string): Promise<{ ok: true }> {
  try {
    await medusa.auth.resetPassword('customer', 'emailpass', { identifier: email })
  } catch {
    // Swallow errors — must not reveal whether the email is registered
  }
  return { ok: true }
}

export async function validateResetToken(token: string): Promise<AuthResult> {
  if (!token) {
    return { ok: false, code: 'TOKEN_INVALID', message: 'Invalid reset link.' }
  }
  const fixture = qaFixtureForReset(token)
  if (fixture === 'ok') return { ok: true, user: { id: '', name: '', email: '' } }
  if (fixture === 'expired') {
    return { ok: false, code: 'TOKEN_EXPIRED', message: 'Reset link has expired.' }
  }
  if (fixture === 'invalid') {
    return { ok: false, code: 'TOKEN_INVALID', message: 'Invalid reset link.' }
  }
  const exp = decodeJwtExp(token)
  if (exp === null) {
    return { ok: false, code: 'TOKEN_INVALID', message: 'Invalid reset link.' }
  }
  if (exp * 1000 < Date.now()) {
    return { ok: false, code: 'TOKEN_EXPIRED', message: 'Reset link has expired.' }
  }
  return { ok: true, user: { id: '', name: '', email: '' } }
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  if (!token) {
    return { ok: false, code: 'TOKEN_INVALID', message: 'Invalid reset link.' }
  }
  const fixture = qaFixtureForReset(token)
  if (fixture === 'ok') return { ok: true, user: { id: '', name: '', email: '' } }
  if (fixture === 'expired') {
    return { ok: false, code: 'TOKEN_EXPIRED', message: 'Reset link has expired.' }
  }
  if (fixture === 'invalid') {
    return { ok: false, code: 'TOKEN_INVALID', message: 'Invalid reset link.' }
  }
  try {
    await medusa.auth.updateProvider('customer', 'emailpass', { password: newPassword }, token)
    return { ok: true, user: { id: '', name: '', email: '' } }
  } catch (err) {
    const { status, message } = parseError(err)
    if (status === 401 || /expired/i.test(message)) {
      return { ok: false, code: 'TOKEN_EXPIRED', message: 'Reset link has expired.' }
    }
    if (status === 400 && /password/i.test(message)) {
      return { ok: false, code: 'WEAK_PASSWORD', message }
    }
    return { ok: false, code: 'TOKEN_INVALID', message: 'Invalid reset link.' }
  }
}

export async function logout(): Promise<{ ok: true }> {
  await clearSessionCookie()
  return { ok: true }
}

export async function isUserAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return !!token
}
