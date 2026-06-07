import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { generateResponseSuggestion, AI_ENABLED } from "@/lib/ai";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  if (!AI_ENABLED) {
    return NextResponse.json({ error: "AI features are not enabled on this instance." }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimit(req, "api_general");
  if (!rl.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { reviewId } = await req.json();
  if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { dealership: { select: { name: true, staff: { where: { userId: session.user.id, isActive: true } } } } },
  });

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const isStaff = review.dealership.staff.length > 0;
  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);

  if (!isStaff && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check PRO/ENTERPRISE subscription
  const sub = await prisma.dealerSubscription.findUnique({ where: { dealershipId: review.dealershipId } });
  if (!sub || sub.plan === "FREE") {
    return NextResponse.json({ error: "AI response suggestions require a Pro or Enterprise subscription." }, { status: 403 });
  }

  const suggestion = await generateResponseSuggestion({
    title: review.title,
    body: review.body,
    rating: review.overallRating,
    dealerName: review.dealership.name,
  });

  return NextResponse.json({ data: suggestion });
}
