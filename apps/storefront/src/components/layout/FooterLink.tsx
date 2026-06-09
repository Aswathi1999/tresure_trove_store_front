'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface FooterLinkProps {
  href: string
  className?: string
  children: ReactNode
}

/**
 * Footer is global navigation — every click should land the shopper at the TOP
 * (header) of the destination page. This wraps Next's <Link> to fix two issues:
 *
 *   1. Flicker / "comes back to the footer": ScrollRestorer saves & restores a
 *      per-pathname scroll position. On a forward footer click it would restore
 *      a stale position (or the footer scroll), fighting Next's scroll-to-top
 *      and producing a visible jump. We clear the saved entries for both the
 *      page we're leaving and the one we're entering so the restore can't fire.
 *
 *   2. "Stays in the footer" on same-route clicks: a <Link> to the route you're
 *      already on is a no-op, so you stay wherever you scrolled. We intercept and
 *      smooth-scroll to the top instead (mirrors HomeLogoLink's behaviour).
 */
export function FooterLink({ href, className, children }: FooterLinkProps) {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle open-in-new-tab / middle-click etc.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    try {
      const targetPath = new URL(href, window.location.origin).pathname
      // Drop saved scroll for the page we're leaving AND the one we're entering
      // so ScrollRestorer stays out of the way and arrival is a clean top-of-page.
      sessionStorage.removeItem(`tt:scroll:${pathname}`)
      sessionStorage.removeItem(`tt:scroll:${targetPath}`)
      if (targetPath === pathname) {
        // Already on this route — <Link> won't navigate/scroll, so do it here.
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      // Malformed href — fall through to default <Link> behaviour.
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
