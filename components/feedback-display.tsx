"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string
  tags: string[]
  reviewerName: string
  date: string
  wouldRecommend: boolean
}

interface FeedbackDisplayProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function FeedbackDisplay({ reviews, averageRating, totalReviews }: FeedbackDisplayProps) {
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const distribution = getRatingDistribution()

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">{totalReviews} reviews</div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-3">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${totalReviews > 0 ? (distribution[rating as keyof typeof distribution] / totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.reviewerName}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</div>
                </div>
                {review.wouldRecommend && (
                  <Badge variant="secondary" className="text-xs">
                    Recommends
                  </Badge>
                )}
              </div>

              {review.comment && <p className="text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>}

              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No reviews yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
