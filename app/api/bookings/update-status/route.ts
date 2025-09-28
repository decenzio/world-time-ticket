import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/database"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId, status, userId } = body

    // Validate required fields
    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: "Booking ID and status are required" },
        { status: 400 }
      )
    }

    const client = getSupabase({ admin: true })
    
    // First check if booking exists
    const { data: existingBooking, error: fetchError } = await client
      .from("bookings")
      .select("id")
      .eq("id", bookingId)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: `Check booking failed: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      )
    }

    // Update the booking status
    const { data, error } = await client
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: `Update booking status failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Update booking status error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
