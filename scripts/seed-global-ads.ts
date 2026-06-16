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
    accent: "bg-ember",
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
    accent: "bg-ember",
    countryCode: "US",
    cpcEstimatePaise: 8000,
    priority: 10,
  },
  {
    slot: "homepage_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Drive with Yango",
    subheadline: "Flexible car rental — book online in minutes.",
    ctaLabel: "Book a car",
    ctaHref: "https://zmgig.com/g/zm0bbusas051daf7bf5cf9ed9c6b58/",
    badge: "Yango Drive · Partner",
    accent: "bg-ember",
    countryCode: "US",
    cpcEstimatePaise: 10000,
    priority: 15,
  },
  {
    slot: "homepage_insurance",
    adType: "Auto_Ecosystem_Partner",
    headline: "Save on car insurance with Acko",
    subheadline: "Compare and buy car insurance online — quick quotes, digital policy.",
    ctaLabel: "Get a quote",
    ctaHref: "https://tjzuh.com/g/yapee0pvwc51daf7bf5cd745de94b6/",
    badge: "Acko · Car insurance",
    accent: "bg-ember",
    countryCode: "IN",
    cpcEstimatePaise: 12000,
    priority: 15,
  },
  {
    slot: "homepage_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Insurance made simple with Acko",
    subheadline: "Digital-first insurance — buy and manage policies in minutes.",
    ctaLabel: "Explore Acko",
    ctaHref: "https://tjzuh.com/g/77fgwqsklk51daf7bf5c829ab83632/",
    badge: "Acko · Partner",
    accent: "bg-ember",
    countryCode: "IN",
    cpcEstimatePaise: 10000,
    priority: 14,
  },
  {
    slot: "profile_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Motor insurance from ICICI Lombard",
    subheadline: "Trusted comprehensive and third-party cover for your vehicle.",
    ctaLabel: "Get covered",
    ctaHref: "https://tjzuh.com/g/gijdfu271p51daf7bf5cae105d1407/",
    badge: "ICICI Lombard · Partner",
    accent: "bg-ember",
    countryCode: "IN",
    cpcEstimatePaise: 11000,
    priority: 12,
  },
  {
    slot: "homepage_financing",
    adType: "Tier2_OEM_Offer",
    headline: "Stay connected abroad with Airalo",
    subheadline: "Instant eSIM data plans for 200+ countries — no roaming shock.",
    ctaLabel: "Get an eSIM",
    ctaHref: "https://ewwhk.com/g/olpcjo8eyw51daf7bf5c54343a3e29/",
    badge: "Airalo · Travel eSIM",
    accent: "bg-ember",
    countryCode: "IN",
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
    accent: "bg-ember",
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
    accent: "bg-ember",
    countryCode: "AU",
    cpcEstimatePaise: 9000,
    priority: 10,
  },
  {
    slot: "homepage_dealer",
    adType: "Sponsored_Local_Dealer",
    headline: "List inventory on DealerVoice",
    subheadline: "Reach in-market buyers researching dealers in your city. Pro plans from $199/mo.",
    ctaLabel: "Advertise with us",
    ctaHref: "/advertise",
    badge: "Sponsored · Global",
    accent: "bg-ember",
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
