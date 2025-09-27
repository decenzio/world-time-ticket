"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {useSession} from "next-auth/react"
import {statisticsService} from "@/lib/services"
import {Button} from "@/components/ui/button"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {AuthButton} from "@/components/auth-button"
import {ArrowLeft, Bug, Clock, Plus, Shield, Star, User, Users} from "lucide-react"
import {MiniKit} from "@worldcoin/minikit-js"

interface PlatformStats {
  verifiedPeople: number
  averageRating: number
  sessionsBooked: number
  successRate: number
}

type AppView = 'home' | 'marketplace' | 'seller-setup' | 'profile'

export default function MiniApp() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

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
    // Fetch platform statistics
    fetchStats()
  }, [])

  useEffect(() => {
    // Update authentication state based on session
    setIsAuthenticated(!!session?.user)
    console.log('MiniApp - Session status:', status, 'Authenticated:', !!session?.user)
  }, [session, status])

  const handleAuthSuccess = () => {
    console.log('MiniApp - Authentication successful')
    setAuthError(null)
    setIsAuthenticated(true)
    setCurrentView('home')
    setDebugInfo(prev => [...prev, 'Authentication successful'])
  }

  const handleAuthError = (error: string) => {
    console.error('MiniApp - Authentication error:', error)
    setAuthError(error)
    setDebugInfo(prev => [...prev, `Authentication error: ${error}`])
  }

  const testMiniKit = () => {
    try {
      const isInstalled = MiniKit.isInstalled()
      setDebugInfo(prev => [...prev, `MiniKit test: ${isInstalled ? 'Available' : 'Not available'}`])
      console.log('MiniKit test result:', isInstalled)
    } catch (error) {
      setDebugInfo(prev => [...prev, `MiniKit test error: ${error}`])
      console.error('MiniKit test error:', error)
    }
  }

  const navigateToView = (view: AppView) => {
    setCurrentView(view)
  }

  const renderView = () => {
    if (!isAuthenticated) {
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
                <AuthButton onSuccess={handleAuthSuccess} onError={handleAuthError} />
                
                {authError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                    <p className="font-semibold">Authentication Error:</p>
                    <p className="text-sm">{authError}</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testMiniKit}
                  className="gap-2"
                >
                  <Bug className="w-4 h-4" />
                  Test MiniKit
                </Button>
                
                {debugInfo.length > 0 && (
                  <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded max-w-md max-h-32 overflow-y-auto">
                    <p className="font-semibold text-xs">Debug Info:</p>
                    {debugInfo.map((info, index) => (
                      <p key={index} className="text-xs">{info}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle>Human Verified</CardTitle>
                  <CardDescription>All users verified through World ID</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
                  <CardTitle>Easy Booking</CardTitle>
                  <CardDescription>Seamless scheduling integration</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Star className="w-12 h-12 text-success mx-auto mb-4" />
                  <CardTitle>Secure Payments</CardTitle>
                  <CardDescription>Escrow-protected payments</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'marketplace':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigateToView('home')}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-xl font-bold">Marketplace</h1>
                </div>
                <AuthButton />
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Find People</h2>
                <p className="text-muted-foreground mb-8">
                  Browse verified people offering their time and expertise
                </p>
                <Button onClick={() => router.push('/marketplace')}>
                  Open Full Marketplace
                </Button>
              </div>
            </main>
          </div>
        )

      case 'seller-setup':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigateToView('home')}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-xl font-bold">Become a Seller</h1>
                </div>
                <AuthButton />
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              <div className="text-center py-16">
                <Plus className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Offer Your Time</h2>
                <p className="text-muted-foreground mb-8">
                  Create your profile and start earning from your expertise
                </p>
                <Button onClick={() => router.push('/seller/setup')}>
                  Set Up Seller Profile
                </Button>
              </div>
            </main>
          </div>
        )

      default: // home
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
                    {session?.user?.verificationLevel === "orb" ? "Orb Verified" : "Wallet Verified"}
                  </Badge>
                  <AuthButton />
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <User className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Welcome, {session?.user?.username || 'User'}!</h2>
                </div>
                <p className="text-muted-foreground mb-8">
                  You're verified with World ID! Ready to explore the marketplace or offer your time?
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToView('marketplace')}>
                    <div className="text-center">
                      <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Browse Marketplace</h3>
                      <p className="text-muted-foreground mb-4">Find people offering their time and book sessions</p>
                      <Button className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Explore People
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToView('seller-setup')}>
                    <div className="text-center">
                      <Plus className="w-12 h-12 text-accent mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Offer Your Time</h3>
                      <p className="text-muted-foreground mb-4">Create your profile and start earning from your expertise</p>
                      <Button variant="outline" className="w-full">
                        <Clock className="w-4 h-4 mr-2" />
                        Become a Seller
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Mini App...</p>
        </div>
      </div>
    )
  }

  return renderView()
}