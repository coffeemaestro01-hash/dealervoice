/**
 * Seed DealerVoice research articles (category: Research).
 * Usage: npm run seed:research
 *
 * Optionally uses Gemini/OpenAI when keys are present; otherwise seeds static editorial content.
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";
import { RESEARCH_ARTICLES } from "./data/research-articles";
import { RESEARCH_CATEGORY } from "../lib/research/constants";
loadProjectEnv();
const prisma = new PrismaClient();

function publishedAt(daysAgo = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function main() {
  console.log(`📚 Seeding ${RESEARCH_ARTICLES.length} research articles…`);

  for (const article of RESEARCH_ARTICLES) {
    const authorName = article.authorName ?? "DealerVoice Research";
    const published = publishedAt(article.daysAgo ?? 0);
    const metaDesc = article.metaDesc ?? article.excerpt;

    await prisma.blogPost.upsert({
      where: { slug: article.slug },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        category: RESEARCH_CATEGORY,
        tags: article.tags,
        authorName,
        isPublished: true,
        publishedAt: published,
        metaTitle: article.metaTitle ?? article.title,
        metaDesc: article.metaDesc ?? metaDesc,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        category: RESEARCH_CATEGORY,
        tags: article.tags,
        authorName,
        isPublished: true,
        publishedAt: published,
        metaTitle: article.metaTitle ?? article.title,
        metaDesc: article.metaDesc ?? metaDesc,
      },
    });
    console.log(`  ✅ ${article.slug}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
