import { useCallback, useEffect, useState } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps } from '@medusajs/framework/types'

type ReviewStatus = 'pending' | 'approved' | 'rejected'

type AdminReview = {
  id: string
  product_id: string
  customer_name: string
  customer_email: string | null
  rating: number
  title: string
  body: string
  status: ReviewStatus
  verified: boolean
  created_at: string
}

type AdminProduct = {
  id: string
}

function statusColor(status: ReviewStatus): string {
  if (status === 'approved') return '#3d7a5e'
  if (status === 'rejected') return '#a04646'
  return '#76574d'
}

function ProductReviewsWidget({ data }: DetailWidgetProps<AdminProduct>) {
  const product = data as AdminProduct
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all')

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ product_id: product.id, limit: '100' })
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/admin/reviews?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { reviews: AdminReview[] }
      setReviews(json.reviews)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reviews')
    } finally {
      setLoading(false)
    }
  }, [product.id, filter])

  useEffect(() => {
    load()
  }, [load])

  async function updateStatus(id: string, status: ReviewStatus): Promise<void> {
    setBusyId(id)
    try {
      const res = await fetch(`/admin/reviews/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteReview(id: string): Promise<void> {
    if (typeof window !== 'undefined' && !window.confirm('Delete this review permanently?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/admin/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  const counts = {
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div
      data-testid="product-reviews-widget"
      className="rounded-lg border overflow-hidden shadow-elevation-card-rest"
      style={{ background: '#ffffff', borderColor: '#cdc6b7' }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{
          background: 'linear-gradient(to right, #fff8f3, #fdf6f0)',
          borderColor: '#cdc6b7',
        }}
      >
        <div>
          <h2
            className="text-sm font-bold uppercase"
            style={{ letterSpacing: '0.10em', color: '#1F1B16' }}
          >
            Customer Reviews
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
            Pending: {counts.pending} · Approved: {counts.approved} · Rejected: {counts.rejected}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[10px] font-bold uppercase px-2.5 py-1 rounded transition-colors"
              style={{
                background: filter === f ? '#1F1B16' : '#ffffff',
                color: filter === f ? '#ffffff' : '#1F1B16',
                border: '1px solid #cdc6b7',
                letterSpacing: '0.08em',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <p className="text-[12px]" style={{ color: '#7c7768' }}>
            Loading reviews…
          </p>
        ) : error ? (
          <p className="text-[12px] text-ui-fg-error">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="text-[12px]" style={{ color: '#7c7768' }}>
            No reviews
            {filter !== 'all' ? ` with status “${filter}”` : ' yet'}.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                data-testid={`admin-review-${r.id}`}
                className="border rounded-md p-4"
                style={{ borderColor: '#cdc6b7', background: '#fafaf6' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: '#1F1B16' }}>
                      {r.customer_name}
                      {r.customer_email && (
                        <span className="font-normal ml-2" style={{ color: '#7c7768' }}>
                          ({r.customer_email})
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] uppercase" style={{ color: '#7c7768' }}>
                      {new Date(r.created_at).toLocaleString()} · rating {r.rating}/5
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cdc6b7',
                      color: statusColor(r.status),
                      letterSpacing: '0.08em',
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-[13px] font-bold mb-1" style={{ color: '#1F1B16' }}>
                  {r.title}
                </p>
                <p
                  className="text-[12px] whitespace-pre-line"
                  style={{ color: '#4A443D', lineHeight: '1.5' }}
                >
                  {r.body}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(r.id, 'approved')}
                      disabled={busyId === r.id}
                      className="text-[10px] font-bold uppercase px-3 py-1.5 rounded disabled:opacity-40"
                      style={{ background: '#3d7a5e', color: '#ffffff', letterSpacing: '0.08em' }}
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(r.id, 'rejected')}
                      disabled={busyId === r.id}
                      className="text-[10px] font-bold uppercase px-3 py-1.5 rounded disabled:opacity-40"
                      style={{ background: '#a04646', color: '#ffffff', letterSpacing: '0.08em' }}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={busyId === r.id}
                    className="text-[10px] font-bold uppercase px-3 py-1.5 rounded border disabled:opacity-40 ml-auto"
                    style={{
                      borderColor: '#cdc6b7',
                      color: '#76574d',
                      background: '#ffffff',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.details.after',
})

export default ProductReviewsWidget
