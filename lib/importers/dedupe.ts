import type { PrismaClient } from "@prisma/client";

export function normalizePhone(phone: string | null | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export type ExistingDealer = {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  postalCode: string | null;
  email: string | null;
};

export function buildDuplicateIndex(existing: ExistingDealer[]) {
  const byPhone = new Map<string, ExistingDealer>();
  const byNamePostal = new Map<string, ExistingDealer>();

  for (const d of existing) {
    const phoneKey = normalizePhone(d.phone);
    if (phoneKey.length >= 10 && !byPhone.has(phoneKey)) byPhone.set(phoneKey, d);
    if (d.postalCode) {
      const key = `${d.name.toLowerCase()}|${d.postalCode}`;
      if (!byNamePostal.has(key)) byNamePostal.set(key, d);
    }
  }

  return { byPhone, byNamePostal };
}

export function findDuplicate(
  dealer: { name: string; phone?: string | null; postalCode?: string | null },
  index: ReturnType<typeof buildDuplicateIndex>,
) {
  const phoneKey = normalizePhone(dealer.phone);
  if (phoneKey.length >= 10) {
    const hit = index.byPhone.get(phoneKey);
    if (hit) return hit;
  }
  if (dealer.postalCode) {
    const hit = index.byNamePostal.get(`${dealer.name.toLowerCase()}|${dealer.postalCode}`);
    if (hit) return hit;
  }
  return null;
}

export async function loadIndiaDealerIndex(prisma: PrismaClient) {
  const country = await prisma.country.findUnique({ where: { code: "IN" } });
  if (!country) throw new Error("India country record missing");

  const existing = await prisma.dealership.findMany({
    where: { countryId: country.id, deletedAt: null },
    select: { id: true, slug: true, name: true, phone: true, postalCode: true, email: true },
  });

  return { country, index: buildDuplicateIndex(existing), existing };
}
