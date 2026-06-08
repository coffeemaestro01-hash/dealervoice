import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { reviewSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/auth/rate-limit";
import { analyzeSentiment, detectSpam } from "@/lib/ai";
import { updateDealershipAggregates } from "@/lib/reputation";
import { deleteCachePattern } from "@/lib/redis";
import { sendNewReviewNotification } from "@/lib/email";
import { indexDealership } from "@/lib/search";
import { recordSiteEvent } from "@/lib/analytics/track";
import { buildRequestMeta } from "@/lib/analytics/parse-request";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(req, "review_submit");
  if (!rl.success) {
    return NextResponse.json({ error: "Review limit reached. You can submit up to 5 reviews per hour." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  // Check dealership exists
  const dealership = await prisma.dealership.findUnique({
    where: { id: data.dealershipId, deletedAt: null },
    include: { staff: { where: { userId: session.user.id }, select: { id: true } } },
  });
  if (!dealership) {
    return NextResponse.json({ error: "Dealership not found" }, { status: 404 });
  }

  // Block dealership staff from reviewing their own dealership
  if (dealership.staff.length > 0) {
    return NextResponse.json({ error: "You cannot review a dealership you are associated with." }, { status: 403 });
  }

  const reviewType =
    data.reviewCategory === "SERVICE_PARTS" ? "VEHICLE_SERVICE" : "NEW_CAR_PURCHASE";

  // Check for duplicate review (same user, same dealership, same category in 30 days)
  const existingReview = await prisma.review.findFirst({
    where: {
      authorId: session.user.id,
      dealershipId: data.dealershipId,
      reviewCategory: data.reviewCategory,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      deletedAt: null,
    },
  });
  if (existingReview) {
    return NextResponse.json({ error: "You have already submitted a similar review for this dealership recently." }, { status: 409 });
  }

  // AI analysis (non-blocking)
  const reviewText = `${data.title}\n${data.body}`;
  const [sentiment, spamResult] = await Promise.all([
    analyzeSentiment(reviewText).catch(() => null),
    detectSpam({
      title: data.title,
      body: data.body,
    }).catch(() => null),
  ]);

  // Auto-flag if high spam score
  const isFlagged = (spamResult?.score ?? 0) > 0.85;
  const status = isFlagged ? "FLAGGED" : "PUBLISHED";

  const review = await prisma.review.create({
    data: {
      dealershipId: data.dealershipId,
      authorId: session.user.id,
      reviewCategory: data.reviewCategory,
      reviewType,
      status,
      overallRating: data.overallRating,
      ratingTransparency: data.ratingTransparency,
      ratingPricing: data.ratingPricing,
      ratingService: data.ratingService,
      ratingDelivery: data.ratingDelivery,
      ratingAfterSales: data.ratingAfterSales,
      wouldRecommend: data.wouldRecommend,
      title: data.title,
      body: data.body,
      salesConsultantName: data.salesConsultantName,
      serviceAdvisorName: data.serviceAdvisorName,
      serviceRendered: data.serviceRendered,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      vehicleVin: data.vehicleVin,
      visitDate: data.visitDate ? new Date(data.visitDate) : null,
      sentimentScore: sentiment?.score,
      sentimentLabel: sentiment?.label,
      spamScore: spamResult?.score,
      isFlagged,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    },
    select: { id: true, status: true },
  });

  // Update aggregates & cache
  if (status === "PUBLISHED") {
    await updateDealershipAggregates(data.dealershipId).catch(() => {});
    await deleteCachePattern(`dealership:${dealership.slug}*`);

    // Notify dealer staff
    const ownerStaff = await prisma.dealerStaff.findFirst({
      where: { dealershipId: data.dealershipId, role: "owner", isActive: true },
      include: { user: { select: { email: true } } },
    });
    if (ownerStaff) {
      await sendNewReviewNotification(ownerStaff.user.email, dealership.name, data.overallRating, review.id).catch(() => {});
    }
  }

  // Update user review count
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totalReviews: { increment: 1 } },
  }).catch(() => {});

  recordSiteEvent({
    eventType: "review_submit",
    path: "/api/reviews",
    method: "POST",
    userId: session.user.id,
    userRole: session.user.role as string,
    metadata: { dealershipId: data.dealershipId, reviewId: review.id, status: review.status },
    meta: buildRequestMeta(req),
  }).catch(() => {});

  return NextResponse.json(
    {
      data: review,
      message: isFlagged
        ? "Your review has been submitted and is under moderation."
        : "Review published successfully.",
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealershipId = searchParams.get("dealershipId");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Number(searchParams.get("limit") ?? 10));

  if (!dealershipId) {
    return NextResponse.json({ error: "dealershipId is required" }, { status: 400 });
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { dealershipId, status: "PUBLISHED", deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, reputationScore: true, totalReviews: true } },
        response: { select: { id: true, body: true, createdAt: true, updatedAt: true, isResolved: true } },
        media: { select: { url: true, type: true, altText: true }, take: 5 },
      },
    }),
    prisma.review.count({ where: { dealershipId, status: "PUBLISHED", deletedAt: null } }),
  ]);

  return NextResponse.json({
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
