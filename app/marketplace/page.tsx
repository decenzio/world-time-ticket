"use client"

import {useMemo, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowLeft, Clock, DollarSign, Search, Star, Users} from "lucide-react"
import {useRouter} from "next/navigation"
import {usePeople} from "@/lib/hooks"

interface SellerCardData {
  id: string
  name: string
  bio: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  rating: number
  reviewCount: number
  skills: string[]
  availability: string
  profileImage?: string
}

export default function MarketplacePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

  const { people, loading } = usePeople()

  const categories = ["all", "Design", "Development", "Business", "Marketing", "Data Science", "Legal"]

  const sellers: SellerCardData[] = useMemo(() => {
    return (people || []).map((p) => ({
      id: p.id,
      name: p.profiles?.full_name || "Unnamed",
      bio: p.profiles?.bio || "",
      hourlyRate: p.hourly_rate,
      currency: p.currency,
      rating: Number(p.average_rating || 0),
      reviewCount: p.total_reviews || 0,
      skills: p.skills || [],
      availability: p.availability_status || "",
      profileImage: p.profiles?.avatar_url || undefined,
    }))
  }, [people])

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.skills.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" ||
      seller.skills.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()))

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
              <h1 className="text-xl font-bold">People Marketplace</h1>
            </div>
          </div>

          <Badge variant="secondary" className="gap-2">
            <Users className="w-3 h-3" />
            {loading ? "Loading..." : `${filteredSellers.length} People`}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, skills, or interests..."
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
          {loading ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading people...</h3>
                <p className="text-muted-foreground">Please wait</p>
              </CardContent>
            </Card>
          ) : filteredSellers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No people found</h3>
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
                        {seller.skills.map((tag) => (
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
            <Button variant="outline">Load More People</Button>
          </div>
        )}
      </div>
    </div>
  )
}
