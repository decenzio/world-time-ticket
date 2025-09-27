"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {FeedbackDisplay} from "@/components/feedback-display"
import {Clock, DollarSign, Shield, Star} from "lucide-react"
import {peopleService, reviewService} from "@/lib/services"

interface UserProfile {
  id: string
  name: string
  bio: string
  hourlyRate: number
  currency: string
  rating: number
  reviewCount: number
  skills: string[]
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
    let mounted = true
    // userId here is a people.id per route naming; if it's a profile id, consider using getPersonByUserId
    peopleService.getPersonById(userId).then((res) => {
      if (!mounted) return
      if (res.success && res.data) {
        const p = res.data
        setProfile({
          id: p.id,
          name: p.profiles?.full_name || "Unnamed",
          bio: p.profiles?.bio || "",
          hourlyRate: p.hourly_rate,
          currency: p.currency,
          rating: Number(p.average_rating || 0),
          reviewCount: p.total_reviews || 0,
          skills: p.skills || [],
          joinedDate: p.created_at,
          completedSessions: p.total_reviews || 0,
        })
      }
    })
    reviewService.getPersonReviews(userId).then((res) => {
      if (!mounted) return
      if (res.success && res.data) {
        const mapped: Review[] = res.data.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment || "",
          tags: r.tags || [],
          reviewerName: r.profiles?.full_name || "",
          date: r.created_at,
          wouldRecommend: (r.tags || []).includes("Would Recommend"),
        }))
        setReviews(mapped)
      }
    })
    return () => {
      mounted = false
    }
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
                  {profile.skills.map((tag) => (
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
