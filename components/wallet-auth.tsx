"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Wallet, Loader2 } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useRouter } from "next/navigation"

interface WalletAuthProps {
  onError?: (error: string) => void
  onSuccess?: () => void
}

export function WalletAuth({ onError, onSuccess }: WalletAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  useEffect(() => {
    // Check if MiniKit is available
    const checkMiniKit = () => {
      try {
        const available = MiniKit.isInstalled()
        console.log('MiniKit availability check:', available)
        setIsInstalled(available)
        
        if (available) {
          console.log('MiniKit is available!')
        } else {
          console.log('MiniKit not available, checking again...')
        }
      } catch (error) {
        console.error('Error checking MiniKit:', error)
        setIsInstalled(false)
      }
    }

    // Initial check
    checkMiniKit()
    
    // Check periodically for MiniKit availability
    const interval = setInterval(checkMiniKit, 2000)
    return () => clearInterval(interval)
  }, [])

  const signInWithWallet = async () => {
    console.log('=== Starting Wallet Authentication ===')
    
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit not installed')
      onError?.("World App not detected. Please open this app in World App.")
      return
    }

    console.log('MiniKit is installed, proceeding with authentication')
    setIsLoading(true)
    
    try {
      // Get nonce from our API
      console.log('Step 1: Getting nonce from API...')
      const res = await fetch("/api/nonce")
      
      if (!res.ok) {
        throw new Error(`Failed to get nonce: ${res.status} ${res.statusText}`)
      }
      
      const { nonce } = await res.json()
      console.log('Step 1: Got nonce:', nonce)

      // Use MiniKit for wallet authentication
      console.log('Step 2: Calling MiniKit walletAuth...')
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to WorldTimeTicket to access the marketplace and book time with verified humans.',
      })

      console.log('Step 2: Wallet auth response:', finalPayload)

      if (finalPayload.status === 'error') {
        console.error('Wallet auth error:', finalPayload.error)
        throw new Error(finalPayload.error || 'Authentication failed')
      }

      // Verify the SIWE message
      console.log('Step 3: Verifying SIWE message...')
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

      console.log('Step 3: SIWE verification response status:', response.status)
      const verificationResult = await response.json()
      console.log('Step 3: SIWE verification result:', verificationResult)

      if (!verificationResult.isValid) {
        console.error('SIWE verification failed:', verificationResult.message)
        throw new Error(verificationResult.message || 'Verification failed')
      }

      // Get user info from MiniKit if available
      console.log('Step 4: Getting user info from MiniKit...')
      let userInfo = {}
      try {
        if (MiniKit.getUserByAddress) {
          userInfo = await MiniKit.getUserByAddress(finalPayload.address)
          console.log('Step 4: User info from MiniKit:', userInfo)
        } else {
          console.log('Step 4: getUserByAddress not available')
        }
      } catch (error) {
        console.warn('Step 4: Could not get user info from MiniKit:', error)
      }
      
      // Sign in with NextAuth using the wallet address and user info
      console.log('Step 5: Signing in with NextAuth...')
      console.log('Step 5: Wallet address:', finalPayload.address)
      console.log('Step 5: User info:', userInfo)
      
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
      
      console.log('Step 5: NextAuth signIn result:', signInResult)

      if (signInResult?.error) {
        console.error('NextAuth signIn error:', signInResult.error)
        throw new Error(signInResult.error)
      }

      // Successful login - trigger callbacks
      console.log('Step 6: Authentication successful! Triggering callbacks...')
      onSuccess?.()
      console.log('=== Wallet Authentication Complete ===')
    } catch (error) {
      console.error('=== Wallet Authentication Failed ===')
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
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

