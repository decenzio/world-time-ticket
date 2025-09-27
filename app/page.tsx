"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { miniKit } from "@/lib/minikit"
import { VerificationLevel } from '@worldcoin/minikit-js'
import { statisticsService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, Star, Users } from "lucide-react"

interface User {
  id: string
  worldId: string
  isVerified: boolean
}

interface PlatformStats {
  verifiedPeople: number
  averageRating: number
  sessionsBooked: number
  successRate: number
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  const fetchStats = async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const result = await statisticsService.getPlatformStats()
      if (result.success) {
        setStats(result.data)
      } else {
        setStatsError(result.error.message)
      }
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Failed to fetch statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("timeSlot_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const devMode = localStorage.getItem("timeSlot_dev_mode") === "true"
    setIsDevelopmentMode(devMode)

    const initMiniKit = async () => {
      const available = await miniKit.initialize()
      setMiniKitAvailable(available)
      
      // If we're in World App, automatically try to authenticate
      if (available && miniKit.isInWorldApp()) {
        console.log("Running in World App - attempting auto-authentication")
        // Don't auto-auth, let user manually trigger it
      }
    }
    initMiniKit()

    // Fetch platform statistics
    fetchStats()
  }, [])

  const handleDevLogin = () => {
    const testUser: User = {
      id: "dev-user-123",
      worldId: "dev-user-123",
      isVerified: true,
    }

    setUser(testUser)
    localStorage.setItem("timeSlot_user", JSON.stringify(testUser))
    console.log("Development mode: User logged in", testUser)
  }

  const toggleDevelopmentMode = () => {
    const newMode = !isDevelopmentMode
    setIsDevelopmentMode(newMode)
    localStorage.setItem("timeSlot_dev_mode", newMode.toString())

    if (!newMode) {
      handleLogout()
    }
  }

  const handleWorldIDAuth = async () => {
    if (!miniKitAvailable) {
      alert("Please open this app in World App")
      return
    }

    setIsLoading(true)
    try {
      const response = await miniKit.verify({
        action: "verify-human",
        signal: "timeslot-marketplace-auth",
        verification_level: VerificationLevel.Orb,
      })

      if (response.success) {
        const newUser: User = {
          id: response.nullifier_hash || response.merkle_root || "unknown",
          worldId: response.nullifier_hash || response.merkle_root || "unknown",
          isVerified: true,
        }

        setUser(newUser)
        localStorage.setItem("timeSlot_user", JSON.stringify(newUser))

        console.log("User verified:", newUser)
      } else {
        throw new Error(response.error || "Verification failed")
      }
    } catch (error) {
      console.error("World ID verification failed:", error)
      alert("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("timeSlot_user")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Verified Human Network
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Sell Your Time,
              <br />
              <span className="text-primary">Share Your Time</span>
            </h1>

            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
              Connect with verified people on World App. Book time slots, chat sessions, and casual
              services with secure escrow payments.
            </p>

            <div className="flex flex-col items-center gap-4">
              {miniKitAvailable ? (
                <Button
                  onClick={handleWorldIDAuth}
                  disabled={isLoading}
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  {isLoading ? "Verifying..." : "Verify with World ID"}
                </Button>
              ) : (
                <div className="text-center">
                  <div className="text-lg text-muted-foreground mb-2">
                    Open in World App to continue
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This app requires World App for authentication
                  </div>
                </div>
              )}
              
              {miniKitAvailable && miniKit.isInWorldApp() && (
                <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  ✓ Running in World App
                </div>
              )}

              {isDevelopmentMode && (
                <Button
                  onClick={handleDevLogin}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-dashed bg-transparent"
                >
                  Continue as Test User (Dev Mode)
                </Button>
              )}

              <Button
                onClick={toggleDevelopmentMode}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                {isDevelopmentMode ? "Disable" : "Enable"} Development Mode
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Human Verified</CardTitle>
                <CardDescription>All users verified through World ID orb verification</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>Seamless Calendly integration for scheduling</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="w-12 h-12 text-success mx-auto mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>Escrow-protected payments with feedback system</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">WorldTimeTicket</h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-2">
              <Shield className="w-3 h-3" />
              {isDevelopmentMode ? "Test User" : "Verified Human"}
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to WorldTimeTicket</h2>
          <p className="text-muted-foreground mb-8">
            You're verified! Ready to explore the marketplace or become a seller?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => router.push("/marketplace")}>
              <Users className="w-5 h-5" />
              Browse People
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-transparent"
              onClick={() => router.push("/seller/setup")}
            >
              <Clock className="w-5 h-5" />
              Become a Seller
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? (
                <div className="animate-pulse bg-muted h-8 w-16 mx-auto rounded"></div>
              ) : statsError ? (
                <span className="text-destructive">--</span>
              ) : (
                stats?.verifiedPeople.toLocaleString() || "0"
              )}
            </div>
            <div className="text-sm text-muted-foreground">Verified People</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? (
                <div className="animate-pulse bg-muted h-8 w-12 mx-auto rounded"></div>
              ) : statsError ? (
                <span className="text-destructive">--</span>
              ) : (
                stats?.averageRating.toFixed(1) || "0.0"
              )}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-success">
              {statsLoading ? (
                <div className="animate-pulse bg-muted h-8 w-20 mx-auto rounded"></div>
              ) : statsError ? (
                <span className="text-destructive">--</span>
              ) : (
                stats?.sessionsBooked.toLocaleString() || "0"
              )}
            </div>
            <div className="text-sm text-muted-foreground">Sessions Booked</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? (
                <div className="animate-pulse bg-muted h-8 w-12 mx-auto rounded"></div>
              ) : statsError ? (
                <span className="text-destructive">--</span>
              ) : (
                `${stats?.successRate || 0}%`
              )}
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </Card>
        </div>

        {statsError && (
          <div className="mt-4 text-center">
            <p className="text-sm text-destructive mb-2">Failed to load statistics</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              disabled={statsLoading}
            >
              {statsLoading ? "Retrying..." : "Retry"}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
