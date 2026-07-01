import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { z } from "zod";
import { updateGiftCardStatus } from "@/lib/reviews/gift-cards";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ELIGIBLE", "APPROVED", "SENT", "DECLINED"]),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const card = await updateGiftCardStatus(
    parsed.data.id,
    parsed.data.status,
    session.user.id,
    parsed.data.notes
  );

  return NextResponse.json({ ok: true, data: card });
}
