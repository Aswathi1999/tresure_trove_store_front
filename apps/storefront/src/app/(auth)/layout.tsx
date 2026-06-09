import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-tt-bg)]">
      <div className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col lg:flex-row">
        <aside
          className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[var(--color-tt-surface-container)] lg:block"
          aria-hidden="true"
        >
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml"
            alt="Handcrafted brass pendant lighting from Treasure Trove"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/25 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-16 text-[var(--color-tt-off-white)]">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-tt-ink)] text-sm font-bold text-[var(--color-tt-gold)]">
                TT
              </span>
              <span className="text-lg font-bold tracking-tight">TREASURE TROVE</span>
            </Link>
            <div>
              <span
                className="mb-3 block text-xs font-bold uppercase text-[var(--color-tt-gold)]"
                style={{ letterSpacing: '0.1em' }}
              >
                Modern Heirlooms
              </span>
              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Handcrafted in India, carried for a lifetime.
              </h2>
              <p className="mt-4 max-w-sm text-sm text-white/80">
                Sign in to track orders, save favourites, and revisit pieces curated from artisan
                studios across the country.
              </p>
            </div>
            <p className="text-[10px] uppercase text-white/60" style={{ letterSpacing: '0.1em' }}>
              © 2026 Treasure Trove · Made in India
            </p>
          </div>
        </aside>

        <main className="flex w-full flex-1 items-start justify-center px-6 pt-[88px] pb-10 sm:px-10 lg:w-1/2 lg:px-16 lg:pt-[120px]">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-tt-gold)] lg:hidden"
              data-testid="auth-brand-link"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-tt-ink)] text-sm font-bold text-[var(--color-tt-gold)]">
                TT
              </span>
              <span
                className="text-base font-bold tracking-tight text-[var(--color-tt-ink)]"
                style={{ letterSpacing: '0.02em' }}
              >
                TREASURE TROVE
              </span>
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
