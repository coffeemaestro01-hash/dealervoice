import prisma from "@/lib/db";

export type InboxBillingGroup = {
  primaryDealershipId: string;
  memberDealershipIds: string[];
};

/** Resolve Enterprise billing group (primary + linked rooftops). */
export async function resolveInboxBillingGroup(dealershipId: string): Promise<InboxBillingGroup> {
  const linked = await prisma.enterpriseAccountLink.findUnique({
    where: { linkedDealershipId: dealershipId },
    select: { primaryDealershipId: true },
  });

  const primaryDealershipId = linked?.primaryDealershipId ?? dealershipId;

  const links = await prisma.enterpriseAccountLink.findMany({
    where: { primaryDealershipId },
    select: { linkedDealershipId: true },
  });

  const memberDealershipIds = [
    primaryDealershipId,
    ...links.map((l) => l.linkedDealershipId),
  ];

  return { primaryDealershipId, memberDealershipIds: [...new Set(memberDealershipIds)] };
}
