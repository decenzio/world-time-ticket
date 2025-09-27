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
}