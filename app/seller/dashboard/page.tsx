"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Settings, Star, TrendingUp } from "lucide-react"

interface Booking {
  id: string
  buyerName: string
  date: string
  duration: number
  amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

interface SellerStats {
  totalEarnings: number
  completedSessions: number
  averageRating: number
  pendingBookings: number
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats>({
    totalEarnings: 2450,
    completedSessions: 28,
    averageRating: 4.9,
    pendingBookings: 3,
  })

  const [recentBookings] = useState<Booking[]>([
    {
      id: "1",
      buyerName: "Alice Johnson",
      date: "2024-01-15T14:00:00Z",
      duration: 60,
      amount: 75,
      status: "confirmed",
    },
    {
      id: "2",
      buyerName: "Bob Smith",
      date: "2024-01-16T10:00:00Z",
      duration: 30,
      amount: 50,
      status: "pending",
    },
    {
      id: "3",
      buyerName: "Carol Davis",
      date: "2024-01-14T16:00:00Z",
      duration: 90,
      amount: 120,
      status: "completed",
    },
  ])

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
              <div className="text-2xl font-bold">${stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">From 24 reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
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
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.buyerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()} at{" "}
                            {new Date(booking.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${booking.amount}</p>
                          <p className="text-sm text-muted-foreground">{booking.duration} min</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                    </div>
                  ))}
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
