'use client'

import type { ButtonHTMLAttributes } from 'react'

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  variant?: 'primary' | 'secondary'
}

export function AuthButton({
  loading = false,
  variant = 'primary',
  disabled,
  children,
  className = '',
  ...rest
}: AuthButtonProps) {
  const base =
    'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm px-6 py-2 text-xs font-bold uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tt-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-tt-bg)] disabled:cursor-not-allowed disabled:opacity-60'
  const palette =
    variant === 'primary'
      ? 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] hover:bg-[var(--color-tt-gold-hover)]'
      : 'border border-[var(--color-tt-outline-variant)] bg-white text-[var(--color-tt-ink)] hover:border-[var(--color-tt-gold)]'

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${palette} ${className}`}
      style={{ letterSpacing: '0.1em' }}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  )
}
