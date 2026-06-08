/**
 * Seed India-first blog posts for SEO + AI citation.
 * Usage: DATABASE_URL=... npx tsx scripts/seed-blog-india.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const POSTS = [
  {
    slug: "how-to-review-car-dealership-india",
    title: "How to Review a Car Dealership in India",
    excerpt: "A step-by-step guide to sharing your dealership experience on DealerVoice — what to include, what helps other buyers, and how verification works.",
    category: "Guides",
    tags: ["india", "reviews", "buyers"],
    content: `<h2>Why your review matters</h2>
<p>Buying a car in India involves significant research — price transparency, delivery timelines, after-sales service, and financing terms all vary by dealership. Your review helps the next buyer make a confident decision.</p>
<h2>What to include</h2>
<ul><li>Which dealership and city</li><li>New or used purchase, or service visit</li><li>Ratings for transparency, pricing, service, delivery, and after-sales</li><li>Specific details — not just "good" or "bad"</li></ul>
<h2>Verification</h2>
<p>DealerVoice supports verified purchase and service reviews. Uploading a redacted invoice or service receipt strengthens trust without exposing personal data.</p>`,
  },
  {
    slug: "dealer-red-flags-india",
    title: "7 Red Flags When Buying from a Car Dealer in India",
    excerpt: "Warning signs to watch for at Indian dealerships — from hidden charges to pressure tactics — and how to protect yourself.",
    category: "Buyer safety",
    tags: ["india", "tips", "dealers"],
    content: `<h2>Before you sign</h2>
<p>Indian car buyers face unique challenges: on-road price confusion, accessory bundling, extended warranty upsells, and delivery delays. Here are seven red flags.</p>
<ol><li>Refusal to provide itemised on-road quote in writing</li><li>Pressure to buy accessories or insurance on the spot</li><li>No test drive or VIN verification for used cars</li><li>Verbal promises not reflected in the agreement</li><li>Unregistered or unclaimed dealership profile online</li><li>Negative patterns in recent buyer reviews</li><li>Missing RTO or insurance documentation at delivery</li></ol>`,
  },
  {
    slug: "authorized-vs-used-dealer-india",
    title: "Authorized Dealer vs Used Car Dealer: What to Trust in India",
    excerpt: "Understanding the difference between OEM-authorized showrooms, multi-brand outlets, and independent used car lots.",
    category: "Guides",
    tags: ["india", "used-cars", "authorized"],
    content: `<h2>Authorized dealers</h2>
<p>OEM-authorized dealerships sell new vehicles with factory warranty, standardised pricing frameworks, and manufacturer-backed service.</p>
<h2>Used car dealers</h2>
<p>Independent lots offer flexibility but vary widely in inspection quality, title clarity, and after-sales support. Always verify RC, insurance history, and service records.</p>
<h2>How DealerVoice helps</h2>
<p>Search by city or state, compare reputation scores, and read category-specific reviews for sales vs service before you visit.</p>`,
  },
  {
    slug: "dpdp-rights-car-buyers-india",
    title: "Your Data Rights as a Car Buyer Under India's DPDP Act",
    excerpt: "What India's Digital Personal Data Protection Act means when you leave reviews, request quotes, or share documents with dealerships.",
    category: "Privacy",
    tags: ["india", "dpdp", "privacy"],
    content: `<h2>Your rights</h2>
<p>Under the DPDP Act, you have the right to know how your data is used, request correction or erasure, and withdraw consent for marketing.</p>
<h2>On DealerVoice</h2>
<p>We collect only what's needed to publish and verify reviews. See our Privacy Policy and Grievance Officer contact for DSR requests.</p>`,
  },
  {
    slug: "maruti-hyundai-tata-dealer-tips",
    title: "Tips for Choosing Maruti, Hyundai, or Tata Dealers in India",
    excerpt: "Brand-specific advice for comparing authorized dealerships — waiting periods, service network, and exchange offers.",
    category: "Brands",
    tags: ["india", "maruti", "hyundai", "tata"],
    content: `<h2>Compare within the brand</h2>
<p>Even within the same OEM, dealership experience varies by city. Compare delivery timelines, exchange valuations, and service centre proximity.</p>
<p>Use DealerVoice to read reviews filtered by brand and location before booking a test drive.</p>`,
  },
  {
    slug: "what-dealervoice-verified-reviews-mean",
    title: "What DealerVoice Verified Reviews Mean",
    excerpt: "How we verify purchase and service reviews, fight fake feedback, and calculate reputation scores.",
    category: "Trust",
    tags: ["methodology", "verification"],
    content: `<h2>Verification levels</h2>
<p>Reviews can be unverified (still valuable), verified purchase, or verified service based on document review.</p>
<h2>Reputation scores</h2>
<p>Scores aggregate published reviews across transparency, pricing, service, delivery, and after-sales dimensions. Empty profiles show no score until real reviews exist.</p>
<p>Full methodology: <a href="/methodology">dealervoice.io/methodology</a></p>`,
  },
];

async function main() {
  console.log("📝 Seeding India blog posts…");
  for (const p of POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        ...p,
        authorName: "DealerVoice Editorial",
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: p.title,
        metaDesc: p.excerpt,
      },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        tags: p.tags,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    console.log(`  ✅ ${p.slug}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
