"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Clock, CheckCircle } from "lucide-react"

interface BookingDetails {
  id: string
  sellerName: string
  buyerName: string
  amount: number
  currency: string
  scheduledTime: string
  status: string
  sessionNotes?: string
}

interface FeedbackData {
  rating: number
  comment: string
  wouldRecommend: boolean
  tags: string[]
}

export default function FeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    comment: "",
    wouldRecommend: true,
    tags: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer")

  const availableTags = [
    "Knowledgeable",
    "Professional",
    "Helpful",
    "Clear Communication",
    "On Time",
    "Well Prepared",
    "Patient",
    "Insightful",
    "Responsive",
    "Exceeded Expectations",
  ]

  useEffect(() => {
    // Mock booking data - in real app, fetch from API
    const mockBooking: BookingDetails = {
      id: bookingId,
      sellerName: "Sarah Chen",
      buyerName: "John Doe",
      amount: 120,
      currency: "USDC",
      scheduledTime: "2024-01-15T14:00:00Z",
      status: "completed",
      sessionNotes: "Product design consultation for mobile app",
    }
    setBooking(mockBooking)

    // Determine user role (in real app, get from auth context)
    setUserRole("buyer") // Mock as buyer for demo
  }, [bookingId])

  const handleRatingClick = (rating: number) => {
    setFeedback((prev) => ({ ...prev, rating }))
  }

  const handleTagToggle = (tag: string) => {
    setFeedback((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsLoading(true)

    try {
      // TODO: Submit feedback to backend and smart contract
      console.log("Submitting feedback:", {
        bookingId,
        userRole,
        feedback,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitted(true)

      // Auto-redirect after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Feedback Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your feedback. Payment will be processed automatically.
            </p>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
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
            <h1 className="text-xl font-bold">Leave Feedback</h1>
            <p className="text-sm text-muted-foreground">
              Rate your session with {userRole === "buyer" ? booking.sellerName : booking.buyerName}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Session Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{userRole === "buyer" ? "Expert" : "Client"}</span>
              <span className="font-medium">{userRole === "buyer" ? booking.sellerName : booking.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{new Date(booking.scheduledTime).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ${booking.amount} {booking.currency}
              </span>
            </div>
            {booking.sessionNotes && (
              <div>
                <span className="text-muted-foreground">Notes: </span>
                <span className="font-medium">{booking.sessionNotes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
            <CardDescription>How would you rate this session?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= feedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            {feedback.rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {feedback.rating === 1 && "Poor - Not satisfied"}
                {feedback.rating === 2 && "Fair - Below expectations"}
                {feedback.rating === 3 && "Good - Met expectations"}
                {feedback.rating === 4 && "Very Good - Exceeded expectations"}
                {feedback.rating === 5 && "Excellent - Outstanding experience"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What went well?</CardTitle>
            <CardDescription>Select all that apply (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={feedback.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Written Feedback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Comments</CardTitle>
            <CardDescription>Share more details about your experience (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What did you like most? Any suggestions for improvement?"
              value={feedback.comment}
              onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Would you recommend?</CardTitle>
            <CardDescription>
              Would you recommend this {userRole === "buyer" ? "expert" : "client"} to others?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={feedback.wouldRecommend ? "default" : "outline"}
                onClick={() => setFeedback((prev) => ({ ...prev, wouldRecommend: true }))}
              >
                Yes, I would recommend
              </Button>
              <Button
                variant={!feedback.wouldRecommend ? "default" : "outline"}
                onClick={() => setFeedback((prev) => ({ ...prev, wouldRecommend: false }))}
              >
                No, I would not recommend
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || feedback.rating === 0} className="flex-1">
            {isLoading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>

        {/* Info */}
        <Card className="mt-6 bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Once both parties submit feedback (or after 7 days), payment will be automatically
              released from escrow to the expert. Your feedback helps maintain quality in our marketplace.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
