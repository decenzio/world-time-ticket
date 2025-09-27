"use client"

import {useEffect, useState, useRef} from "react"
import {useParams, useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {ArrowLeft, Calendar, Clock, DollarSign, ExternalLink, Shield, Star} from "lucide-react"
import {peopleService} from "@/lib/services"

interface Seller {
  id: string
  name: string
  bio: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  rating: number
  reviewCount: number
  skills: string[]
  calendlyUrl: string
}

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const sellerId = params.sellerId as string

  const [seller, setSeller] = useState<Seller | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [isLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    peopleService.getPersonById(sellerId).then((res) => {
      if (!mounted) return
      if (res.success && res.data) {
        const p = res.data
        setSeller({
          id: p.id,
          name: p.profiles?.full_name || "Unnamed",
          bio: p.profiles?.bio || "",
          hourlyRate: p.hourly_rate,
          currency: p.currency,
          rating: Number(p.average_rating || 0),
          reviewCount: p.total_reviews || 0,
          skills: p.skills || [],
          calendlyUrl: p.calendly_url || "",
        })
      }
    })
    return () => {
      mounted = false
    }
  }, [sellerId])

  // Load Calendly widget script and handle event when a time is scheduled
  useEffect(() => {
    if (!seller?.calendlyUrl) return

    const cssHref = "https://assets.calendly.com/assets/external/widget.css"
    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = cssHref
      document.head.appendChild(link)
    }

    const scriptSrc = "https://assets.calendly.com/assets/external/widget.js"
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement("script")
      script.src = scriptSrc
      script.async = true
      document.body.appendChild(script)
    }

    const handleCalendlyMessage = async (e: MessageEvent) => {
      const data: any = (e && (e as any).data) || null
      if (!data || data.event !== "calendly.event_scheduled") return

      try {
        let calendlyEventId: string | undefined
        let scheduledDate: string | undefined

        // Try mock API to get structured event payload in development
        try {
          const res = await fetch("/api/calendly", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uri: data?.payload?.event?.uri,
              invitee_name: data?.payload?.invitee?.name,
            }),
          })
          if (res.ok) {
            const json = await res.json()
            calendlyEventId = json?.event?.id
            scheduledDate = json?.event?.start_time
          }
        } catch (err) {
          // ignore mock failures in production
        }

        // Fallback: derive event id from Calendly URIs if present
        if (!calendlyEventId) {
          const uri: string | undefined = data?.payload?.event?.uri || data?.payload?.invitee?.uri
          if (uri) {
            calendlyEventId = uri.split("/").pop()
          }
        }

        const existing = localStorage.getItem("pendingBooking")
        const pending = existing ? JSON.parse(existing) : {}
        const updated = {
          ...pending,
          calendlyEventId,
          scheduledDate,
        }
        localStorage.setItem("pendingBooking", JSON.stringify(updated))

        // Navigate user to payment
        router.push(`/payment/${sellerId}`)
      } catch (error) {
        console.error("Calendly schedule handler error:", error)
      }
    }

    window.addEventListener("message", handleCalendlyMessage)
    return () => window.removeEventListener("message", handleCalendlyMessage)
  }, [seller?.calendlyUrl, router, sellerId])

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
          <p className="text-muted-foreground">Loading person details...</p>
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
          {/* Person Info */}
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
                  {seller.skills.map((tag) => (
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
                <CardDescription>Tell the person what you'd like to discuss</CardDescription>
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
                {seller.calendlyUrl ? (
                  <div className="space-y-4">
                    <div
                      className="calendly-inline-widget"
                      data-url={seller.calendlyUrl}
                      style={{ minWidth: "320px", height: "700px" }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Scheduling powered by Calendly. Once scheduled, you'll be taken to payment.
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    This person has not set a Calendly URL.
                  </div>
                )}
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
                  <span className="text-muted-foreground">Person</span>
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
                  <p className="text-muted-foreground">Schedule via person's Calendly page</p>
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
                  <p className="text-muted-foreground">Payment released to person</p>
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
