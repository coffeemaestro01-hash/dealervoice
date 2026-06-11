import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isValidAdType } from "@/lib/ads/placements";
import { GLOBAL_AFFILIATE_DOMAINS } from "@/lib/geo/market";
import { isAdmitadRedirectUrl } from "@/lib/ads/admitad";
import { recordIncome } from "@/lib/income/ledger";
import { normalizeCountryCode } from "@/lib/geo/market";

function safeRedirect(target: string, base: string): string {
  if (target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  try {
    const url = new URL(target);
    const baseUrl = new URL(base);
    if (url.origin === baseUrl.origin) return url.pathname + url.search;
    const host = url.hostname.replace(/^www\./, "");
    if (GLOBAL_AFFILIATE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
      return url.toString();
    }
    if (isAdmitadRedirectUrl(url.toString())) {
      return url.toString();
    }
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
  const placementId = searchParams.get("placementId");

  if (!isValidAdType(adType)) {
    return NextResponse.redirect(new URL("/dealers", req.url));
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  const destination = safeRedirect(redirect, base);

  const countryCode = normalizeCountryCode(
    req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry")
  );

  try {
    const click = await prisma.adClickEvent.create({
      data: {
        adType,
        slot,
        targetUrl: destination,
        adPlacementId: placementId,
        countryCode,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
    });

    if (placementId) {
      const placement = await prisma.adPlacement.findUnique({
        where: { id: placementId },
        select: { cpcEstimatePaise: true, headline: true, countryCode: true },
      });
      if (placement?.cpcEstimatePaise) {
        await recordIncome({
          source: "AFFILIATE_CLICK",
          status: "ESTIMATED",
          amountMinor: placement.cpcEstimatePaise,
          currency: "INR",
          countryCode: placement.countryCode ?? countryCode,
          description: `Affiliate click: ${placement.headline.slice(0, 80)}`,
          externalRef: click.id,
          metadata: { slot, adType, targetUrl: destination },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("[ads/click]", err);
  }

  if (destination.startsWith("http")) {
    return NextResponse.redirect(destination);
  }
  return NextResponse.redirect(new URL(destination, req.url));
}
