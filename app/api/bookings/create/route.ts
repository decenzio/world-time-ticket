import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/database"
import { ValidationError, DatabaseError, NotFoundError } from "@/lib/errors"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      client_id, 
      person_id, 
      session_notes, 
      hourly_rate, 
      currency, 
      total_amount,
      scheduled_date,
      calendly_event_id 
    } = body

    // Validate required fields
    if (!client_id || !person_id) {
      return NextResponse.json(
        { success: false, error: "Client ID and Person ID are required" },
        { status: 400 }
      )
    }
    if (!hourly_rate || hourly_rate <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid hourly rate is required" },
        { status: 400 }
      )
    }
    if (!total_amount || total_amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid total amount is required" },
        { status: 400 }
      )
    }

    const client = getSupabase({ admin: true })
    
    // Verify person exists and is active
    const { data: person, error: personError } = await client
      .from("people")
      .select("id, is_active")
      .eq("id", person_id)
      .maybeSingle()

    if (personError) {
      return NextResponse.json(
        { success: false, error: `Check person failed: ${personError.message}` },
        { status: 500 }
      )
    }

    if (!person) {
      return NextResponse.json(
        { success: false, error: "Person not found" },
        { status: 404 }
      )
    }

    if (!person.is_active) {
      return NextResponse.json(
        { success: false, error: "Cannot book inactive person" },
        { status: 400 }
      )
    }

    const { data, error } = await client
      .from("bookings")
      .insert([{
        client_id,
        person_id,
        session_notes,
        hourly_rate,
        currency,
        total_amount,
        scheduled_date,
        calendly_event_id,
        status: "pending"
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: `Create booking failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
