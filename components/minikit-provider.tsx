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
        const appId = process.env.NEXT_PUBLIC_MINIKIT_APP_ID as string | undefined
        
        if (!appId) {
          console.warn("NEXT_PUBLIC_MINIKIT_APP_ID is not set. Please configure it in your environment variables.")
          setIsInstalled(false)
          return
        }
        
        const res = MiniKit.install(appId)
        if (res?.success) {
          console.log("MiniKit installed successfully", { appId: 'provided' })
          setIsInstalled(true)
        } else {
          console.warn("MiniKit install reported failure", res)
          setIsInstalled(false)
        }
        
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
