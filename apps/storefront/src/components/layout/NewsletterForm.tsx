'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface NewsletterFormProps {
  variant?: 'desktop' | 'mobile'
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function NewsletterForm({ variant = 'desktop' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        data-testid="footer-newsletter-success"
        className="flex items-center gap-2 text-[var(--color-tt-gold)] py-2"
      >
        <CheckCircle size={16} className="shrink-0" />
        <span className="text-sm font-medium">You&apos;re subscribed — thank you!</span>
      </div>
    )
  }

  if (variant === 'mobile') {
    return (
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="Your email"
            aria-label="Email address for newsletter"
            autoComplete="email"
            suppressHydrationWarning
            className="flex-1 rounded-sm border border-white/30 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-tt-gold)] transition-colors"
          />
          <button
            type="submit"
            suppressHydrationWarning
            className="shrink-0 rounded-sm border border-[var(--color-tt-gold)] text-[var(--color-tt-gold)] text-[10px] font-bold tracking-widest px-3 py-2.5 hover:bg-[var(--color-tt-gold)] hover:text-[var(--color-tt-ink)] transition-colors"
          >
            GO
          </button>
        </div>
        {error && <p className="text-[var(--color-tt-orange)] text-xs mt-1.5">{error}</p>}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Your email address"
          aria-label="Email address for newsletter"
          autoComplete="email"
          suppressHydrationWarning
          className="flex-1 rounded-sm border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-tt-gold)] transition-colors"
        />
        <button
          type="submit"
          suppressHydrationWarning
          className="shrink-0 rounded-sm bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] text-[10px] font-extrabold tracking-widest px-5 py-2.5 hover:bg-white transition-colors"
        >
          SUBSCRIBE
        </button>
      </div>
      {error && <p className="text-[var(--color-tt-orange)] text-xs mt-1.5">{error}</p>}
    </form>
  )
}
