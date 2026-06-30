import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { updateInboxConnection } from "@/lib/inbox/tickets";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { z } from "zod";

const patchSchema = z.object({
  provider: z.enum(["GMAIL", "MICROSOFT", "IMAP", "FORWARDING", "OTHER"]).optional(),
  address: z.string().email().optional(),
  label: z.string().max(80).optional(),
  status: z.enum(["PENDING", "CONNECTED", "ERROR", "DISCONNECTED"]).optional(),
  config: z.record(z.unknown()).optional(),
});

export async function GET() {
  try {
    const { dealershipId } = await requireInboxSession();

    const connection = await prisma.inboxEmailConnection.findFirst({
      where: { dealershipId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: connection });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { dealershipId } = await requireInboxSession();
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const connection = await updateInboxConnection(dealershipId, {
      provider: parsed.data.provider,
      address: parsed.data.address,
      status: parsed.data.status,
      config: parsed.data.config,
    });

    if (parsed.data.label) {
      await prisma.inboxEmailConnection.update({
        where: { id: connection.id },
        data: { label: parsed.data.label },
      });
    }

    const refreshed = await prisma.inboxEmailConnection.findUnique({
      where: { id: connection.id },
    });

    return NextResponse.json({ data: refreshed });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
