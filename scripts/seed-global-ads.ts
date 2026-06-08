/**
 * Seed worldwide affiliate ad placements (US, GB, AU + global fallback).
 * Usage: npm run seed:ads:global
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const PLACEMENTS = [
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Compare car insurance in the US",
    subheadline: "Get quotes from top insurers — takes minutes, no dealership pressure.",
    ctaLabel: "Get a quote",
    ctaHref: "https://www.progressive.com/auto/?utm_source=dealervoice&utm_medium=sponsored",
    badge: "Insurance · US",
    accent: "from-blue-700 to-indigo-800",
    countryCode: "US",
    cpcEstimatePaise: 12000,
    priority: 10,
  },
  {
    slot: "homepage_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Auto loan rates — compare before you sign",
    subheadline: "Check financing options from national lenders.",
    ctaLabel: "Compare rates",
    ctaHref: "https://www.bankrate.com/loans/auto-loans/?utm_source=dealervoice",
    badge: "Auto Loan · US",
    accent: "from-slate-700 to-slate-900",
    countryCode: "US",
    cpcEstimatePaise: 8000,
    priority: 10,
  },
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Compare UK car insurance",
    subheadline: "Third-party and comprehensive quotes from leading UK brands.",
    ctaLabel: "Compare now",
    ctaHref: "https://www.confused.com/car-insurance?utm_source=dealervoice",
    badge: "Insurance · UK",
    accent: "from-emerald-700 to-teal-800",
    countryCode: "GB",
    cpcEstimatePaise: 10000,
    priority: 10,
  },
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Compare car insurance in Australia",
    subheadline: "Compulsory third party and comprehensive cover — compare online.",
    ctaLabel: "Get quotes",
    ctaHref: "https://www.comparethemarket.com.au/car-insurance/?utm_source=dealervoice",
    badge: "Insurance · AU",
    accent: "from-amber-700 to-orange-800",
    countryCode: "AU",
    cpcEstimatePaise: 9000,
    priority: 10,
  },
  {
    slot: "homepage_dealer",
    adType: "Sponsored_Local_Dealer",
    headline: "List inventory on DealerVoice",
    subheadline: "Reach in-market buyers researching dealers in your city. From ₹15k/month.",
    ctaLabel: "Advertise with us",
    ctaHref: "/advertise",
    badge: "Sponsored · Global",
    accent: "from-slate-800 to-slate-900",
    countryCode: null,
    cpcEstimatePaise: 0,
    priority: 5,
  },
];

async function main() {
  console.log("🌍 Seeding global ad placements…");
  for (const p of PLACEMENTS) {
    const existing = await prisma.adPlacement.findFirst({
      where: { slot: p.slot, adType: p.adType, countryCode: p.countryCode, headline: p.headline },
    });
    if (existing) {
      await prisma.adPlacement.update({ where: { id: existing.id }, data: { ...p, isActive: true } });
      console.log(`  ↻ ${p.countryCode ?? "GLOBAL"} / ${p.headline.slice(0, 40)}`);
    } else {
      await prisma.adPlacement.create({ data: { ...p, isActive: true } });
      console.log(`  ✅ ${p.countryCode ?? "GLOBAL"} / ${p.headline.slice(0, 40)}`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
