import prisma from "@/lib/db";
import { RESEARCH_CATEGORY } from "./constants";

const researchWhere = {
  isPublished: true,
  category: RESEARCH_CATEGORY,
} as const;

export async function getResearchArticles(limit = 50) {
  return prisma.blogPost.findMany({
    where: researchWhere,
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      coverImage: true,
      tags: true,
      authorName: true,
    },
  });
}

export async function getResearchArticleBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { ...researchWhere, slug },
  });
}

export function isResearchPost(category: string | null | undefined): boolean {
  return category === RESEARCH_CATEGORY;
}
