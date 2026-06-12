import { NextRequest, NextResponse } from "next/server";
import { discoverDealerEmailsBatch } from "@/lib/outreach/discover-emails";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = new URL(req.url).searchParams.get("state") ?? "Illinois";
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 30);

  try {
    const result = await discoverDealerEmailsBatch({ state, limit });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
