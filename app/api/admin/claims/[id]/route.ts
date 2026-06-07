import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { approveDealerClaim } from "@/lib/claims/approveClaim";
import { sendClaimDocumentsRequiredEmail } from "@/lib/email";
import { logAdminAction } from "@/lib/admin/audit";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { status?: string; rejectionReason?: string; documentRequestNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { status, rejectionReason, documentRequestNote } = body;
  if (!["APPROVED", "REJECTED", "DOCUMENTS_REQUIRED"].includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const claimId = params.id;
  const claim = await prisma.dealerClaim.findUnique({
    where: { id: claimId },
    include: {
      dealership: { select: { name: true } },
      submittedBy: { select: { email: true, name: true } },
    },
  });

  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  if (claim.status !== "PENDING" && claim.status !== "DOCUMENTS_REQUIRED") {
    return NextResponse.json({ error: "Claim is already processed" }, { status: 400 });
  }

  try {
    if (status === "APPROVED") {
      const result = await approveDealerClaim(prisma, claimId, session.user.id);
      await logAdminAction({
        userId: session.user.id,
        action: "claim.approved",
        resource: "DealerClaim",
        resourceId: claimId,
      });
      return NextResponse.json({ data: result.claim });
    }

    if (status === "DOCUMENTS_REQUIRED") {
      const note = (documentRequestNote ?? rejectionReason ?? "").trim();
      if (note.length < 10) {
        return NextResponse.json({ error: "Please provide a clear document request message (min 10 chars)" }, { status: 422 });
      }
      const updatedClaim = await prisma.dealerClaim.update({
        where: { id: claimId },
        data: {
          status: "DOCUMENTS_REQUIRED",
          rejectionReason: note,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });
      if (claim.submittedBy?.email) {
        await sendClaimDocumentsRequiredEmail(
          claim.submittedBy.email,
          claim.submittedBy.name ?? "Dealer",
          claim.dealership.name,
          note
        ).catch(() => {});
      }
      await logAdminAction({
        userId: session.user.id,
        action: "claim.documents_required",
        resource: "DealerClaim",
        resourceId: claimId,
        newValues: { note },
      });
      return NextResponse.json({ data: updatedClaim });
    }

    const updatedClaim = await prisma.dealerClaim.update({
      where: { id: claimId },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason ?? null,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    });

    return NextResponse.json({ data: updatedClaim });
  } catch (error) {
    console.error("Failed to process claim:", error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}
