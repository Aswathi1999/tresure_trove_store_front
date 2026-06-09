import React from 'react'

// Root layout is intentionally minimal — each route group owns its own <html>/<body>.
// The (payload) group layout provides the full HTML shell for all admin and API routes.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
