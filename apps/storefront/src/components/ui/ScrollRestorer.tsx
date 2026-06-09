'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollRestorer() {
  const pathname = usePathname()

  // Intercept link clicks in capture phase so window.scrollY is still accurate
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      try {
        const target = new URL(anchor.href)
        if (target.origin !== location.origin) return
        if (target.pathname !== pathname && window.scrollY > 0) {
          sessionStorage.setItem(`tt:scroll:${pathname}`, String(Math.round(window.scrollY)))
        }
      } catch {
        // ignore invalid URLs
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  // Restore saved scroll when arriving back on a page
  useEffect(() => {
    const saved = sessionStorage.getItem(`tt:scroll:${pathname}`)
    if (!saved) return
    const y = parseInt(saved, 10)
    sessionStorage.removeItem(`tt:scroll:${pathname}`)
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'instant' })
    })
  }, [pathname])

  return null
}
