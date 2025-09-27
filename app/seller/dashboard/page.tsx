"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Calendar, DollarSign, Loader2, Settings, Star, TrendingUp} from "lucide-react"
import {useAuth} from "@/lib/hooks"
import {bookingService, peopleService} from "@/lib/services"
import type {BookingWithDetails} from "@/lib/domain-types"

interface SellerStats {
  totalEarnings: number
  completedSessions: number
  averageRating: number
  pendingBookings: number
}

export default function SellerDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<SellerStats>({
    totalEarnings: 0,
    completedSessions: 0,
    averageRating: 0,
    pendingBookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    loadDashboardData()
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Get person profile for this user
      const personResult = await peopleService.getPersonByUserId(user.id)
      if (!personResult.success || !personResult.data) {
        setError("Please complete your seller profile first")
        router.push("/seller/setup")
        return
      }

      const person = personResult.data

      // Get bookings for this person
      const bookingsResult = await bookingService.getPersonBookings(person.id)
      if (!bookingsResult.success) {
        setError("Failed to load bookings")
        return
      }

      const bookings = bookingsResult.data
      setRecentBookings(bookings.slice(0, 10)) // Show last 10 bookings

      // Calculate stats
      const completedBookings = bookings.filter(b => b.status === "completed")
      const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed")
      
      const totalEarnings = completedBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0)
      
      setStats({
        totalEarnings,
        completedSessions: completedBookings.length,
        averageRating: Number(person.average_rating || 0),
        pendingBookings: pendingBookings.length,
      })

    } catch (err) {
      console.error("Error loading dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'WLD' ? 'USD' : 'USD', // Map WLD to USD for display
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadDashboardData()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookings and earnings</p>
          </div>
          <Button className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings, 'USDC')}</div>
              <p className="text-xs text-muted-foreground">Total completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">Completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Pending bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest booking requests and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No bookings yet</p>
                      <p className="text-sm text-muted-foreground">Your bookings will appear here once clients start booking sessions</p>
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.profiles?.full_name || "Unknown Client"}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.scheduled_date 
                                ? new Date(booking.scheduled_date).toLocaleDateString() + " at " +
                                  new Date(booking.scheduled_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "No date scheduled"
                              }
                            </p>
                            {booking.session_notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                "{booking.session_notes.substring(0, 50)}{booking.session_notes.length > 50 ? "..." : ""}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(Number(booking.total_amount), booking.currency)}</p>
                            <p className="text-sm text-muted-foreground">1 hour session</p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Track your income and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Earnings chart will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>See what your clients are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Reviews section will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
