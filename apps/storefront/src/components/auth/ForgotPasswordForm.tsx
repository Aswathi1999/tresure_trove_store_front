'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthField } from './AuthField'
import { AuthButton } from './AuthButton'
import { forgotPassword } from '@/lib/auth/actions'

const schema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
})

type FormValues = z.infer<typeof schema>

type FormState = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'submitted'; email: string }

export function ForgotPasswordForm() {
  const [state, setState] = useState<FormState>({ kind: 'idle' })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setState({ kind: 'submitting' })
    await forgotPassword(values.email)
    setState({ kind: 'submitted', email: values.email })
  })

  if (state.kind === 'submitted') {
    return (
      <div className="flex flex-col gap-6" data-testid="forgot-password-success">
        <div className="rounded-sm border border-[var(--color-tt-gold)]/40 bg-[var(--color-tt-gold)]/10 px-5 py-6">
          <p className="text-sm font-semibold text-[var(--color-tt-ink)]">Check your inbox</p>
          <p className="mt-2 text-sm text-[var(--color-tt-ink-muted)]">
            If an account exists for{' '}
            <span className="font-semibold text-[var(--color-tt-ink)]">{state.email}</span>, we have
            sent password reset instructions. The link expires in 15 minutes.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--color-tt-outline-variant)] bg-white px-6 py-2 text-xs font-bold uppercase text-[var(--color-tt-ink)] hover:border-[var(--color-tt-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          style={{ letterSpacing: '0.1em' }}
          data-testid="forgot-password-back-to-login"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      data-testid="forgot-password-form"
    >
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        testId="forgot-password-email-input"
        error={errors.email?.message}
        {...register('email')}
      />
      <AuthButton
        type="submit"
        loading={state.kind === 'submitting'}
        data-testid="forgot-password-submit-button"
      >
        {state.kind === 'submitting' ? 'Sending Link' : 'Send Reset Link'}
      </AuthButton>
      <p className="mt-2 text-center text-sm text-[var(--color-tt-ink-muted)]">
        Remembered it?{' '}
        <Link
          href="/login"
          className="font-bold text-[var(--color-tt-orange)] hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          data-testid="forgot-password-login-link"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
