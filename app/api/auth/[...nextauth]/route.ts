import NextAuth, {NextAuthOptions} from "next-auth"
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
        verificationLevel: { label: "Verification Level", type: "text" },
      },
      async authorize(credentials) {
        // Ensure we have at least the wallet address
        if (!credentials?.walletAddress || typeof credentials.walletAddress !== 'string') {
          console.error("No wallet address provided")
          return null
        }

        try {
          // Safely parse optional fields (strings only)
          const stringOrUndefined = (value: unknown): string | undefined =>
            typeof value === 'string' && value.trim() !== '' ? value : undefined

          const toBoolean = (value: unknown): boolean => value === 'true'

          let parsedPermissions: any | undefined
          try {
            parsedPermissions = credentials.permissions && typeof credentials.permissions === 'string'
              ? JSON.parse(credentials.permissions)
              : undefined
          } catch (e) {
            console.warn('Invalid permissions JSON provided to credentials; ignoring')
            parsedPermissions = undefined
          }

          // Create a user object from the wallet authentication
          const user = {
            id: credentials.walletAddress as string,
            name: stringOrUndefined(credentials.username) || (credentials.walletAddress as string),
            email: null as string | null,
            image: stringOrUndefined(credentials.profilePictureUrl) || null,
            verificationLevel: stringOrUndefined(credentials.verificationLevel) || "device",
            walletAddress: credentials.walletAddress as string,
            username: stringOrUndefined(credentials.username) || null,
            profilePictureUrl: stringOrUndefined(credentials.profilePictureUrl) || null,
            permissions: parsedPermissions,
            optedIntoOptionalAnalytics: toBoolean(credentials.optedIntoOptionalAnalytics),
            worldAppVersion: typeof credentials.worldAppVersion === 'string' && credentials.worldAppVersion.trim() !== ''
              ? parseInt(credentials.worldAppVersion, 10)
              : undefined,
            deviceOS: stringOrUndefined(credentials.deviceOS) || null,
          }

          console.log("User authorized:", { 
            id: user.id, 
            verificationLevel: user.verificationLevel,
            hasPermissions: !!user.permissions
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
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.worldId as string || token.sub || ""
        session.user.walletAddress = token.walletAddress as string || ""
        session.user.username = token.username as string | null || null
        session.user.profilePictureUrl = token.profilePictureUrl as string | null || null
        session.user.permissions = token.permissions as any || undefined
        session.user.optedIntoOptionalAnalytics = token.optedIntoOptionalAnalytics as boolean || false
        session.user.worldAppVersion = token.worldAppVersion as number || undefined
        session.user.deviceOS = token.deviceOS as string | null || null
        session.user.verificationLevel = token.verificationLevel as string || "device"
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
export { handler as POST }
