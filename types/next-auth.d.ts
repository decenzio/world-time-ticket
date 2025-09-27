import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
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
  }

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
}

declare module "next-auth/jwt" {
  interface JWT {
    worldId?: string
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
}
