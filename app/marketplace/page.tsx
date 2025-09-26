"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, DollarSign, Search, Star, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface Seller {
  id: string
  name: string
  bio: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  rating: number
  reviewCount: number
  expertise: string[]
  availability: string
  profileImage?: string
}

export default function MarketplacePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

  const [sellers] = useState<Seller[]>([
    {
      id: "1",
      name: "Sarah Chen",
      bio: "Product designer with 8+ years at top tech companies. I help startups build user-centered products.",
      hourlyRate: 120,
      currency: "USDC",
      rating: 4.9,
      reviewCount: 47,
      expertise: ["Product Design", "UX Research", "Figma", "Design Systems"],
      availability: "Available this week",
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      bio: "Full-stack developer specializing in React, Node.js, and cloud architecture. Let's build something amazing.",
      hourlyRate: 95,
      currency: "USDC",
      rating: 4.8,
      reviewCount: 32,
      expertise: ["React", "Node.js", "AWS", "TypeScript"],
      availability: "Available today",
    },
    {
      id: "3",
      name: "Dr. Emily Watson",
      bio: "Business strategy consultant with MBA from Wharton. I help companies scale and optimize operations.",
      hourlyRate: 200,
      currency: "USDC",
      rating: 5.0,
      reviewCount: 28,
      expertise: ["Business Strategy", "Operations", "MBA Consulting", "Scaling"],
      availability: "Available next week",
    },
    {
      id: "4",
      name: "Alex Kim",
      bio: "Marketing growth expert who's helped 50+ startups achieve product-market fit and scale their user base.",
      hourlyRate: 85,
      currency: "WLD",
      rating: 4.7,
      reviewCount: 61,
      expertise: ["Growth Marketing", "SEO", "Content Strategy", "Analytics"],
      availability: "Available this week",
    },
    {
      id: "5",
      name: "Jennifer Liu",
      bio: "Data scientist with expertise in ML, AI, and analytics. I turn data into actionable business insights.",
      hourlyRate: 110,
      currency: "USDC",
      rating: 4.9,
      reviewCount: 39,
      expertise: ["Data Science", "Machine Learning", "Python", "Analytics"],
      availability: "Available tomorrow",
    },
    {
      id: "6",
      name: "David Thompson",
      bio: "Legal advisor specializing in startup law, contracts, and intellectual property. Protect your business.",
      hourlyRate: 250,
      currency: "USDC",
      rating: 4.8,
      reviewCount: 22,
      expertise: ["Legal Advice", "Contracts", "IP Law", "Startup Law"],
      availability: "Available next week",
    },
  ])

  const categories = ["all", "Design", "Development", "Business", "Marketing", "Data Science", "Legal"]

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.expertise.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" ||
      seller.expertise.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()))

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "under-100" && seller.hourlyRate < 100) ||
      (priceRange === "100-200" && seller.hourlyRate >= 100 && seller.hourlyRate <= 200) ||
      (priceRange === "over-200" && seller.hourlyRate > 200)

    return matchesSearch && matchesCategory && matchesPrice
  })

  const handleBookSeller = (sellerId: string) => {
    router.push(`/booking/${sellerId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Expert Marketplace</h1>
            </div>
          </div>

          <Badge variant="secondary" className="gap-2">
            <Users className="w-3 h-3" />
            {filteredSellers.length} Experts
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, skills, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-100">Under $100/hr</SelectItem>
              <SelectItem value="100-200">$100-200/hr</SelectItem>
              <SelectItem value="over-200">Over $200/hr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid gap-6">
          {filteredSellers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No experts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredSellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Profile Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{seller.name}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{seller.rating}</span>
                              <span className="text-muted-foreground">({seller.reviewCount} reviews)</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {seller.availability}
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

                      <p className="text-muted-foreground mb-4 leading-relaxed">{seller.bio}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {seller.expertise.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:w-48">
                      <Button onClick={() => handleBookSeller(seller.id)} className="w-full">
                        Book Session
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredSellers.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Experts</Button>
          </div>
        )}
      </div>
    </div>
  )
}
