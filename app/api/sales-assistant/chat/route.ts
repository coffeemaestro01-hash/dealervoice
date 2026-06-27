import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getSalesAssistantFeatures } from "@/lib/sales-assistant/features";
import { extractLeadFromConversation } from "@/lib/sales-assistant/extract-lead";
import { generateSalesAssistantReply } from "@/lib/sales-assistant/respond";
import { defaultGreeting } from "@/lib/sales-assistant/prompt";
import { sendNewLeadNotification } from "@/lib/email";

const schema = z.object({
  dealershipId: z.string().min(1),
  sessionId: z.string().min(8).max(64),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(24),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "api_general");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { dealershipId, sessionId, messages } = parsed.data;
  if (messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
  }

  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId, deletedAt: null },
    select: {
      id: true,
      name: true,
      cityName: true,
      stateName: true,
      phone: true,
      overallRating: true,
      totalReviews: true,
      subscription: { select: { plan: true, status: true } },
      staff: {
        where: { isActive: true, role: "owner" },
        take: 1,
        include: { user: { select: { email: true } } },
      },
    },
  });

  if (!dealer) {
    return NextResponse.json({ error: "Dealership not found" }, { status: 404 });
  }

  const features = getSalesAssistantFeatures(
    dealer.subscription?.plan ?? "FREE",
    dealer.subscription?.status
  );

  if (!features.enabled) {
    return NextResponse.json(
      { error: "AI sales assistant requires Pro or higher" },
      { status: 403 }
    );
  }

  const ctx = {
    name: dealer.name,
    city: dealer.cityName,
    state: dealer.stateName,
    phone: dealer.phone,
    rating: dealer.overallRating,
    reviewCount: dealer.totalReviews,
    greeting: null,
    features,
  };

  try {
    const reply = await generateSalesAssistantReply(ctx, messages);
    let leadCaptured = false;

    if (features.leadCapture) {
      const extracted = extractLeadFromConversation(messages);
      if (extracted?.email) {
        const source = `ai_assistant:${sessionId}`;
        const existing = await prisma.lead.findFirst({
          where: { dealershipId, source },
        });
        if (!existing) {
          const lead = await prisma.lead.create({
            data: {
              dealershipId,
              name: extracted.name ?? "Website visitor",
              email: extracted.email,
              phone: extracted.phone,
              vehicle: extracted.vehicle,
              message: extracted.message,
              type: extracted.type,
              source,
            },
          });
          leadCaptured = true;
          const ownerEmail = dealer.staff[0]?.user.email;
          if (ownerEmail) {
            sendNewLeadNotification(ownerEmail, dealer.name, {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              vehicle: lead.vehicle,
              message: lead.message,
              type: lead.type,
            }).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({
      reply,
      leadCaptured,
      greeting: defaultGreeting(ctx),
      tier: features.tier,
    });
  } catch (err) {
    console.error("Sales assistant error:", err);
    return NextResponse.json(
      {
        reply: `Thanks for your interest in ${dealer.name}. Our team will get back to you soon — or call us${dealer.phone ? ` at ${dealer.phone}` : ""}.`,
      },
      { status: 200 }
    );
  }
}

/** Public config check — is assistant live for this dealer? */
export async function GET(req: NextRequest) {
  const dealershipId = new URL(req.url).searchParams.get("dealershipId");
  if (!dealershipId) {
    return NextResponse.json({ error: "dealershipId required" }, { status: 400 });
  }

  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId, deletedAt: null },
    select: {
      name: true,
      subscription: { select: { plan: true, status: true } },
      overallRating: true,
      totalReviews: true,
    },
  });
  if (!dealer) return NextResponse.json({ enabled: false });

  const features = getSalesAssistantFeatures(
    dealer.subscription?.plan ?? "FREE",
    dealer.subscription?.status
  );

  const ctx = {
    name: dealer.name,
    rating: dealer.overallRating,
    reviewCount: dealer.totalReviews,
    greeting: null,
    features,
  };

  return NextResponse.json({
    enabled: features.enabled,
    tier: features.tier,
    greeting: features.enabled ? defaultGreeting(ctx) : null,
  });
}
