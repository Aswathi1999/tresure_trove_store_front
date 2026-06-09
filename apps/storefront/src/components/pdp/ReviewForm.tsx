'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Star, X } from 'lucide-react'
import { submitProductReview } from '@/lib/reviews'

interface ReviewFormProps {
  productId: string
  onClose: () => void
  onSubmitted: () => void
}

const AUTO_CLOSE_MS = 2500

export function ReviewForm({ productId, onClose, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const ratingDisplay = hoverRating || rating

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(onClose, AUTO_CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [success, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating.')
      return
    }
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    setSubmitting(true)
    const result = await submitProductReview(productId, {
      rating,
      customer_name: name.trim(),
      body: body.trim() || undefined,
    })
    setSubmitting(false)
    if (result.ok) {
      setSuccess(result.message)
      onSubmitted()
    } else {
      setError(result.message)
    }
  }

  return (
    <div
      data-testid="review-form-overlay"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={success ? 'Review submitted' : 'Write a review'}
    >
      <div className="bg-white w-full max-w-lg rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-tt-outline-variant)]">
          <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--color-tt-ink)]">
            {success ? 'Thank You' : 'Write a Review'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div
            data-testid="review-form-thank-you"
            className="px-6 py-10 flex flex-col items-center text-center"
          >
            <CheckCircle2
              size={56}
              className="text-[var(--color-tt-success,#3d7a5e)] mb-4"
              strokeWidth={1.5}
            />
            <h4 className="text-base font-semibold text-[var(--color-tt-ink)] mb-2">
              Thank you for your review!
            </h4>
            <p
              data-testid="review-form-success"
              className="text-sm text-[var(--color-tt-outline)] leading-relaxed max-w-sm"
            >
              {success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Rating */}
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-2">
                Your rating
              </label>
              <div
                className="flex items-center gap-1"
                role="radiogroup"
                aria-label="Star rating"
                data-testid="review-form-rating"
              >
                {[1, 2, 3, 4, 5].map((pos) => (
                  <button
                    type="button"
                    key={pos}
                    onClick={() => setRating(pos)}
                    onMouseEnter={() => setHoverRating(pos)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${pos} star${pos > 1 ? 's' : ''}`}
                    aria-checked={rating === pos}
                    role="radio"
                    className="p-1 text-[var(--color-tt-gold)]"
                  >
                    <Star
                      size={26}
                      fill={pos <= ratingDisplay ? 'currentColor' : 'none'}
                      strokeWidth={pos <= ratingDisplay ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="review-name"
                className="block text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-2"
              >
                Name
              </label>
              <input
                id="review-name"
                data-testid="review-form-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How you'd like to appear in your review"
                className="w-full border border-[var(--color-tt-outline-variant)] rounded-sm px-3 py-2 text-sm outline-none focus:border-[var(--color-tt-ink)]"
                maxLength={80}
                required
              />
            </div>

            {/* Body (optional) */}
            <div>
              <label
                htmlFor="review-body"
                className="block text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink)] mb-2"
              >
                Your review{' '}
                <span className="font-normal lowercase text-[var(--color-tt-outline)]">
                  (optional)
                </span>
              </label>
              <textarea
                id="review-body"
                data-testid="review-form-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Share anything you'd like other shoppers to know"
                className="w-full border border-[var(--color-tt-outline-variant)] rounded-sm px-3 py-2 text-sm outline-none focus:border-[var(--color-tt-ink)] resize-y"
                maxLength={4000}
              />
              <p className="text-[10px] mt-1 text-[var(--color-tt-outline)]">{body.length}/4000</p>
            </div>

            {error && (
              <p
                data-testid="review-form-error"
                className="text-[12px] font-medium text-[var(--color-tt-danger)]"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-[var(--color-tt-outline-variant)] hover:bg-[var(--color-tt-surface-container)] transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="review-form-submit"
                className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-[var(--color-tt-ink)] text-white hover:bg-[var(--color-tt-orange)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
