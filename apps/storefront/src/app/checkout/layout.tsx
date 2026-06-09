import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Checkout — Treasure Trove',
  description: 'Secure checkout for Treasure Trove luxury furniture.',
}

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  // The global Navbar/Footer hide themselves on /checkout (see those
  // components), so the checkout flow renders with just its own chrome.
  return <>{children}</>
}
