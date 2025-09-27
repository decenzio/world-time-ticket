import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    verificationLevel?: string
    walletAddress?: string
    username?: string | null
    profilePictureUrl?: string | null
    permissions?: {
      notifications: boolean
      contacts: boolean
    }
    optedIntoOptionalAnalytics?: boolean
    worldAppVersion?: number
    deviceOS?: string | null
    worldIdProof?: string
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress?: string
    username?: string | null
    profilePictureUrl?: string | null
    permissions?: {
      notifications: boolean
      contacts: boolean
    }
    optedIntoOptionalAnalytics?: boolean
    worldAppVersion?: number
    deviceOS?: string | null
    verificationLevel?: string
    worldId?: string
  }
}