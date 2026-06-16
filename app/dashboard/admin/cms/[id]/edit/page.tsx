import { requireAuth } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";

export default async function EditBlogPostPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  const { id } = await props.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/admin/cms" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to CMS
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Edit: {post.title}</h1>
      <BlogPostEditor
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          authorName: post.authorName,
          category: post.category ?? "",
          isPublished: post.isPublished,
          metaTitle: post.metaTitle ?? "",
          metaDesc: post.metaDesc ?? "",
        }}
      />
    </div>
  );
}
