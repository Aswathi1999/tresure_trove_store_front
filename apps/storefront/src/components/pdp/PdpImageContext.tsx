'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface PdpImageCtx {
  overrideUrl: string | null
  setOverrideUrl: (url: string | null) => void
}

const Ctx = createContext<PdpImageCtx | null>(null)

export function PdpImageProvider({ children }: { children: ReactNode }) {
  const [overrideUrl, setOverrideUrl] = useState<string | null>(null)
  return <Ctx.Provider value={{ overrideUrl, setOverrideUrl }}>{children}</Ctx.Provider>
}

export function usePdpImage(): PdpImageCtx | null {
  return useContext(Ctx)
}
