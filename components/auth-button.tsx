"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, LogIn } from "lucide-react"

export function AuthButton() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  if (loading) {
    return (
      <Button disabled>
        <Shield className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">
            {session.user.name || session.user.email || "User"}
          </div>
          <div className="text-xs text-muted-foreground">
            {session.user.verificationLevel === "orb" ? "Orb Verified" : "Verified"}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => signIn("worldcoin")}
      className="gap-2"
    >
      <Shield className="w-4 h-4" />
      Sign in with World ID
    </Button>
  )
}
