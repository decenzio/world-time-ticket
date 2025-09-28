"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {miniKit} from "@/lib/minikit"
import {Button} from "@/components/ui/button"
import {useAuth} from "@/lib/hooks"
import {bookingService} from "@/lib/services"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {AlertCircle, ArrowLeft, CheckCircle, Clock, DollarSign, Shield} from "lucide-react"
import {Tokens} from "@worldcoin/minikit-js"
import { ESCROW_CONTRACT_ADDRESS } from "@/lib/config"

interface BookingDetails {
  sellerId: string
  sellerName: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  sessionNotes: string
  scheduledDate?: string
  calendlyEventId?: string
}

interface PaymentState {
  status: "idle" | "processing" | "success" | "error"
  message?: string
  transactionHash?: string
  bookingId?: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<"WLD" | "USDC">("USDC")
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: "idle" })
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)

  useEffect(() => {
    // Load booking details from localStorage
    const savedBooking = localStorage.getItem("pendingBooking")
    if (savedBooking) {
      const bookingData = JSON.parse(savedBooking)
      setBooking(bookingData)
      setSelectedCurrency(bookingData.currency || "USDC")
    } else {
      // Redirect if no booking data
      router.push("/marketplace")
    }

    // Initialize MiniKit
    const initMiniKit = async () => {
      try {
        const available = await miniKit.initialize()
        setMiniKitAvailable(available)
      } catch (error) {
        console.error("Failed to initialize MiniKit:", error)
        setMiniKitAvailable(false)
      }
    }
    
    // Properly handle the async call
    initMiniKit().catch((error) => {
      console.error("Failed to initialize MiniKit:", error)
      setMiniKitAvailable(false)
    })
  }, [router])

  const handlePayment = async () => {
    if (!booking || !miniKitAvailable || !user) {
      alert("Please open this app in World App")
      return
    }

    setPaymentState({ status: "processing", message: "Initiating payment..." })

    try {
      // Step 1: Create booking record in Supabase and get booking ID
      setPaymentState({ status: "processing", message: "Creating secure escrow..." })

      const createRes = await bookingService.createBooking({
        client_id: user.id,
        person_id: booking.sellerId, // sellerId must be a people.id
        session_notes: booking.sessionNotes,
        hourly_rate: booking.hourlyRate,
        currency: booking.currency,
        total_amount: booking.hourlyRate, // 1 hour session
        ...(booking.scheduledDate ? { scheduled_date: booking.scheduledDate } : {}),
        ...(booking.calendlyEventId ? { calendly_event_id: booking.calendlyEventId } : {}),
      })
      if (!createRes.success) {
        setPaymentState({
          status: "error",
          message: createRes.error?.message || "Failed to create booking",
        })
        return
      }
      if (!createRes.data) {
        setPaymentState({
          status: "error",
          message: "Failed to create booking - no data returned",
        })
        return
      }
      const createdBooking = createRes.data

      // Step 2: Initiate MiniKit Pay
      setPaymentState({ status: "processing", message: "Processing payment..." })

      const paymentResponse = await miniKit.pay({
        reference: createdBooking.id,
        to: ESCROW_CONTRACT_ADDRESS,
        tokens: [
          {
            symbol: selectedCurrency === "WLD" ? Tokens.WLD : Tokens.USDC,
            token_amount: booking.hourlyRate.toString(),
          },
        ],
        description: `WorldTimeTicket booking with ${booking.sellerName}`,
      })

      if (paymentResponse.success) {
        // Step 3: Confirm payment and finalize booking
        setPaymentState({
          status: "processing",
          message: "Confirming transaction...",
        })

        // Simulate transaction confirmation
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setPaymentState({
          status: "success",
          message: "Payment successful! Booking confirmed.",
          transactionHash: paymentResponse.transaction_id,
          bookingId: createdBooking.id,
        })

        // Mark booking confirmed
        await bookingService.updateBookingStatus(createdBooking.id, "confirmed", user.id)

        // Clear pending booking
        localStorage.removeItem("pendingBooking")

        // Auto-redirect to booking confirmation
        setTimeout(() => {
          router.push(`/booking-confirmation/${createdBooking.id}`)
        }, 3000)
      } else {
        setPaymentState({
          status: "error",
          message: paymentResponse.error_code || "Payment failed",
        })
        return
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentState({
        status: "error",
        message: error instanceof Error ? error.message : "Payment failed. Please try again.",
      })
    }
  }

  const handleRetry = () => {
    setPaymentState({ status: "idle" })
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (paymentState.status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">{paymentState.message}</p>
            {paymentState.bookingId && (
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium">Booking ID</p>
                <p className="text-xs text-muted-foreground font-mono">{paymentState.bookingId}</p>
              </div>
            )}
            <Button onClick={() => router.push("/dashboard")}>View My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentState.status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground mb-4">{paymentState.message}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Secure Payment</h1>
            <p className="text-sm text-muted-foreground">Complete your booking with {booking.sellerName}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Escrow Payment
            </CardTitle>
            <CardDescription>Your payment is held securely until the session is completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Person</span>
              <span className="font-medium">{booking.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Duration</span>
              <span className="font-medium">1 hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">
                ${booking.hourlyRate}/{booking.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (2.5%)</span>
              <span className="font-medium">${(booking.hourlyRate * 0.025).toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>
                ${(booking.hourlyRate * 1.025).toFixed(2)} {selectedCurrency}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Currency Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose your preferred currency</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCurrency} onValueChange={(value: "WLD" | "USDC") => setSelectedCurrency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                    USDC (USD Coin)
                  </div>
                </SelectItem>
                <SelectItem value="WLD">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded-full" />
                    WLD (Worldcoin)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Session Notes */}
        {booking.sessionNotes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{booking.sessionNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* How Escrow Works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">How Secure Escrow Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <p className="text-muted-foreground">Your payment is held securely in smart contract escrow</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <p className="text-muted-foreground">Schedule your session through Calendly integration</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <p className="text-muted-foreground">Complete your session and leave feedback</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">4</span>
              </div>
              <p className="text-muted-foreground">Payment automatically released to person after feedback</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={paymentState.status === "processing" || !miniKitAvailable}
            className="w-full"
            size="lg"
          >
            {paymentState.status === "processing" ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                {paymentState.message}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {miniKitAvailable
                  ? `Pay $${(booking?.hourlyRate * 1.025).toFixed(2)} ${selectedCurrency}`
                  : "Open in World App"}
              </div>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secured by World App & Smart Contract Escrow</span>
          </div>
        </div>
      </div>
    </div>
  )
}
