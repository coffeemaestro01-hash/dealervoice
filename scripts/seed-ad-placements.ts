/**
 * Seed live India affiliate ad placements.
 * Usage: DATABASE_URL=... npx tsx scripts/seed-ad-placements.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UTM = "utm_source=dealervoice&utm_medium=sponsored";

const PLACEMENTS = [
  {
    slot: "homepage_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Compare car loan rates in minutes",
    subheadline: "Check eligibility across leading Indian banks — no dealership pressure.",
    ctaLabel: "Check loan offers",
    ctaHref: `https://www.bankbazaar.com/car-loan.html?${UTM}&utm_campaign=financing`,
    badge: "Car Loan · India",
    accent: "from-gold-600 to-amber-500",
    countryCode: "IN",
    cpcEstimatePaise: 4500,
    priority: 10,
  },
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Save on car insurance in India",
    subheadline: "Compare comprehensive & third-party policies from top insurers — takes under 2 minutes.",
    ctaLabel: "Get a quote",
    ctaHref: `https://www.policybazaar.com/motor-insurance/car-insurance/?${UTM}&utm_campaign=insurance`,
    badge: "Insurance Partner",
    accent: "from-indigo-700 to-blue-800",
    countryCode: "IN",
    cpcEstimatePaise: 8500,
    priority: 10,
  },
  {
    slot: "homepage_dealer",
    adType: "Sponsored_Local_Dealer",
    headline: "Promote your dealership on DealerVoice",
    subheadline: "Reach in-market car buyers researching dealers in your city. Sponsored slots from ₹15k/month.",
    ctaLabel: "Advertise with us",
    ctaHref: "/advertise",
    badge: "Sponsored listing",
    accent: "from-slate-800 to-slate-900",
    countryCode: "IN",
    cpcEstimatePaise: 0,
    priority: 10,
  },
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Instant car insurance with Acko",
    subheadline: "Buy or renew car insurance online — zero paperwork, instant policy.",
    ctaLabel: "Insure now",
    ctaHref: `https://www.acko.com/car-insurance/?${UTM}&utm_campaign=acko_insurance`,
    badge: "Acko Insurance",
    accent: "from-purple-700 to-violet-800",
    countryCode: "IN",
    cpcEstimatePaise: 6000,
    priority: 5,
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
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
