import { NextResponse } from "next/server";
import { seedInboxForDealership } from "@/lib/inbox/seed-dealership";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";

export async function POST() {
  try {
    const { dealershipId } = await requireInboxSession();
    const result = await seedInboxForDealership(dealershipId);
    return NextResponse.json({ data: result }, { status: result.seeded ? 201 : 200 });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
