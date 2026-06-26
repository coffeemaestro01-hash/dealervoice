import { NextRequest, NextResponse } from "next/server";
import { autoStartOutreachDrips, processDueOutreachDrips } from "@/lib/outreach/drip";

// Daily outreach drip — sends follow-ups and auto-starts new US drips.
// Protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  try {
    const followUps = await processDueOutreachDrips(75);
    const autoStartIl = await autoStartOutreachDrips(25, "US", "Illinois");
    const autoStartUs = await autoStartOutreachDrips(50, "US");

    return NextResponse.json({
      ok: true,
      followUps,
      autoStartIl,
      autoStartUs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Drip cron failed";
    console.error("outreach-drip cron:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
