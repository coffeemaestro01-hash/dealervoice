import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { claimSchema } from "@/lib/validations";
import { shouldAutoApproveClaim } from "@/lib/claims/domains";
import { getFeatureFlag } from "@/lib/admin/feature-flags";
import { approveDealerClaim } from "@/lib/claims/approveClaim";
import { sendNewClaimNotification, sendClaimApprovedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const { dealershipId, businessEmail, businessPhone, notes, documentUrl } = parsed.data;

  const dealership = await prisma.dealership.findUnique({
    where: { id: dealershipId, deletedAt: null },
    select: { id: true, name: true, slug: true, website: true, email: true, claimedAt: true },
  });
  if (!dealership) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });
  if (dealership.claimedAt) {
    return NextResponse.json({ error: "This dealership is already claimed." }, { status: 409 });
  }

  const existingClaim = await prisma.dealerClaim.findFirst({
    where: { dealershipId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existingClaim) {
    return NextResponse.json({ error: "A claim for this dealership is already pending or approved." }, { status: 409 });
  }

  const autoApproveAll = await getFeatureFlag<boolean>("CLAIM_AUTO_APPROVE_ALL");
  const autoApprove = autoApproveAll || shouldAutoApproveClaim(businessEmail, dealership);

  const claim = await prisma.dealerClaim.create({
    data: {
      dealershipId,
      submittedById: session.user.id,
      businessEmail,
      businessPhone,
      notes,
      status: "PENDING",
      documents: {
        create: {
          type: "DOCUMENT",
          url: documentUrl,
          key: documentUrl.split("/").pop() || "proof",
          filename: "proof_of_ownership",
          mimeType: "application/octet-stream",
          size: 0,
        },
      },
    },
    select: { id: true, status: true },
  });

  let approved = false;
  if (autoApprove) {
    try {
      await approveDealerClaim(prisma, claim.id);
      approved = true;
    } catch (err) {
      console.error("[claims] auto-approve failed:", err);
    }
  }

  await sendNewClaimNotification(dealership.name, businessEmail, approved, claim.id).catch(() => {});

  if (approved && session.user.email) {
    await sendClaimApprovedEmail(
      session.user.email,
      session.user.name ?? "Dealer",
      dealership.name
    ).catch(() => {});
  }

  return NextResponse.json(
    {
      data: { ...claim, status: approved ? "APPROVED" : claim.status },
      autoApproved: approved,
      message: approved
        ? "Claim approved! You now own this profile. Upgrade to Pro to remove competitor ads."
        : "Claim submitted. Our team will review it within 1 business day.",
      redirectUrl: approved
        ? `/dashboard/dealer/billing?dealer=${dealershipId}&upgrade=1`
        : undefined,
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await prisma.dealerClaim.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { dealership: { select: { id: true, name: true, slug: true } } },
  });

  return NextResponse.json({ data: claims });
}
