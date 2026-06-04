import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { status, rejectionReason } = body;
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const claimId = params.id;
  const claim = await prisma.dealerClaim.findUnique({ where: { id: claimId } });
  
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  if (claim.status !== "PENDING") {
    return NextResponse.json({ error: "Claim is already processed" }, { status: 400 });
  }

  try {
    const updatedClaim = await prisma.$transaction(async (tx) => {
      // 1. Update the claim status
      const updated = await tx.dealerClaim.update({
        where: { id: claimId },
        data: {
          status,
          rejectionReason: status === "REJECTED" ? rejectionReason : null,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });

      if (status === "APPROVED") {
        // 2. Update the Dealership status and claimedAt
        await tx.dealership.update({
          where: { id: claim.dealershipId },
          data: {
            status: "CLAIMED",
            claimedAt: new Date(),
          },
        });

        // 3. Create DealerStaff relationship for ownership
        // Check if staff record exists first
        const existingStaff = await tx.dealerStaff.findFirst({
          where: { dealershipId: claim.dealershipId, userId: claim.submittedById },
        });

        if (!existingStaff) {
          await tx.dealerStaff.create({
            data: {
              dealershipId: claim.dealershipId,
              userId: claim.submittedById,
              role: "owner",
              isActive: true,
              acceptedAt: new Date(),
            },
          });
        }

        // 3b. Grant dashboard access: promote the claimant to DEALER_OWNER.
        // updateMany with a role filter so we never downgrade an existing
        // MODERATOR / SUPER_ADMIN / DEALER_GROUP_ADMIN.
        await tx.user.updateMany({
          where: { id: claim.submittedById, role: "CUSTOMER" },
          data: { role: "DEALER_OWNER" },
        });

        // 4. Create FREE subscription for onboarding path (Upgrade path preparation)
        const existingSub = await tx.dealerSubscription.findUnique({
          where: { dealershipId: claim.dealershipId },
        });

        if (!existingSub) {
          await tx.dealerSubscription.create({
            data: {
              dealershipId: claim.dealershipId,
              plan: "FREE",
              status: "TRIALING",
            },
          });
        }
        
        // 5. Optionally, profile completeness calculation can be triggered here or evaluated on-the-fly in the dashboard.
      }

      return updated;
    });

    return NextResponse.json({ data: updatedClaim });
  } catch (error: any) {
    console.error("Failed to process claim:", error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}
