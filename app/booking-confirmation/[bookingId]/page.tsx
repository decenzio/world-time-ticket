"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ArrowRight, Calendar, CheckCircle, Clock, ExternalLink} from "lucide-react"
import {bookingService} from "@/lib/services"

interface BookingConfirmation {
  id: string
  sellerName: string
  amount: number
  currency: string
  status: string
  createdAt: string
  calendlyUrl: string
}

export default function BookingConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingConfirmation | null>(null)

  useEffect(() => {
    let mounted = true
    bookingService.getBookingById(bookingId).then((res) => {
      if (!mounted) return
      if (res.success && res.data) {
        const b = res.data
        setBooking({
          id: b.id,
          sellerName: b.person?.profiles?.full_name || "Unknown",
          amount: b.total_amount,
          currency: b.currency,
          status: b.status,
          createdAt: b.created_at,
          calendlyUrl: b.person?.calendly_url || "",
        })
      }
    })
    return () => {
      mounted = false
    }
  }, [bookingId])

  const handleOpenCalendly = () => {
    if (booking?.calendlyUrl) {
      window.open(booking.calendlyUrl, "_blank")
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading booking confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your payment has been secured in escrow</p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Confirmation #{booking.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Person</span>
              <span className="font-medium">{booking.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">
                ${booking.amount} {booking.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary">Payment Confirmed</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{new Date(booking.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Next: Schedule Your Session
            </CardTitle>
            <CardDescription>Choose a time that works for both you and {booking.sellerName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Schedule?</h3>
              <p className="text-muted-foreground mb-4">
                Click below to open {booking.sellerName}'s Calendly page and choose an available time
              </p>
              <Button onClick={handleOpenCalendly} size="lg" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Calendly
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Opens in a new tab</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100 text-sm">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• Your payment is held securely in escrow until the session is completed</p>
            <p>• You can cancel and receive a full refund before the scheduled session time</p>
            <p>• After the session, both parties will be asked to leave feedback</p>
            <p>• Payment will be released to the person once feedback is submitted</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex-1">
            View My Bookings
          </Button>
          <Button onClick={() => router.push("/marketplace")} className="flex-1 gap-2">
            Browse More People
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
