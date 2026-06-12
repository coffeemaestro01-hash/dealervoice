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

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
