"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Calendar } from "lucide-react"

interface SellerProfile {
  name: string
  bio: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  calendlyUrl: string
  expertise: string[]
  availability: string
}

export default function SellerSetupPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<SellerProfile>({
    name: "",
    bio: "",
    hourlyRate: 50,
    currency: "USDC",
    calendlyUrl: "",
    expertise: [],
    availability: "flexible",
  })
  const [newExpertise, setNewExpertise] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile((prev) => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()],
      }))
      setNewExpertise("")
    }
  }

  const removeExpertise = (tag: string) => {
    setProfile((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile.calendlyUrl.trim()) {
      alert("Please provide your Calendly link.")
      return
    }

    setIsLoading(true)

    try {
      // TODO: Save profile to backend
      console.log("Saving seller profile:", profile)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/seller/dashboard")
    } catch (error) {
      console.error("Failed to save profile:", error)
      alert("Failed to save profile. Please try again.")
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
            <p className="text-muted-foreground">Share your expertise with verified humans</p>
          </div>
        </div>

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
                  placeholder="Your professional name"
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
              <CardTitle>Expertise Tags</CardTitle>
              <CardDescription>Add tags to help people find you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="e.g., Business Strategy, Design, Coding"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                />
                <Button type="button" onClick={addExpertise} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {profile.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeExpertise(tag)}
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
