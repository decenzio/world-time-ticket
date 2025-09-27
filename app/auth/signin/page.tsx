"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { WalletAuth } from "@/components/wallet-auth"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Sign in to WorldTimeTicket</CardTitle>
          <CardDescription>
            Connect your wallet to access the marketplace and book time with verified humans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WalletAuth 
            onSuccess={() => {
              console.log('Login successful on signin page, redirecting to home')
              router.push('/')
            }}
            onError={(error) => {
              console.error('Login failed on signin page:', error)
            }}
          />
          
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
