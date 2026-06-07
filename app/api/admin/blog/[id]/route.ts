import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { blogPostSchema } from "@/lib/validations";
import { isAdminRole } from "@/lib/admin/guards";
import { logAdminAction } from "@/lib/admin/audit";

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = blogPostSchema.partial().safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing valid to update" }, { status: 422 });
  }

  if (parsed.data.slug) {
    const clash = await prisma.blogPost.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (clash) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.isPublished === true) data.publishedAt = new Date();
  if (parsed.data.coverImage === "") data.coverImage = null;

  const post = await prisma.blogPost.update({ where: { id }, data });

  await logAdminAction({
    userId: session.user.id,
    action: "blog.update",
    resource: "BlogPost",
    resourceId: id,
    newValues: parsed.data,
  });

  return NextResponse.json({ data: post });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.blogPost.delete({ where: { id } });

  await logAdminAction({
    userId: session.user.id,
    action: "blog.delete",
    resource: "BlogPost",
    resourceId: id,
  });

  return NextResponse.json({ message: "Deleted" });
}
