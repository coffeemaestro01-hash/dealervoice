import { NextRequest, NextResponse } from "next/server";
import { publishNextLinkedInPost } from "@/lib/social/linkedin/publish";

/** Post to DealerVoice LinkedIn company page — every 3 hours via Vercel cron. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishNextLinkedInPost();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LinkedIn cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
