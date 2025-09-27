import {NextRequest, NextResponse} from "next/server"
import {peopleService} from "@/lib/services"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      user_id,
      hourly_rate,
      currency,
      calendly_url,
      skills,
      availability_status,
    } = body || {}

    if (!user_id || typeof hourly_rate !== 'number' || hourly_rate <= 0 || !currency) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const result = await peopleService.createPerson({
      user_id,
      hourly_rate,
      currency,
      calendly_url,
      skills,
      availability_status,
    })

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error?.message || "Create person failed" }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data: result.data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}


