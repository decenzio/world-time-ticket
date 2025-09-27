"use client"

import { useEffect, ReactNode } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  useEffect(() => {
    // Install MiniKit when the component mounts
    MiniKit.install()
    console.log("MiniKit installed")
  }, [])

  return <>{children}</>
}
