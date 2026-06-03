import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { generateProfileDraft } from "@/lib/ai";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimit(req, "api_general");
  if (!rl.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { dealershipId, name, category, city, state, country, website, brands } = body;

  if (!dealershipId || !name || !category || !city || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Authorization check
  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId: session.user.id, isActive: true },
  });
  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);

  if (!staff && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Plan check (Pro/Enterprise)
  const sub = await prisma.dealerSubscription.findUnique({
    where: { dealershipId },
  });
  
  // For onboarding speed, we might allow it once even for Free, but typically AI is Pro+
  if (!sub || sub.plan === "FREE") {
    // If it's a new dealership with 0 reviews, maybe allow 1 generation as a trial?
    // For now, strict Pro/Enterprise rule as per previous patterns.
    return NextResponse.json({ 
      error: "AI Profile generation requires a Pro or Enterprise subscription." 
    }, { status: 403 });
  }

  // 3. Website context extraction (Optional Bonus)
  let context = "";
  if (website) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(website, { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) {
        const html = await res.text();
        // Very basic text extraction (first 2000 chars of body)
        context = html.replace(/<[^>]*>?/gm, ' ')
                      .replace(/\s+/g, ' ')
                      .trim()
                      .slice(0, 2000);
      }
    } catch (e) {
      console.warn("Could not fetch website for context:", e);
    }
  }

  // 4. Generate
  try {
    const draft = await generateProfileDraft({
      name,
      category,
      city,
      state,
      country,
      website,
      brands,
      context,
    });

    return NextResponse.json({ data: draft });
  } catch (error) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
