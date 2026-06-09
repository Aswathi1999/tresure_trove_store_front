'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthField } from './AuthField'
import { AuthButton } from './AuthButton'
import { register as registerUser } from '@/lib/auth/actions'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required.').min(2, 'Name must be at least 2 characters.'),
    email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'email-exists' }
  | { kind: 'generic-error'; message: string }

export function RegisterForm() {
  const router = useRouter()
  const [state, setState] = useState<FormState>({ kind: 'idle' })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setState({ kind: 'submitting' })
    const result = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
    })
    if (result.ok) {
      router.push('/')
      return
    }
    if (result.code === 'EMAIL_EXISTS') {
      setState({ kind: 'email-exists' })
      return
    }
    setState({ kind: 'generic-error', message: result.message })
  })

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      data-testid="register-form"
    >
      <AuthField
        label="Full Name"
        type="text"
        autoComplete="name"
        placeholder="Your name"
        testId="register-name-input"
        error={errors.name?.message}
        {...register('name')}
      />
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        testId="register-email-input"
        error={errors.email?.message}
        {...register('email')}
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        testId="register-password-input"
        error={errors.password?.message}
        hint="Use 8+ characters with a mix of letters and numbers."
        {...register('password')}
      />
      <AuthField
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        testId="register-confirm-password-input"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {state.kind === 'email-exists' ? (
        <p
          role="alert"
          data-testid="register-email-exists-error"
          className="rounded-sm border border-[var(--color-tt-danger)]/40 bg-[var(--color-tt-danger)]/5 px-4 py-3 text-sm font-medium text-[var(--color-tt-danger)]"
        >
          An account with this email already exists.{' '}
          <Link
            href="/login"
            className="font-bold underline"
            data-testid="register-goto-login-link"
          >
            Sign in instead
          </Link>
          .
        </p>
      ) : null}

      {state.kind === 'generic-error' ? (
        <p
          role="alert"
          data-testid="register-generic-error"
          className="rounded-sm border border-[var(--color-tt-danger)]/40 bg-[var(--color-tt-danger)]/5 px-4 py-3 text-sm font-medium text-[var(--color-tt-danger)]"
        >
          {state.message}
        </p>
      ) : null}

      <AuthButton
        type="submit"
        loading={state.kind === 'submitting'}
        data-testid="register-submit-button"
      >
        {state.kind === 'submitting' ? 'Creating Account' : 'Create Account'}
      </AuthButton>

      <p className="mt-2 text-center text-sm text-[var(--color-tt-ink-muted)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-[var(--color-tt-orange)] hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)]"
          data-testid="register-login-link"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
