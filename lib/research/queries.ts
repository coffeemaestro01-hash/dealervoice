import prisma from "@/lib/db";
import { RESEARCH_CATEGORY } from "./constants";
import { normalizeResearchCoverImage } from "./cover-image";

const researchWhere = {
  isPublished: true,
  category: RESEARCH_CATEGORY,
} as const;

export async function getResearchArticles(limit = 50) {
  const rows = await prisma.blogPost.findMany({
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
  return rows.map((row) => ({
    ...row,
    coverImage: normalizeResearchCoverImage(row.coverImage),
  }));
}

export async function getResearchArticleBySlug(slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { ...researchWhere, slug },
  });
  if (!post) return null;
  return {
    ...post,
    coverImage: normalizeResearchCoverImage(post.coverImage),
  };
}

export function isResearchPost(category: string | null | undefined): boolean {
  return category === RESEARCH_CATEGORY;
}
