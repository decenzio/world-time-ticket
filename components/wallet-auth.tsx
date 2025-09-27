"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Wallet, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { MiniKit } from "@worldcoin/minikit-js"

interface WalletAuthProps {
  onError?: (error: string) => void
  onSuccess?: () => void
}

export function WalletAuth({ onError, onSuccess }: WalletAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if MiniKit is available
    const checkMiniKit = () => {
      const available = MiniKit.isInstalled()
      setIsInstalled(available)
    }

    checkMiniKit()
    
    // Check periodically for MiniKit availability
    const interval = setInterval(checkMiniKit, 1000)
    return () => clearInterval(interval)
  }, [])

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      onError?.("World App not detected. Please open this app in World App.")
      return
    }

    setIsLoading(true)
    
    try {
      // Get nonce from our API
      const res = await fetch("/api/nonce")
      const { nonce } = await res.json()

      // Use MiniKit for wallet authentication
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to WorldTimeTicket to access the marketplace and book time with verified humans.',
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error || 'Authentication failed')
      }

      // Verify the SIWE message
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const verificationResult = await response.json()

      if (!verificationResult.isValid) {
        throw new Error(verificationResult.message || 'Verification failed')
      }

      // Get user info from MiniKit if available
      let userInfo = {}
      try {
        if (MiniKit.getUserByAddress) {
          userInfo = await MiniKit.getUserByAddress(finalPayload.address)
        }
      } catch (error) {
        console.warn('Could not get user info from MiniKit:', error)
      }
      
      // Sign in with NextAuth using the wallet address and user info
      const signInResult = await signIn('wallet', {
        walletAddress: finalPayload.address,
        username: userInfo.username,
        profilePictureUrl: userInfo.profilePictureUrl,
        permissions: userInfo.permissions ? JSON.stringify(userInfo.permissions) : undefined,
        optedIntoOptionalAnalytics: userInfo.optedIntoOptionalAnalytics?.toString(),
        worldAppVersion: userInfo.worldAppVersion?.toString(),
        deviceOS: userInfo.deviceOS,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Wallet authentication failed:', error)
      onError?.(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isInstalled) {
    return (
      <div className="text-center p-6">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">World App Required</h3>
        <p className="text-muted-foreground mb-4">
          Please open this app in World App to authenticate with your wallet.
        </p>
        <Button
          onClick={() => window.open('https://worldapp.com', '_blank')}
          variant="outline"
        >
          Download World App
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={signInWithWallet}
      disabled={isLoading}
      className="gap-2"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Shield className="w-4 h-4" />
      )}
      {isLoading ? "Authenticating..." : "Sign in with World ID"}
    </Button>
  )
}

