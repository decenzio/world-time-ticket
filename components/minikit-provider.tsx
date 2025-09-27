"use client"

import {ReactNode, useEffect, useState} from "react"
import {MiniKit} from "@worldcoin/minikit-js"

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const installMiniKit = async () => {
      try {
        console.log("Installing MiniKit...")
        MiniKit.install()
        console.log("MiniKit installed successfully")
        setIsInstalled(true)
        
        // Verify installation
        const isAvailable = MiniKit.isInstalled()
        console.log("MiniKit availability check:", isAvailable)
      } catch (error) {
        console.error("Failed to install MiniKit:", error)
        setIsInstalled(false)
      }
    }

    installMiniKit().catch(error => {
      console.error("Failed to install MiniKit:", error)
      setIsInstalled(false)
    })
  }, [])

  return (
    <div>
      {!isInstalled && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-sm">
          Initializing MiniKit...
        </div>
      )}
      {children}
    </div>
  )
}
