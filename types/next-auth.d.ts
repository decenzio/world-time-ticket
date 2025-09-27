import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    verificationLevel?: string
    walletAddress?: string
    username?: string
    profilePictureUrl?: string
    permissions?: {
      notifications: boolean
      contacts: boolean
    }
    optedIntoOptionalAnalytics?: boolean
    worldAppVersion?: number
    deviceOS?: string
    worldIdProof?: string
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress?: string
    username?: string
    profilePictureUrl?: string
    permissions?: {
      notifications: boolean
      contacts: boolean
    }
    optedIntoOptionalAnalytics?: boolean
    worldAppVersion?: number
    deviceOS?: string
    verificationLevel?: string
    worldId?: string
  }
}