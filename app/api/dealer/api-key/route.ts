import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { ensureDealerApiKey } from "@/lib/api/dealer-keys";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealershipId } = await req.json().catch(() => ({}));
  if (!dealershipId) return NextResponse.json({ error: "dealershipId required" }, { status: 422 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId: session.user.id, isActive: true },
    include: { dealership: { include: { subscription: true, apiKey: true } } },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sub = staff.dealership.subscription;
  if (!sub || sub.plan !== "ENTERPRISE" || !sub.apiAccess) {
    return NextResponse.json({ error: "Enterprise API access required" }, { status: 403 });
  }

  const result = await ensureDealerApiKey(dealershipId);
  return NextResponse.json({
    prefix: result.prefix,
    key: result.key,
    message: result.created
      ? "Copy this key now — it will not be shown again."
      : "API key already exists. Contact support to rotate.",
  });
}
