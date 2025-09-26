"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FeedbackDisplay } from "@/components/feedback-display"
import { Star, Shield, Clock, DollarSign } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  bio: string
  hourlyRate: number
  currency: string
  rating: number
  reviewCount: number
  expertise: string[]
  joinedDate: string
  completedSessions: number
}

interface Review {
  id: string
  rating: number
  comment: string
  tags: string[]
  reviewerName: string
  date: string
  wouldRecommend: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockProfile: UserProfile = {
      id: userId,
      name: "Sarah Chen",
      bio: "Product designer with 8+ years at top tech companies. I help startups build user-centered products that users love. My expertise spans UX research, design systems, and product strategy.",
      hourlyRate: 120,
      currency: "USDC",
      rating: 4.9,
      reviewCount: 47,
      expertise: ["Product Design", "UX Research", "Figma", "Design Systems", "Product Strategy"],
      joinedDate: "2023-06-15",
      completedSessions: 89,
    }

    const mockReviews: Review[] = [
      {
        id: "1",
        rating: 5,
        comment:
          "Sarah provided incredible insights into our product design challenges. Her expertise in design systems helped us create a more cohesive user experience.",
        tags: ["Knowledgeable", "Professional", "Insightful", "Well Prepared"],
        reviewerName: "Alex M.",
        date: "2024-01-10",
        wouldRecommend: true,
      },
      {
        id: "2",
        rating: 5,
        comment:
          "Excellent session! Sarah walked me through the entire UX research process and gave me actionable next steps for my project.",
        tags: ["Helpful", "Clear Communication", "Patient", "Exceeded Expectations"],
        reviewerName: "Maria L.",
        date: "2024-01-08",
        wouldRecommend: true,
      },
      {
        id: "3",
        rating: 4,
        comment:
          "Great consultation. Sarah was very knowledgeable and provided valuable feedback on our design approach.",
        tags: ["Knowledgeable", "Professional", "On Time"],
        reviewerName: "David K.",
        date: "2024-01-05",
        wouldRecommend: true,
      },
    ]

    setProfile(mockProfile)
    setReviews(mockReviews)
  }, [userId])

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{profile.rating}</span>
                        <span className="text-muted-foreground">({profile.reviewCount} reviews)</span>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Verified Human
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-2xl font-bold">
                      <DollarSign className="w-6 h-6" />
                      {profile.hourlyRate}
                    </div>
                    <div className="text-muted-foreground">{profile.currency}/hour</div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">{profile.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.expertise.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Joined: </span>
                    <span className="font-medium">{new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sessions: </span>
                    <span className="font-medium">{profile.completedSessions}</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-48 flex flex-col gap-3">
                <Button size="lg" className="w-full">
                  Book Session
                </Button>
                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Feedback</CardTitle>
            <CardDescription>What clients are saying about {profile.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackDisplay reviews={reviews} averageRating={profile.rating} totalReviews={profile.reviewCount} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
