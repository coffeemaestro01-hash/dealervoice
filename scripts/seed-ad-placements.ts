/**
 * Seed U.S. affiliate ad placements.
 * Usage: DATABASE_URL=... npx tsx scripts/seed-ad-placements.ts
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();
const UTM = "utm_source=dealervoice&utm_medium=sponsored";

const PLACEMENTS = [
  {
    slot: "homepage_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Compare auto loan rates in minutes",
    subheadline: "Check eligibility from national lenders — no dealership pressure.",
    ctaLabel: "Explore financing",
    ctaHref: `https://www.bankrate.com/loans/auto-loans/?${UTM}&utm_campaign=financing`,
    badge: "Auto financing · U.S.",
    accent: "from-gold-600 to-amber-500",
    countryCode: "US",
    cpcEstimatePaise: 450,
    priority: 10,
  },
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Save on car insurance",
    subheadline: "Compare policies from top U.S. insurers — takes under 2 minutes.",
    ctaLabel: "Get a quote",
    ctaHref: `https://www.progressive.com/auto/?${UTM}&utm_campaign=insurance`,
    badge: "Insurance Partner",
    accent: "from-indigo-700 to-blue-800",
    countryCode: "US",
    cpcEstimatePaise: 850,
    priority: 10,
  },
  {
    slot: "homepage_dealer",
    adType: "Sponsored_Local_Dealer",
    headline: "Promote your dealership on DealerVoice",
    subheadline: "Reach in-market buyers in Chicago and nationwide. Sponsored slots from $299/month.",
    ctaLabel: "Advertise with us",
    ctaHref: "/advertise",
    badge: "Sponsored listing",
    accent: "from-slate-800 to-slate-900",
    countryCode: "US",
    cpcEstimatePaise: 0,
    priority: 10,
  },
];

async function main() {
  console.log("📢 Seeding ad placements…");
  for (const p of PLACEMENTS) {
    const existing = await prisma.adPlacement.findFirst({
      where: { slot: p.slot, adType: p.adType, countryCode: p.countryCode, headline: p.headline },
    });
    if (existing) {
      await prisma.adPlacement.update({ where: { id: existing.id }, data: { ...p, isActive: true } });
      console.log(`  ↻ updated ${p.slot} / ${p.headline.slice(0, 30)}…`);
    } else {
      await prisma.adPlacement.create({ data: { ...p, isActive: true } });
      console.log(`  ✅ created ${p.slot} / ${p.headline.slice(0, 30)}…`);
    }
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
