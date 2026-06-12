/**
 * Seed full DealerVoice blog library (U.S.-focused guides and press).
 * Usage: npm run seed:blog
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";
import { BLOG_POSTS } from "./data/blog-posts";

loadProjectEnv();
const prisma = new PrismaClient();

function publishedAt(daysAgo = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function unpublishLegacyIndiaPosts() {
  const indiaPatterns = [
    "india",
    "mumbai",
    "delhi",
    "bangalore",
    "hyderabad",
    "chennai",
    "pune",
    "kolkata",
    "dpdp",
    "dealers/in",
    "zigwheels",
  ];
  const currentSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
  const published = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { id: true, slug: true, title: true },
  });
  const stale = published.filter(
    (p) =>
      !currentSlugs.has(p.slug) &&
      indiaPatterns.some(
        (x) =>
          p.slug.toLowerCase().includes(x) ||
          p.title.toLowerCase().includes(x)
      )
  );
  if (stale.length === 0) return;
  console.log(`🧹 Unpublishing ${stale.length} legacy India posts…`);
  for (const p of stale) {
    await prisma.blogPost.update({
      where: { id: p.id },
      data: { isPublished: false },
    });
    console.log(`  🚫 ${p.slug}`);
  }
}

async function main() {
  console.log(`📝 Seeding ${BLOG_POSTS.length} blog posts…`);

  for (const p of BLOG_POSTS) {
    const authorName = p.authorName ?? "DealerVoice Editorial";
    const published = publishedAt(p.daysAgo ?? 0);

    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        tags: p.tags,
        authorName,
        isPublished: true,
        publishedAt: published,
        metaTitle: p.title,
        metaDesc: p.excerpt,
      },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        tags: p.tags,
        authorName,
        isPublished: true,
        publishedAt: published,
        metaTitle: p.title,
        metaDesc: p.excerpt,
      },
    });
    console.log(`  ✅ ${p.slug}`);
  }

  await unpublishLegacyIndiaPosts();

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
