import type { PrismaClient } from "@prisma/client";
import { deleteCachePattern } from "@/lib/redis";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function approveDealerClaimInTx(
  tx: Tx,
  claimId: string,
  reviewedById?: string | null
) {
  const claim = await tx.dealerClaim.findUnique({ where: { id: claimId } });
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "PENDING" && claim.status !== "DOCUMENTS_REQUIRED") {
    throw new Error("Claim is not pending");
  }

  const updated = await tx.dealerClaim.update({
    where: { id: claimId },
    data: {
      status: "APPROVED",
      rejectionReason: null,
      reviewedAt: new Date(),
      reviewedById: reviewedById ?? null,
    },
  });

  const dealership = await tx.dealership.update({
    where: { id: claim.dealershipId },
    data: { status: "CLAIMED", claimedAt: new Date() },
    select: { id: true, slug: true, name: true },
  });

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

  await tx.user.updateMany({
    where: { id: claim.submittedById, role: "CUSTOMER" },
    data: { role: "DEALER_OWNER" },
  });

  const existingSub = await tx.dealerSubscription.findUnique({
    where: { dealershipId: claim.dealershipId },
  });

  if (!existingSub) {
    await tx.dealerSubscription.create({
      data: {
        dealershipId: claim.dealershipId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
  }

  return { claim: updated, dealership };
}

export async function approveDealerClaim(
  prisma: PrismaClient,
  claimId: string,
  reviewedById?: string | null
) {
  const result = await prisma.$transaction((tx) =>
    approveDealerClaimInTx(tx, claimId, reviewedById)
  );

  await deleteCachePattern(`dealership:${result.dealership.slug}*`).catch(() => {});
  return result;
}
