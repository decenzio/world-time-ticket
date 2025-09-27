import NextAuth, { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          email: profile.email,
          image: profile.picture,
          verificationLevel: profile["https://id.worldcoin.org/v1"]?.verification_level || "unknown",
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.verificationLevel = profile["https://id.worldcoin.org/v1"]?.verification_level || "unknown"
        token.worldId = profile.sub
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.worldId as string
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
