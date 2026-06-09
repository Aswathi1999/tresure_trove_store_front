import type { Metadata } from 'next'
import { Mulish } from 'next/font/google'
import './globals.css'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollRestorer } from '@/components/ui/ScrollRestorer'
import { SessionSync } from '@/components/session/SessionSync'

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-mulish',
})

export const metadata: Metadata = {
  title: 'Treasure Trove — Luxury Furniture',
  description: 'Discover handcrafted luxury furniture by Treasure Trove Atelier.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={mulish.variable}>
      <body className="min-h-screen bg-[var(--color-tt-bg)] font-sans text-[var(--color-tt-ink)] antialiased">
        <ScrollRestorer />
        <SessionSync />
        <Navbar />
        <main suppressHydrationWarning>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}
