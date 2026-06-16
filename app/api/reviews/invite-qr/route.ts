import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import prisma from "@/lib/db";
import { dealerReviewInviteUrl } from "@/lib/reviews/invite";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const dealer = await prisma.dealership.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true },
  });
  if (!dealer) {
    return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
  }

  const url = dealerReviewInviteUrl(slug);
  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: { dark: "#2a2118", light: "#faf8f4" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
