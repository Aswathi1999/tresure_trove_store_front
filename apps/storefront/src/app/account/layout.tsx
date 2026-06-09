import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AccountNav } from '@/components/account/AccountNav'

export const metadata: Metadata = {
  title: 'My Account — Treasure Trove',
  description: 'Manage your orders, addresses, wishlist, and profile.',
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  if (!cookieStore.has('tt_session')) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--color-tt-bg)]">
      <div className="pt-[104px] lg:pt-[140px] pb-20 lg:pb-16">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          {/* Mobile nav */}
          <div className="lg:hidden mb-6">
            <AccountNav />
          </div>

          <div className="lg:flex lg:gap-12 lg:items-start">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <AccountNav />
            </div>

            {/* Page content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
