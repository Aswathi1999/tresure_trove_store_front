'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import type { ProductReview, ReviewAggregate } from '@/lib/reviews'
import { ReviewForm } from './ReviewForm'

interface ReviewSectionProps {
  productId: string
  initialReviews: ProductReview[]
  initialAggregate: ReviewAggregate
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex text-[var(--color-tt-gold)]">
      {[1, 2, 3, 4, 5].map((pos) => (
        <Star
          key={pos}
          size={size}
          fill={pos <= Math.round(rating) ? 'currentColor' : 'none'}
          strokeWidth={pos <= Math.round(rating) ? 0 : 1.5}
        />
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function ReviewSection({
  productId,
  initialReviews,
  initialAggregate,
}: ReviewSectionProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false)
  const reviews = initialReviews
  const aggregate = initialAggregate

  const hasReviews = aggregate.total > 0
  const isEmpty = !hasReviews && reviews.length === 0
  const maxCount = Math.max(
    aggregate.distribution[5],
    aggregate.distribution[4],
    aggregate.distribution[3],
    aggregate.distribution[2],
    aggregate.distribution[1],
    1,
  )

  return (
    <section
      id="reviews"
      data-testid="review-section"
      className={`bg-[var(--color-tt-surface-container)] ${isEmpty ? 'py-8 lg:py-10' : 'py-12 lg:py-16'}`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className={`flex items-center justify-between ${isEmpty ? 'mb-4' : 'mb-8'}`}>
          <h2 className="text-base lg:text-lg font-bold tracking-[0.2em] uppercase text-[var(--color-tt-ink)]">
            Customer Experiences
          </h2>
          <button
            type="button"
            data-testid="open-review-form"
            onClick={() => setFormOpen(true)}
            className="px-5 py-2.5 border border-[var(--color-tt-ink)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-tt-ink)] hover:text-white transition-all duration-200"
          >
            Write a Review
          </button>
        </div>

        {isEmpty ? (
          <p data-testid="reviews-empty-state" className="text-sm text-[var(--color-tt-outline)]">
            No reviews yet —{' '}
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="underline underline-offset-2 hover:text-[var(--color-tt-ink)] transition-colors"
            >
              be the first to share yours
            </button>
            .
          </p>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Summary + distribution */}
            <div className="lg:col-span-5" data-testid="review-summary">
              {hasReviews ? (
                <>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-5xl font-bold text-[var(--color-tt-ink)]">
                      {aggregate.average.toFixed(1)}
                    </span>
                    <span className="text-[var(--color-tt-outline)]">/ 5.0</span>
                  </div>
                  <div className="mb-2">
                    <StarRow rating={aggregate.average} size={14} />
                  </div>
                  <p className="text-[11px] text-[var(--color-tt-outline)] tracking-widest uppercase mb-6">
                    {aggregate.total} review{aggregate.total === 1 ? '' : 's'}
                  </p>

                  <div className="space-y-2">
                    {([5, 4, 3, 2, 1] as const).map((bucket) => {
                      const count = aggregate.distribution[bucket]
                      const pct = (count / maxCount) * 100
                      return (
                        <div
                          key={bucket}
                          data-testid={`review-distribution-${bucket}`}
                          className="flex items-center gap-3"
                        >
                          <span className="text-[11px] font-bold text-[var(--color-tt-ink)] w-8">
                            {bucket} ★
                          </span>
                          <div className="flex-1 h-1.5 bg-[var(--color-tt-outline-variant)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-tt-gold)] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[var(--color-tt-outline)] w-8 text-right">
                            {count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-[var(--color-tt-outline)]">
                  <p className="text-sm mb-3">No reviews yet.</p>
                  <p className="text-[11px] tracking-widest uppercase">
                    Be the first to share yours.
                  </p>
                </div>
              )}
            </div>

            {/* Review list */}
            <div className="lg:col-span-7 space-y-6" data-testid="reviews-list">
              {reviews.length === 0 ? (
                <p className="text-sm text-[var(--color-tt-outline)] italic">
                  Reviews from customers will appear here once they&apos;ve been approved.
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    data-testid={`review-item-${review.id}`}
                    className="border-b border-[var(--color-tt-outline-variant)] pb-6"
                  >
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-tt-ink)]">
                          {review.customer_name}
                        </p>
                        <p className="text-[10px] text-[var(--color-tt-outline)] uppercase tracking-widest">
                          {review.verified ? 'Verified Buyer • ' : ''}
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                      <StarRow rating={review.rating} size={13} />
                    </div>
                    <h4 className="text-sm font-semibold mb-2 text-[var(--color-tt-ink)]">
                      {review.title}
                    </h4>
                    <p className="text-sm text-[var(--color-tt-outline)] leading-relaxed whitespace-pre-line">
                      {review.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <ReviewForm
          productId={productId}
          onClose={() => setFormOpen(false)}
          onSubmitted={() => {
            // Submission was successful; the review will appear after admin
            // approval. Keep the modal open so the user sees the success message.
          }}
        />
      )}
    </section>
  )
}
