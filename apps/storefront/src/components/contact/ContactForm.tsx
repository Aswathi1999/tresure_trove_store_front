'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'

// Indian mobile number: 10 digits starting 6–9, optionally prefixed with
// +91 / 91 / 0. Spaces, hyphens, and parentheses are ignored before matching.
const PHONE_REGEX = /^(?:\+?91|0)?[6-9]\d{9}$/
const isValidPhone = (value: string) => PHONE_REGEX.test(value.replace(/[\s()-]/g, ''))

// A name may contain letters (any language), spaces, hyphens, apostrophes, and
// periods — but no digits or other symbols.
const NAME_REGEX = /^[\p{L}\s'.-]+$/u

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .regex(NAME_REGEX, 'Name can only contain letters.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || value.trim() === '' || isValidPhone(value), {
      message: 'Enter a valid 10-digit mobile number (e.g. +91 98765 43210).',
    }),
  subject: z.string().min(1, 'Please select a subject.'),
  message: z.string().min(20, 'Message must be at least 20 characters.'),
})

// Strip any character that can't appear in a phone number as the user types.
const sanitizePhoneInput = (value: string) => value.replace(/[^\d+\s()-]/g, '')

// Strip digits and other non-name characters from the name as the user types.
const sanitizeNameInput = (value: string) => value.replace(/[^\p{L}\s'.-]/gu, '')

type FormValues = z.infer<typeof schema>

const MEDUSA_URL = process.env['NEXT_PUBLIC_MEDUSA_BACKEND_URL'] ?? 'http://localhost:9000'
const MEDUSA_PUB_KEY = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? ''

// User-facing copy. The goal is to never surface a raw fetch error such as
// "Failed to fetch" — every failure path resolves to a friendly message.
const NETWORK_ERROR_MESSAGE =
  "We couldn't reach our servers. Please check your internet connection and try again."
const FALLBACK_ERROR_MESSAGE = 'Submission failed. Please try again.'

// Friendly fallback keyed off the HTTP status, used only when the server did
// not return its own message. An unknown/undefined status falls back to the
// generic message.
function messageForStatus(status: number): string {
  if (status === 429)
    return 'You have sent several requests in a row. Please wait a moment and try again.'
  if (status === 401 || status === 403)
    return 'We could not verify this request. Please refresh the page and try again.'
  if (status >= 500) return 'Our servers are having a moment. Please try again in a little while.'
  if (status === 400) return 'Please check the details you entered and try again.'
  return FALLBACK_ERROR_MESSAGE
}

async function submitContactForm(values: FormValues): Promise<void> {
  // Abort the request if it hangs, so a stalled backend surfaces as a friendly
  // message instead of an endless spinner. Guarded for non-browser test envs.
  const timeoutSignal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(15_000)
      : undefined

  let res: Response
  try {
    res = await fetch(`${MEDUSA_URL}/store/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUB_KEY,
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        message: values.message,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.subject ? { subject: values.subject } : {}),
      }),
      signal: timeoutSignal,
    })
  } catch {
    // fetch rejects on network failure, CORS, DNS error, offline, or timeout —
    // this is where the raw "Failed to fetch" used to leak through.
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (res.ok) return

  // Prefer the server's message, but tolerate non-JSON or empty error bodies.
  let serverMessage: string | undefined
  try {
    const data = (await res.json()) as { error?: { message?: string }; message?: string }
    serverMessage = data?.error?.message ?? data?.message
  } catch {
    serverMessage = undefined
  }

  throw new Error(serverMessage ?? messageForStatus(res.status))
}

const fieldClass = (hasError: boolean) =>
  `w-full bg-transparent border-b py-2 px-0 text-sm text-[var(--color-tt-ink)] outline-none transition-all placeholder:text-[var(--color-tt-outline)] focus:border-[var(--color-tt-gold)] ${hasError ? 'border-[var(--color-tt-danger)]' : 'border-[var(--color-tt-outline-variant)]'}`

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const nameField = register('name')
  const phoneField = register('phone')

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitContactForm(values)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  })

  if (submitted) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-[var(--color-tt-outline-variant)]/40 shadow-[0_20px_40px_rgba(31,27,22,0.03)]"
        data-testid="contact-form-success"
      >
        <CheckCircle size={40} className="text-[var(--color-tt-brown)] mb-4" strokeWidth={1.5} />
        <h3 className="text-2xl font-bold text-[var(--color-tt-ink)] mb-2">Message Sent</h3>
        <p className="text-sm text-[var(--color-tt-ink-muted)] max-w-xs">
          Our team will get back to you within one working day.
        </p>
      </div>
    )
  }

  return (
    <div
      className="h-full bg-white p-8 md:p-12 rounded-lg border border-[var(--color-tt-outline-variant)]/40 shadow-[0_20px_40px_rgba(31,27,22,0.03)]"
      data-testid="contact-form-wrapper"
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex h-full flex-col space-y-7"
        data-testid="contact-form"
      >
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="contact-name"
              className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              placeholder="Enter your full name"
              data-testid="contact-name-input"
              aria-invalid={errors.name ? 'true' : 'false'}
              className={fieldClass(!!errors.name)}
              {...nameField}
              onChange={(e) => {
                const cleaned = sanitizeNameInput(e.target.value)
                if (cleaned !== e.target.value) e.target.value = cleaned
                void nameField.onChange(e)
              }}
            />
            {errors.name && (
              <p className="text-xs text-[var(--color-tt-danger)]" data-testid="contact-name-error">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="hello@domain.com"
              data-testid="contact-email-input"
              aria-invalid={errors.email ? 'true' : 'false'}
              className={fieldClass(!!errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p
                className="text-xs text-[var(--color-tt-danger)]"
                data-testid="contact-email-error"
              >
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone + Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="contact-phone"
              className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]"
            >
              Phone
            </label>
            <input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              maxLength={18}
              placeholder="+91 00000 00000"
              data-testid="contact-phone-input"
              aria-invalid={errors.phone ? 'true' : 'false'}
              className={fieldClass(!!errors.phone)}
              {...phoneField}
              onChange={(e) => {
                const cleaned = sanitizePhoneInput(e.target.value)
                if (cleaned !== e.target.value) e.target.value = cleaned
                void phoneField.onChange(e)
              }}
            />
            {errors.phone && (
              <p
                className="text-xs text-[var(--color-tt-danger)]"
                data-testid="contact-phone-error"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="contact-subject"
              className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]"
            >
              Subject
            </label>
            <select
              id="contact-subject"
              data-testid="contact-subject-input"
              aria-invalid={errors.subject ? 'true' : 'false'}
              className={`${fieldClass(!!errors.subject)} appearance-none`}
              {...register('subject')}
            >
              <option value="">Select an option</option>
              <option value="order">Order Status</option>
              <option value="product">Product Inquiry</option>
              <option value="bulk">Bulk Orders</option>
              <option value="support">General Support</option>
            </select>
            {errors.subject && (
              <p
                className="text-xs text-[var(--color-tt-danger)]"
                data-testid="contact-subject-error"
              >
                {errors.subject.message}
              </p>
            )}
          </div>
        </div>

        {/* Message — grows to fill the card so the button anchors to the bottom */}
        <div className="space-y-2 flex flex-1 flex-col">
          <label
            htmlFor="contact-message"
            className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            rows={4}
            placeholder="How can we help you today?"
            data-testid="contact-message-input"
            aria-invalid={errors.message ? 'true' : 'false'}
            className={`${fieldClass(!!errors.message)} resize-none flex-1 min-h-[120px]`}
            {...register('message')}
          />
          {errors.message && (
            <p
              className="text-xs text-[var(--color-tt-danger)]"
              data-testid="contact-message-error"
            >
              {errors.message.message}
            </p>
          )}
        </div>

        {submitError && (
          <p
            className="text-sm text-[var(--color-tt-danger)] bg-red-50 border border-red-200 rounded px-4 py-3"
            data-testid="contact-submit-error"
            role="alert"
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          data-testid="contact-submit-button"
          className="self-start flex items-center gap-2 bg-[var(--color-tt-gold)] hover:bg-[var(--color-tt-gold-hover)] text-[var(--color-tt-ink)] px-10 py-4 text-sm font-bold tracking-widest-ui uppercase rounded-sm shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" data-testid="contact-submit-spinner" />
              Sending
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  )
}
