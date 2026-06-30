import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { runOnboardingAssistant } from "@/lib/inbox/ai";
import { updateInboxConnection } from "@/lib/inbox/tickets";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import type { InboxEmailProvider } from "@prisma/client";
import { z } from "zod";

type TranscriptEntry = { role: string; content: string };

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().cuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { dealershipId, userId } = await requireInboxSession();
    const parsed = chatSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const session = parsed.data.sessionId
      ? await prisma.inboxOnboardingSession.findFirst({
          where: { id: parsed.data.sessionId, dealershipId, userId, completedAt: null },
        })
      : await prisma.inboxOnboardingSession.findFirst({
          where: { dealershipId, userId, completedAt: null },
          orderBy: { updatedAt: "desc" },
        });

    if (!session) {
      return NextResponse.json({ error: "No active onboarding session" }, { status: 404 });
    }

    const dealership = await prisma.dealership.findUnique({
      where: { id: dealershipId },
      select: { name: true },
    });

    const transcript = (Array.isArray(session.transcript) ? session.transcript : []) as TranscriptEntry[];
    const result = await runOnboardingAssistant({
      dealershipName: dealership?.name ?? "Your dealership",
      step: session.step,
      provider: session.provider ?? undefined,
      userMessage: parsed.data.message,
      transcript,
    });

    const updatedTranscript: TranscriptEntry[] = [
      ...transcript,
      { role: "user", content: parsed.data.message },
      { role: "assistant", content: result.reply },
    ];

    const provider = result.suggestedProvider as InboxEmailProvider | null;
    const updated = await prisma.inboxOnboardingSession.update({
      where: { id: session.id },
      data: {
        step: result.nextStep,
        provider: provider ?? undefined,
        transcript: updatedTranscript,
        completedAt: result.markComplete ? new Date() : undefined,
      },
    });

    if (result.connectionConfig && provider) {
      await updateInboxConnection(dealershipId, {
        provider,
        config: result.connectionConfig,
        status: result.markComplete ? "CONNECTED" : "PENDING",
      });
    }

    return NextResponse.json({
      data: {
        session: updated,
        reply: result.reply,
        nextStep: result.nextStep,
        suggestedProvider: result.suggestedProvider,
        markComplete: result.markComplete,
      },
    });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
