import prisma from "@/lib/db";
import type { SubscriptionPlan } from "@prisma/client";
import { maxServiceAreasForPlan } from "@/lib/subscription/plan-limits";
import { planFeatures } from "@/lib/subscription";

export async function getDealerPlan(dealershipId: string): Promise<SubscriptionPlan> {
  const sub = await prisma.dealerSubscription.findUnique({
    where: { dealershipId },
    select: { plan: true, status: true },
  });
  if (sub?.status === "ACTIVE") return sub.plan;
  return "FREE";
}

export async function getServiceAreaLimit(dealershipId: string): Promise<number> {
  const plan = await getDealerPlan(dealershipId);
  return maxServiceAreasForPlan(plan);
}

export async function listServiceAreas(dealershipId: string) {
  return prisma.dealershipServiceArea.findMany({
    where: { dealershipId },
    orderBy: { cityName: "asc" },
  });
}

export async function addServiceArea(
  dealershipId: string,
  input: { cityName: string; stateName?: string; stateCode?: string }
) {
  const cityName = input.cityName.trim();
  if (!cityName) throw new Error("City name is required");

  const plan = await getDealerPlan(dealershipId);
  const limit = maxServiceAreasForPlan(plan);
  const count = await prisma.dealershipServiceArea.count({ where: { dealershipId } });

  if (count >= limit) {
    throw new Error(
      `Your ${plan} plan allows up to ${limit} service areas. Upgrade for more coverage.`
    );
  }

  return prisma.dealershipServiceArea.create({
    data: {
      dealershipId,
      cityName,
      stateName: input.stateName?.trim() || null,
      stateCode: input.stateCode?.trim()?.toUpperCase() || null,
    },
  });
}

export async function removeServiceArea(dealershipId: string, areaId: string) {
  const area = await prisma.dealershipServiceArea.findFirst({
    where: { id: areaId, dealershipId },
  });
  if (!area) throw new Error("Service area not found");
  await prisma.dealershipServiceArea.delete({ where: { id: areaId } });
}

export async function listEnterpriseLinks(primaryDealershipId: string) {
  return prisma.enterpriseAccountLink.findMany({
    where: { primaryDealershipId },
    include: {
      linked: { select: { id: true, name: true, slug: true, cityName: true, stateName: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function linkEnterpriseLocation(primaryDealershipId: string, linkedDealershipId: string) {
  if (primaryDealershipId === linkedDealershipId) {
    throw new Error("Cannot link a dealership to itself");
  }

  const plan = await getDealerPlan(primaryDealershipId);
  const features = planFeatures(plan);
  if (features.maxLinkedDealerships === 0) {
    throw new Error("Enterprise plan required to link dealership locations");
  }

  const existing = await prisma.enterpriseAccountLink.count({
    where: { primaryDealershipId },
  });
  if (existing >= features.maxLinkedDealerships) {
    throw new Error(`Enterprise accounts can link up to ${features.maxLinkedDealerships} locations`);
  }

  const alreadyLinked = await prisma.enterpriseAccountLink.findUnique({
    where: { linkedDealershipId },
  });
  if (alreadyLinked) throw new Error("That dealership is already linked to an Enterprise account");

  const linked = await prisma.dealership.findUnique({
    where: { id: linkedDealershipId, deletedAt: null },
    select: { id: true },
  });
  if (!linked) throw new Error("Dealership not found");

  return prisma.enterpriseAccountLink.create({
    data: { primaryDealershipId, linkedDealershipId },
    include: {
      linked: { select: { id: true, name: true, slug: true, cityName: true } },
    },
  });
}

export async function unlinkEnterpriseLocation(primaryDealershipId: string, linkId: string) {
  const link = await prisma.enterpriseAccountLink.findFirst({
    where: { id: linkId, primaryDealershipId },
  });
  if (!link) throw new Error("Link not found");
  await prisma.enterpriseAccountLink.delete({ where: { id: linkId } });
}
