import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isValidAdType } from "@/lib/ads/placements";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adType = searchParams.get("type") ?? "";
  const slot = searchParams.get("slot") ?? "unknown";
  const placementId = searchParams.get("placementId");

  if (!isValidAdType(adType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await prisma.adImpressionEvent.create({
      data: {
        adType,
        slot,
        adPlacementId: placementId,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
    });
  } catch (err) {
    console.error("[ads/impression]", err);
  }

  return NextResponse.json({ ok: true });
}
