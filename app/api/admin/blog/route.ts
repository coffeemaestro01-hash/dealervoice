import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { blogPostSchema } from "@/lib/validations";
import { isAdminRole } from "@/lib/admin/guards";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const post = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      coverImage: parsed.data.coverImage || null,
      category: parsed.data.category ?? null,
      tags: parsed.data.tags ?? [],
      isPublished: parsed.data.isPublished ?? false,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "blog.create",
    resource: "BlogPost",
    resourceId: post.id,
    newValues: { title: post.title, slug: post.slug },
  });

  return NextResponse.json({ data: post }, { status: 201 });
}
