import {NextResponse} from "next/server";
import {createMockCalendlyEvent, isMockEnabled,} from "../../../lib/calendly-mock";

export async function POST(request: Request) {
  if (!isMockEnabled()) {
    return NextResponse.json(
      { error: "Calendly mock disabled" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));

  const event = createMockCalendlyEvent({
    uri: body.uri,
    start_time: body.start_time,
    end_time: body.end_time,
    invitee_name: body.invitee_name,
  });

  return NextResponse.json({ success: true, event });
}
