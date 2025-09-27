import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/database"

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        ok: false,
        error: "Service role key missing. Set SUPABASE_SERVICE_ROLE_KEY in .env.local",
      }, { status: 500 })
    }

    const { userId, full_name, bio, email } = await req.json()

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId is required" }, { status: 400 })
    }

    // First check if profile exists to get the email
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 })
    }

    // If profile doesn't exist, we need an email
    if (!existingProfile && !email) {
      return NextResponse.json({ ok: false, error: "email is required for new profiles" }, { status: 400 })
    }

    // Update profile using upsert to handle both create and update cases
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email || existingProfile?.email,
        full_name: full_name || null,
        bio: bio || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Profile upsert failed:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    console.error('Update profile error:', err)
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
