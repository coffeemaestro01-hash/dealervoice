import crypto from "crypto";
import prisma from "@/lib/db";

const PREFIX = "dv_live_";

function hashKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKeyRaw() {
  return `${PREFIX}${crypto.randomBytes(24).toString("hex")}`;
}

export async function ensureDealerApiKey(dealershipId: string) {
  const existing = await prisma.dealerApiKey.findUnique({ where: { dealershipId } });
  if (existing) return { key: null, prefix: existing.keyPrefix, created: false };

  const raw = generateApiKeyRaw();
  const record = await prisma.dealerApiKey.create({
    data: {
      dealershipId,
      keyHash: hashKey(raw),
      keyPrefix: raw.slice(0, 16),
    },
  });
  return { key: raw, prefix: record.keyPrefix, created: true };
}

export async function authenticateApiKey(header: string | null) {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token.startsWith(PREFIX)) return null;

  const keyHash = hashKey(token);
  const record = await prisma.dealerApiKey.findFirst({
    where: { keyHash },
    include: {
      dealership: {
        select: {
          id: true,
          slug: true,
          subscription: { select: { plan: true, apiAccess: true, status: true } },
        },
      },
    },
  });

  if (!record) return null;
  const sub = record.dealership.subscription;
  if (!sub || sub.plan !== "ENTERPRISE" || !sub.apiAccess || sub.status !== "ACTIVE") {
    return null;
  }

  await prisma.dealerApiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return record.dealership;
}
