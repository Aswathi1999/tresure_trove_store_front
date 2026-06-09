import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-[92px] lg:pt-[112px]"
      style={{ backgroundColor: 'var(--color-tt-bg)' }}
      data-testid="not-found-page"
    >
      <span
        className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)] block mb-6"
        data-testid="not-found-eyebrow"
      >
        404 — Page Not Found
      </span>

      <p
        className="text-[120px] lg:text-[180px] font-bold leading-none select-none mb-4"
        style={{ color: 'var(--color-tt-surface-container-high)' }}
        aria-hidden="true"
      >
        404
      </p>

      <h1
        className="text-[40px] font-bold text-[var(--color-tt-ink)] mb-4 max-w-xl"
        style={{ letterSpacing: '-0.02em' }}
        data-testid="not-found-heading"
      >
        This Page Has Left the Workshop
      </h1>

      <p
        className="text-base text-[var(--color-tt-outline)] max-w-sm mb-12 leading-relaxed"
        data-testid="not-found-body"
      >
        The page you are looking for no longer exists or may have moved. Let us help you find
        something beautiful instead.
      </p>

      <div className="flex flex-col sm:flex-row gap-4" data-testid="not-found-ctas">
        <Link
          href="/"
          className="inline-block bg-[var(--color-tt-gold)] hover:bg-[var(--color-tt-gold-hover)] text-[var(--color-tt-ink)] px-10 py-4 text-sm font-bold tracking-widest-ui uppercase rounded-[2px] transition-colors duration-200"
          data-testid="not-found-home-link"
        >
          Back to Home
        </Link>
        <Link
          href="/products"
          className="inline-block border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink)] px-10 py-4 text-sm font-bold tracking-widest-ui uppercase rounded-[2px] hover:bg-[var(--color-tt-surface-container)] transition-colors duration-200"
          data-testid="not-found-shop-link"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
