"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Clock, DollarSign, Star, Shield, ExternalLink } from "lucide-react"

interface Seller {
  id: string
  name: string
  bio: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  rating: number
  reviewCount: number
  expertise: string[]
  calendlyUrl: string
}

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const sellerId = params.sellerId as string

  const [seller, setSeller] = useState<Seller | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    // Mock seller data - in real app, fetch from API
    const mockSeller: Seller = {
      id: sellerId,
      name: "Sarah Chen",
      bio: "Product designer with 8+ years at top tech companies. I help startups build user-centered products.",
      hourlyRate: 120,
      currency: "USDC",
      rating: 4.9,
      reviewCount: 47,
      expertise: ["Product Design", "UX Research", "Figma", "Design Systems"],
      calendlyUrl: "https://calendly.com/sarah-chen/consultation",
    }
    setSeller(mockSeller)
  }, [sellerId])

  const handleProceedToPayment = () => {
    if (!seller) return

    // Store booking details for payment flow
    const bookingDetails = {
      sellerId: seller.id,
      sellerName: seller.name,
      hourlyRate: seller.hourlyRate,
      currency: seller.currency,
      sessionNotes,
    }

    localStorage.setItem("pendingBooking", JSON.stringify(bookingDetails))
    router.push(`/payment/${sellerId}`)
  }

  const handleOpenCalendly = () => {
    if (seller?.calendlyUrl) {
      window.open(seller.calendlyUrl, "_blank")
    }
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading expert details...</p>
        </div>
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
            <h1 className="text-xl font-bold">Book Session</h1>
            <p className="text-sm text-muted-foreground">Secure your time with {seller.name}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Expert Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{seller.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{seller.rating}</span>
                        <span className="text-muted-foreground">({seller.reviewCount} reviews)</span>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-2xl font-bold">
                      <DollarSign className="w-5 h-5" />
                      {seller.hourlyRate}
                    </div>
                    <div className="text-sm text-muted-foreground">{seller.currency}/hour</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">{seller.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {seller.expertise.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Tell the expert what you'd like to discuss</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Session Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="What would you like to discuss? Any specific questions or goals for this session?"
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendly Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Your Session
                </CardTitle>
                <CardDescription>Book a time slot that works for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Ready to Schedule?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to open {seller.name}'s Calendly page and choose an available time
                  </p>
                  <Button onClick={handleOpenCalendly} className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Calendly
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Opens in a new tab</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expert</span>
                  <span className="font-medium">{seller.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    ${seller.hourlyRate}/{seller.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${seller.hourlyRate} {seller.currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <p className="text-muted-foreground">Payment held in secure escrow</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <p className="text-muted-foreground">Schedule via expert's Calendly page</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <p className="text-muted-foreground">Complete session & leave feedback</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">4</span>
                  </div>
                  <p className="text-muted-foreground">Payment released to expert</p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleProceedToPayment} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
