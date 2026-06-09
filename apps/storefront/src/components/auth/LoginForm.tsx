'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthField } from './AuthField'
import { AuthButton } from './AuthButton'
import { login } from '@/lib/auth/actions'

const schema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type FormValues = z.infer<typeof schema>

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'credential-error'; message: string }
  | { kind: 'locked'; until: number }

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function LoginForm() {
  const router = useRouter()
  const [state, setState] = useState<FormState>({ kind: 'idle' })
  const [now, setNow] = useState<number>(() => Date.now())

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (state.kind !== 'locked') return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [state.kind])

  const onSubmit = handleSubmit(async (values) => {
    setState({ kind: 'submitting' })
    const result = await login(values.email, values.password)
    if (result.ok) {
      // Honour a same-origin ?redirect= target (e.g. a guest sent here mid
      // add-to-cart); otherwise land on the account page. The leading-slash
      // check (and rejecting "//") prevents open-redirects to other sites.
      let dest = '/account'
      if (typeof window !== 'undefined') {
        const r = new URLSearchParams(window.location.search).get('redirect')
        if (r && r.startsWith('/') && !r.startsWith('//')) dest = r
      }
      router.push(dest)
      return
    }
    if (result.code === 'ACCOUNT_LOCKED' && result.lockUntil) {
      setState({ kind: 'locked', until: result.lockUntil })
      return
    }
    setState({ kind: 'credential-error', message: result.message })
  })

  if (state.kind === 'locked') {
    const remaining = state.until - now
    if (remaining <= 0) {
      return (
        <div className="flex flex-col gap-6" data-testid="account-unlocked">
          <p className="text-sm text-[var(--color-tt-ink-muted)]">
            Your account is unlocked. Please try signing in again.
          </p>
          <AuthButton
            type="button"
            onClick={() => setState({ kind: 'idle' })}
            data-testid="login-retry-button"
          >
            Try Again
          </AuthButton>
        </div>
      )
    }
    return (
      <section
        className="flex flex-col gap-6 rounded-lg border border-[var(--color-tt-outline-variant)] bg-[var(--color-tt-surface-container-lowest)] p-8"
        data-testid="account-locked-screen"
      >
        <div>
          <span
            className="mb-3 block text-[11px] font-bold uppercase text-[var(--color-tt-orange)]"
            style={{ letterSpacing: '0.1em' }}
          >
            Account Temporarily Locked
          </span>
          <h2 className="text-2xl font-bold text-[var(--color-tt-ink)]">
            Too many failed attempts
          </h2>
          <p className="mt-2 text-sm text-[var(--color-tt-ink-muted)]">
            For your security, we have paused sign-in. Try again once the timer runs out or reset
            your password.
          </p>
        </div>
        <div
          className="rounded-sm bg-[var(--color-tt-surface-container)] px-6 py-8 text-center"
          data-testid="lock-countdown"
        >
          <span
            className="block text-[11px] font-bold uppercase text-[var(--color-tt-ink-muted)]"
            style={{ letterSpacing: '0.1em' }}
          >
            Retry in
          </span>
          <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-[var(--color-tt-ink)]">
            {formatCountdown(remaining)}
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-center text-xs font-bold uppercase text-[var(--color-tt-orange)] hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          style={{ letterSpacing: '0.1em' }}
          data-testid="locked-forgot-link"
        >
          Reset Password Instead
        </Link>
      </section>
    )
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate data-testid="login-form">
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        testId="login-email-input"
        error={errors.email?.message}
        {...register('email')}
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        testId="login-password-input"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="-mt-1 flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[var(--color-tt-orange)] hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          data-testid="login-forgot-link"
        >
          Forgot password?
        </Link>
      </div>

      {state.kind === 'credential-error' ? (
        <p
          role="alert"
          data-testid="login-credential-error"
          className="rounded-sm border border-[var(--color-tt-danger)]/40 bg-[var(--color-tt-danger)]/5 px-4 py-3 text-sm font-medium text-[var(--color-tt-danger)]"
        >
          {state.message}
        </p>
      ) : null}

      <AuthButton
        type="submit"
        loading={state.kind === 'submitting'}
        data-testid="login-submit-button"
      >
        {state.kind === 'submitting' ? 'Signing In' : 'Sign In'}
      </AuthButton>

      <p className="mt-2 text-center text-sm text-[var(--color-tt-ink-muted)]">
        New to Treasure Trove?{' '}
        <Link
          href="/register"
          className="font-bold text-[var(--color-tt-orange)] hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          data-testid="login-register-link"
        >
          Create an account
        </Link>
      </p>
    </form>
  )
}
