import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true, slug: true, title: true, isPublished: true, publishedAt: true, updatedAt: true, category: true,
    },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CMS — Blog</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/blog">View public blog</Link>
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {posts.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No blog posts yet. Seed content or add via Prisma Studio.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400">/{p.slug} · {p.category ?? "Uncategorized"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.isPublished ? "default" : "outline"}>
                  {p.isPublished ? "Published" : "Draft"}
                </Badge>
                {p.isPublished && (
                  <Link href={`/blog/${p.slug}`} className="text-xs text-gold-700 hover:underline">View</Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
