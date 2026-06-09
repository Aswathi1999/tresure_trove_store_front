'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthField } from './AuthField'
import { AuthButton } from './AuthButton'
import { validateResetToken, resetPassword } from '@/lib/auth/actions'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

type PageState =
  | { kind: 'validating' }
  | { kind: 'ready'; token: string }
  | { kind: 'submitting'; token: string }
  | { kind: 'success' }
  | { kind: 'expired' }
  | { kind: 'invalid' }

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, setState] = useState<PageState>({ kind: 'validating' })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const validate = useCallback(async () => {
    if (!token) {
      setState({ kind: 'invalid' })
      return
    }
    const result = await validateResetToken(token)
    if (result.ok) {
      setState({ kind: 'ready', token })
      return
    }
    if (result.code === 'TOKEN_EXPIRED') {
      setState({ kind: 'expired' })
      return
    }
    setState({ kind: 'invalid' })
  }, [token])

  useEffect(() => {
    validate()
  }, [validate])

  const onSubmit = handleSubmit(async (values) => {
    if (state.kind !== 'ready') return
    setState({ kind: 'submitting', token: state.token })
    const result = await resetPassword(state.token, values.password)
    if (result.ok) {
      setState({ kind: 'success' })
      return
    }
    if (result.code === 'TOKEN_EXPIRED') {
      setState({ kind: 'expired' })
      return
    }
    setState({ kind: 'invalid' })
  })

  if (state.kind === 'validating') {
    return (
      <div
        className="flex flex-col items-center gap-4 py-12"
        data-testid="reset-password-validating"
      >
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-tt-gold)] border-t-transparent" />
        <p className="text-sm text-[var(--color-tt-ink-muted)]">Verifying your reset link…</p>
      </div>
    )
  }

  if (state.kind === 'invalid') {
    return (
      <div className="flex flex-col gap-6" data-testid="reset-password-invalid">
        <div className="rounded-sm border border-[var(--color-tt-danger)]/40 bg-[var(--color-tt-danger)]/5 px-5 py-6">
          <p className="text-sm font-semibold text-[var(--color-tt-danger)]">Invalid reset link</p>
          <p className="mt-2 text-sm text-[var(--color-tt-ink-muted)]">
            This password reset link is invalid or has already been used. Please request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-tt-gold)] px-6 py-2 text-xs font-bold uppercase text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-gold-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-ink)]"
          style={{ letterSpacing: '0.1em' }}
          data-testid="reset-password-request-new-link"
        >
          Request New Link
        </Link>
      </div>
    )
  }

  if (state.kind === 'expired') {
    return (
      <div className="flex flex-col gap-6" data-testid="reset-password-expired">
        <div className="rounded-sm border border-[var(--color-tt-orange)]/40 bg-[var(--color-tt-orange)]/5 px-5 py-6">
          <p className="text-sm font-semibold text-[var(--color-tt-orange)]">Reset link expired</p>
          <p className="mt-2 text-sm text-[var(--color-tt-ink-muted)]">
            This password reset link has expired. Reset links are valid for 15 minutes. Please
            request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-tt-gold)] px-6 py-2 text-xs font-bold uppercase text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-gold-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-ink)]"
          style={{ letterSpacing: '0.1em' }}
          data-testid="reset-password-request-new-link"
        >
          Request New Link
        </Link>
        <Link
          href="/login"
          className="text-center text-xs font-bold uppercase text-[var(--color-tt-orange)] hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          style={{ letterSpacing: '0.1em' }}
          data-testid="reset-password-back-to-login"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  if (state.kind === 'success') {
    return (
      <div className="flex flex-col gap-6" data-testid="reset-password-success">
        <div className="rounded-sm border border-[var(--color-tt-gold)]/40 bg-[var(--color-tt-gold)]/10 px-5 py-6">
          <p className="text-sm font-semibold text-[var(--color-tt-ink)]">
            Password reset successful
          </p>
          <p className="mt-2 text-sm text-[var(--color-tt-ink-muted)]">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
        </div>
        <AuthButton
          type="button"
          onClick={() => router.push('/login')}
          data-testid="reset-password-go-to-login"
        >
          Sign In
        </AuthButton>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      data-testid="reset-password-form"
    >
      <AuthField
        label="New Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        testId="reset-password-input"
        error={errors.password?.message}
        {...register('password')}
      />
      <AuthField
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        testId="reset-confirm-password-input"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <AuthButton
        type="submit"
        loading={state.kind === 'submitting'}
        data-testid="reset-password-submit-button"
      >
        {state.kind === 'submitting' ? 'Resetting Password' : 'Reset Password'}
      </AuthButton>
    </form>
  )
}
