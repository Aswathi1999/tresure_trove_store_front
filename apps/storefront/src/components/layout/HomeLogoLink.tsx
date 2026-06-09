'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface HomeLogoLinkProps {
  children: ReactNode
  className?: string
  'aria-label'?: string
}

/**
 * Logo link that always returns the shopper to the homepage hero (top of page).
 * From any other route it navigates to "/" — Next.js scrolls to the top on
 * navigation. When already on "/", a same-route <Link> click is a no-op and would
 * leave the scroll position untouched, so we smooth-scroll to the top instead.
 *
 * Mirrors the inline handler the Navbar / MobileHeader already use, so the Footer
 * (a Server Component, which can't own an onClick) gets the same behaviour.
 */
export function HomeLogoLink({ children, className, 'aria-label': ariaLabel }: HomeLogoLinkProps) {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Link href="/" aria-label={ariaLabel} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
