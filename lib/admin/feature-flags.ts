import prisma from "@/lib/db";

const DEFAULTS: Record<string, boolean | string | number> = {
  CLAIM_AUTO_APPROVE_ALL: false,
  COMPETITOR_ADS_ENABLED: true,
  AI_FEATURES_ENABLED: false,
  ADMIN_2FA_REQUIRED: false,
  SLACK_ALERTS_ENABLED: false,
};

export async function getFeatureFlag<T extends boolean | string | number>(
  key: keyof typeof DEFAULTS
): Promise<T> {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { key } });
    if (row?.value !== undefined) return row.value as T;
  } catch {
    /* table may not exist yet */
  }
  const envKey = key as string;
  if (process.env[envKey] === "true") return true as T;
  if (process.env[envKey] === "false") return false as T;
  return DEFAULTS[key] as T;
}

export async function getAllFeatureFlags() {
  const keys = Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[];
  const entries = await Promise.all(keys.map(async (k) => [k, await getFeatureFlag(k)] as const));
  return Object.fromEntries(entries);
}

export async function setFeatureFlag(key: string, value: boolean | string | number, updatedBy?: string) {
  await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value, updatedBy },
    update: { value, updatedBy, updatedAt: new Date() },
  });
}
