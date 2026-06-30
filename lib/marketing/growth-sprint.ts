import prisma from "@/lib/db";
import { planAmountCents } from "@/lib/payment";
import { getIncomeDashboard } from "@/lib/income/ledger";
import { getOutreachDripStats } from "@/lib/outreach/discover-emails";
import { getMarketCoverageStats } from "@/lib/marketing/coverage-stats";

export const GROWTH_TARGETS = {
  publishedReviews: 10,
  activeProSubs: 5,
  mrrDollars: 995,
  ilDealersWithEmail: 25,
  dripsActive: 50,
} as const;

export const MARKETING_PLAYBOOK = [
  {
    week: 1,
    theme: "Trust liquidity",
    actions: [
      "Automated review nudges to claimed dealers (daily cron)",
      "Review seeding links live for top IL dealers",
      "Chicago landing + homepage dealer CTA driving claims",
    ],
    target: "10 published reviews",
  },
  {
    week: 2,
    theme: "Outreach scale",
    actions: [
      "Email discovery runs Tue (IL) + Thu (all US) via cron",
      "Outreach drip auto-starts 25 IL + 50 US dealers daily",
      "Step-3 drip offers $1/mo Pro pilot with unique promo codes",
    ],
    target: "25+ IL dealers with email, 50 active drips",
  },
  {
    week: 3,
    theme: "Close Pro & Pro+",
    actions: [
      "Featured badge embeds on every paying dealer dashboard",
      "Pro+ ($349) positioned as featured + backlink tier on billing",
      "Follow up drip replies at info@dealervoice.io within 4 hours",
    ],
    target: "3 paying dealers ($597+ MRR minimum)",
  },
  {
    week: 4,
    theme: "Monetize traffic",
    actions: [
      "Sponsorship outreach to top Chicago independents ($299 city spotlight)",
      "Lead fee follow-up when quotes come in — auto-notify dealers",
      "Affiliate: prioritize highest-EPC Admitad programs on homepage",
    ],
    target: "$1,000+ MRR, 1 sponsorship, first lead conversion",
  },
] as const;

export async function getGrowthSprintMetrics() {
  const coverage = await getMarketCoverageStats();

  const [
    publishedReviews,
    proSubs,
    proPlusSubs,
    enterpriseSubs,
    income,
    outreach,
    ilEmail,
    claimsPending,
    leadsNew,
  ] = await Promise.all([
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.dealerSubscription.count({ where: { plan: "PRO", status: "ACTIVE" } }),
    prisma.dealerSubscription.count({ where: { plan: "PRO_PLUS", status: "ACTIVE" } }),
    prisma.dealerSubscription.count({ where: { plan: "ENTERPRISE", status: "ACTIVE" } }),
    getIncomeDashboard(90),
    getOutreachDripStats(),
    prisma.country.findUnique({ where: { code: "US" } }).then((c) =>
      c
        ? prisma.dealership.count({
            where: {
              countryId: c.id,
              deletedAt: null,
              email: { contains: "@" },
              OR: [{ stateName: "IL" }, { stateName: { contains: "Illinois", mode: "insensitive" } }],
            },
          })
        : 0
    ),
    prisma.dealerClaim.count({ where: { status: "PENDING" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
  ]);

  const paidSubs = proSubs + proPlusSubs + enterpriseSubs;
  const mrrDollars =
    (proSubs * planAmountCents("PRO", "monthly") +
      proPlusSubs * planAmountCents("PRO_PLUS", "monthly") +
      enterpriseSubs * planAmountCents("ENTERPRISE", "monthly")) /
    100;
  const confirmedRevenue = income.confirmedTotalMinor / 100;

  return {
    coverage,
    publishedReviews,
    paidSubs,
    proSubs,
    proPlusSubs,
    enterpriseSubs,
    mrrDollars,
    confirmedRevenue,
    estimatedAffiliate: income.estimatedTotalMinor / 100,
    outreach,
    ilEmail,
    claimsPending,
    leadsNew,
    targets: GROWTH_TARGETS,
    playbook: MARKETING_PLAYBOOK,
    progress: {
      reviews: Math.min(100, Math.round((publishedReviews / GROWTH_TARGETS.publishedReviews) * 100)),
      subs: Math.min(100, Math.round((paidSubs / GROWTH_TARGETS.activeProSubs) * 100)),
      mrr: Math.min(100, Math.round((mrrDollars / GROWTH_TARGETS.mrrDollars) * 100)),
      ilEmail: Math.min(100, Math.round((ilEmail / GROWTH_TARGETS.ilDealersWithEmail) * 100)),
    },
  };
}
