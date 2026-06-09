'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string | undefined
  hint?: string
  testId?: string
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, hint, testId, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-[11px] font-bold uppercase text-[var(--color-tt-ink-muted)]"
        style={{ letterSpacing: '0.1em' }}
      >
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        data-testid={testId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`min-h-12 rounded-sm border bg-white px-4 py-2 text-sm text-[var(--color-tt-ink)] outline-none transition-colors placeholder:text-[var(--color-tt-outline)] focus:border-[var(--color-tt-gold)] focus:ring-2 focus:ring-[var(--color-tt-gold)]/30 ${
          error ? 'border-[var(--color-tt-danger)]' : 'border-[var(--color-tt-outline-variant)]'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-sm font-medium text-[var(--color-tt-danger)]"
          data-testid={testId ? `${testId}-error` : undefined}
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-[var(--color-tt-outline)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
