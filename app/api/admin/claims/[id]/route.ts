import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { approveDealerClaim } from "@/lib/claims/approveClaim";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { status?: string; rejectionReason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { status, rejectionReason } = body;
  if (!["APPROVED", "REJECTED"].includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const claimId = params.id;
  const claim = await prisma.dealerClaim.findUnique({ where: { id: claimId } });

  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  if (claim.status !== "PENDING" && claim.status !== "DOCUMENTS_REQUIRED") {
    return NextResponse.json({ error: "Claim is already processed" }, { status: 400 });
  }

  try {
    if (status === "APPROVED") {
      const result = await approveDealerClaim(prisma, claimId, session.user.id);
      return NextResponse.json({ data: result.claim });
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
