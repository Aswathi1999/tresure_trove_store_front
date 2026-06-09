import type { MockOrder } from '@/lib/account.mock'

const STATUS_STYLES: Record<MockOrder['status'], string> = {
  Processing: 'bg-[var(--color-tt-gold)]/20 text-[var(--color-tt-brown)]',
  Shipped: 'bg-blue-50 text-blue-700',
  Delivered: 'bg-green-50 text-green-700',
  Cancelled: 'bg-[var(--color-tt-danger)]/10 text-[var(--color-tt-danger)]',
}

interface Props {
  status: MockOrder['status']
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <span
      data-testid={`status-badge-${status.toLowerCase()}`}
      className={`inline-block px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] uppercase rounded-sm ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}
