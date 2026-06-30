import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";

export async function GET() {
  try {
    const { dealershipId, userId } = await requireInboxSession();

    const session = await prisma.inboxOnboardingSession.findFirst({
      where: { dealershipId, userId, completedAt: null },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: session });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function POST() {
  try {
    const { dealershipId, userId } = await requireInboxSession();

    const session = await prisma.inboxOnboardingSession.create({
      data: {
        dealershipId,
        userId,
        step: "welcome",
        transcript: [],
      },
    });

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
