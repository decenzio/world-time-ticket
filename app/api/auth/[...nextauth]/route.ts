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
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          return null
        }

        // Create a user object from the wallet authentication
        const user = {
          id: credentials.walletAddress,
          name: credentials.username || credentials.walletAddress,
          email: null,
          image: credentials.profilePictureUrl || null,
          verificationLevel: "device", // Wallet auth provides device-level verification
          walletAddress: credentials.walletAddress,
          username: credentials.username,
          profilePictureUrl: credentials.profilePictureUrl,
          permissions: credentials.permissions ? JSON.parse(credentials.permissions) : undefined,
          optedIntoOptionalAnalytics: credentials.optedIntoOptionalAnalytics === "true",
          worldAppVersion: credentials.worldAppVersion ? parseInt(credentials.worldAppVersion) : undefined,
          deviceOS: credentials.deviceOS,
        }

        return user
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.worldId as string
        session.user.walletAddress = token.walletAddress as string
        session.user.username = token.username as string
        session.user.profilePictureUrl = token.profilePictureUrl as string
        session.user.permissions = token.permissions as any
        session.user.optedIntoOptionalAnalytics = token.optedIntoOptionalAnalytics as boolean
        session.user.worldAppVersion = token.worldAppVersion as number
        session.user.deviceOS = token.deviceOS as string
        session.user.verificationLevel = token.verificationLevel as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
