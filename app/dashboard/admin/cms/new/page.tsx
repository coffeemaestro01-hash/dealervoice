import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";

export default async function NewBlogPostPage() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/admin/cms" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to CMS
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">New blog post</h1>
      <BlogPostEditor
        isNew
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: "",
          authorName: user.name ?? "DealerVoice Team",
          category: "",
          isPublished: false,
          metaTitle: "",
          metaDesc: "",
        }}
      />
    </div>
  );
}
