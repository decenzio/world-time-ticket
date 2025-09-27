"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, Wallet } from "lucide-react"
import { WalletAuth } from "./wallet-auth"

interface AuthButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function AuthButton({ onSuccess, onError }: AuthButtonProps = {}) {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  if (loading) {
    return (
      <Button disabled>
        <Shield className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">
            {session.user.username || session.user.walletAddress || "User"}
          </div>
          <div className="text-xs text-muted-foreground">
            {session.user.verificationLevel === "orb" ? "Orb Verified" : "Wallet Verified"}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <WalletAuth 
      onSuccess={() => {
        console.log('Authentication successful!')
        onSuccess?.()
      }}
      onError={(error) => {
        console.error('Authentication error:', error)
        onError?.(error)
      }}
    />
  )
}
