import {cookies} from "next/headers"
import {NextResponse} from "next/server"

export function GET() {
  // Expects only alphanumeric characters
  const nonce = crypto.randomUUID().replace(/-/g, "")

  // The nonce should be stored somewhere that is not tamperable by the client
  // Optionally you can HMAC the nonce with a secret key stored in your environment
  cookies().set("siwe", nonce, { 
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 5 // 5 minutes
  })
  
  return NextResponse.json({ nonce })
}
