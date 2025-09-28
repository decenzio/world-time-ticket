import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/database"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      )
    }

    const client = getSupabase({ admin: true })
    const normalizedAddress = walletAddress.toLowerCase()

    // Find profile by wallet address
    const { data: profile, error } = await client
      .from("profiles")
      .select("id, wallet_address, username, full_name")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { success: false, error: `Failed to find profile: ${error.message}` },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found for wallet address" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: profile.id,
        wallet_address: profile.wallet_address,
        username: profile.username,
        full_name: profile.full_name
      }
    })
  } catch (error) {
    console.error("Get profile by wallet error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
