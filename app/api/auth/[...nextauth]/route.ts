import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        username: { label: "Username", type: "text" },
        profilePictureUrl: { label: "Profile Picture URL", type: "text" },
        permissions: { label: "Permissions", type: "text" },
        optedIntoOptionalAnalytics: { label: "Analytics Opt-in", type: "text" },
        worldAppVersion: { label: "World App Version", type: "text" },
        deviceOS: { label: "Device OS", type: "text" },
        worldIdProof: { label: "World ID Proof", type: "text" },
        verificationLevel: { label: "Verification Level", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          console.error("No wallet address provided")
          return null
        }

        try {
          // Create a user object from the wallet authentication
          const user = {
            id: credentials.walletAddress,
            name: credentials.username || credentials.walletAddress,
            email: null,
            image: credentials.profilePictureUrl || null,
            verificationLevel: credentials.verificationLevel || "device",
            walletAddress: credentials.walletAddress,
            username: credentials.username || null,
            profilePictureUrl: credentials.profilePictureUrl || null,
            permissions: credentials.permissions ? JSON.parse(credentials.permissions) : undefined,
            optedIntoOptionalAnalytics: credentials.optedIntoOptionalAnalytics === "true",
            worldAppVersion: credentials.worldAppVersion ? parseInt(credentials.worldAppVersion) : undefined,
            deviceOS: credentials.deviceOS || null,
            worldIdProof: credentials.worldIdProof || null,
          }

          console.log("User authorized:", { 
            id: user.id, 
            verificationLevel: user.verificationLevel,
            hasWorldIdProof: !!user.worldIdProof 
          })

          return user
        } catch (error) {
          console.error("Error in authorize function:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = user.walletAddress
        token.username = user.username
        token.profilePictureUrl = user.profilePictureUrl
        token.permissions = user.permissions
        token.optedIntoOptionalAnalytics = user.optedIntoOptionalAnalytics
        token.worldAppVersion = user.worldAppVersion
        token.deviceOS = user.deviceOS
        token.verificationLevel = user.verificationLevel
        token.worldId = user.id
        token.worldIdProof = (user as any).worldIdProof
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.worldId as string || token.sub || ""
        session.user.walletAddress = token.walletAddress as string || ""
        session.user.username = token.username as string || null
        session.user.profilePictureUrl = token.profilePictureUrl as string || null
        session.user.permissions = token.permissions as any || undefined
        session.user.optedIntoOptionalAnalytics = token.optedIntoOptionalAnalytics as boolean || false
        session.user.worldAppVersion = token.worldAppVersion as number || undefined
        session.user.deviceOS = token.deviceOS as string || null
        session.user.verificationLevel = token.verificationLevel as string || "device"
        session.user.worldIdProof = token.worldIdProof as string || null
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
