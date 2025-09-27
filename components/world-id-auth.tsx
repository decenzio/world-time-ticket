"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"
import { miniKit } from "@/lib/minikit"
import { VerificationLevel } from '@worldcoin/minikit-js'

interface WorldIDAuthProps {
  onSuccess: (proof: any) => void
  onError: (error: string) => void
  action?: string
  signal?: string
}

export function WorldIDAuth({ onSuccess, onError, action, signal }: WorldIDAuthProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationData, setVerificationData] = useState<any>(null)
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)

  useEffect(() => {
    const initMiniKit = async () => {
      const available = await miniKit.initialize()
      setMiniKitAvailable(available)
    }
    initMiniKit()
  }, [])

  const handleVerify = async () => {
    if (!miniKitAvailable) {
      onError("World App not detected. Please open this app in World App.")
      return
    }

    setIsVerifying(true)

    try {
      // Use the action ID from environment variables or fallback to default
      const actionId = action || process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || "verify-human"
      
      const payload = {
        action: actionId,
        signal,
        verification_level: VerificationLevel.Orb, // Require orb verification for marketplace
      }

      const result = await miniKit.verify(payload)

      if (result.success) {
        setIsVerified(true)
        setVerificationData(result)
        onSuccess(result)
      } else {
        throw new Error(result.error || "Verification failed")
      }
    } catch (error) {
      console.error("World ID verification failed:", error)
      onError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  if (!miniKitAvailable) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">World App Required</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            This app requires World App to verify your identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-600">
            Please open this link in the World App to continue with verification.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isVerified && verificationData) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-800">Verified Human</CardTitle>
          </div>
          <CardDescription className="text-green-700">Your identity has been verified with World ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Orb Verified
            </Badge>
            <span className="text-sm text-green-600">Proof of personhood confirmed</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Verify Your Identity
        </CardTitle>
        <CardDescription>Prove you're a unique human with World ID to access the marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
          {isVerifying ? "Verifying..." : "Verify with World ID"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">This will open World ID verification in World App</p>
      </CardContent>
    </Card>
  )
}
