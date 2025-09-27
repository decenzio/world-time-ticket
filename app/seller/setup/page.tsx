"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Calendar, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/hooks"
import { peopleService, profileService } from "@/lib/services"

interface SellerProfile {
  name: string
  bio: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  calendlyUrl: string
  skills: string[]
  availability: string
}

export default function SellerSetupPage() {
  const router = useRouter()
  const { user, profile: userProfile } = useAuth()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<SellerProfile>({
    name: userProfile?.full_name || "",
    bio: userProfile?.bio || "",
    hourlyRate: 50,
    currency: "USDC",
    calendlyUrl: "",
    skills: [],
    availability: "flexible",
  })
  const [newSkill, setNewSkill] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (tag: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      setError("Please log in to create a seller profile")
      return
    }

    if (!profile.calendlyUrl.trim()) {
      setError("Please provide your Calendly link.")
      return
    }

    if (profile.skills.length === 0) {
      setError("Please add at least one skill or interest.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, update the user profile with name and bio
      if (profile.name !== userProfile?.full_name || profile.bio !== userProfile?.bio) {
        const profileResult = await profileService.updateProfile(session.user.id, {
          full_name: profile.name,
          bio: profile.bio,
        })

        if (!profileResult.success) {
          throw new Error(profileResult.error?.message || "Failed to update profile")
        }
      }

      // Then, create the person profile for selling
      const personResult = await peopleService.createPerson({
        user_id: session.user.id,
        hourly_rate: profile.hourlyRate,
        currency: profile.currency,
        calendly_url: profile.calendlyUrl,
        skills: profile.skills,
        availability_status: profile.availability,
      })

      if (!personResult.success) {
        throw new Error(personResult.error?.message || "Failed to create seller profile")
      }

      router.push("/seller/dashboard")
    } catch (error) {
      console.error("Failed to save profile:", error)
      setError(error instanceof Error ? error.message : "Failed to save profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Setup Your Seller Profile</h1>
            <p className="text-muted-foreground">Share your skills and interests with verified people</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell people who you are and what you do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your display name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe your background, experience, and what you can help with..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Currency</CardTitle>
              <CardDescription>Set your hourly rate and preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate">Hourly Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="1"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={profile.currency}
                    onValueChange={(value: "WLD" | "USDC") => setProfile((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="WLD">WLD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendly Integration
              </CardTitle>
              <CardDescription>Provide your Calendly link so clients can book sessions with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="calendlyUrl">Calendly Link</Label>
                <Input
                  id="calendlyUrl"
                  type="url"
                  value={profile.calendlyUrl}
                  onChange={(e) => setProfile((prev) => ({ ...prev, calendlyUrl: e.target.value }))}
                  placeholder="https://calendly.com/your-username/consultation"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Copy your Calendly booking link from your Calendly dashboard
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Interests</CardTitle>
              <CardDescription>Add tags to help people find you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g., Business Strategy, Design, Coding"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeSkill(tag)}
                        className="hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !profile.calendlyUrl.trim()} className="flex-1">
              {isLoading ? "Creating Profile..." : "Create Seller Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
