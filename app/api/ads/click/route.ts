import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const VALID_TYPES = ["Tier2_OEM_Offer", "Sponsored_Local_Dealer", "Auto_Ecosystem_Partner"] as const;

function safeRedirect(target: string, base: string): string {
  if (target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  try {
    const url = new URL(target);
    const baseUrl = new URL(base);
    if (url.origin === baseUrl.origin) return url.pathname + url.search;
  } catch {
    /* fall through */
  }
  return "/dealers";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adType = searchParams.get("type") ?? "";
  const slot = searchParams.get("slot") ?? "unknown";
  const redirect = searchParams.get("redirect") ?? "/dealers";

  if (!VALID_TYPES.includes(adType as (typeof VALID_TYPES)[number])) {
    return NextResponse.redirect(new URL("/dealers", req.url));
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  const destination = safeRedirect(redirect, base);

  try {
    await prisma.adClickEvent.create({
      data: {
        adType,
        slot,
        targetUrl: destination,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
    });
  } catch (err) {
    console.error("[ads/click]", err);
  }

  return NextResponse.redirect(new URL(destination, req.url));
}
