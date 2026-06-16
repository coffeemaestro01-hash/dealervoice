import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/common/StarRating";
import { AdminReviewActions } from "./AdminReviewActions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 25;

  const where: any = {};
  if (status) where.status = status;

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        author: { select: { name: true, email: true } },
        dealership: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">Reviews</h1>
      <div className="flex gap-2 mb-6">
        {["", "PUBLISHED", "PENDING", "FLAGGED", "REMOVED"].map((s) => (
          <Link
            key={s || "all"}
            href={`/dashboard/admin/reviews${s ? `?status=${s}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-sm ${status === s ? "bg-primary text-foreground" : "bg-card border border-border text-muted-foreground"}`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={r.overallRating} size="sm" />
                  <Badge variant="outline">{r.status}</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {r.author.name} · <Link href={`/dealership/${r.dealership.slug}`} className="text-primary hover:underline">{r.dealership.name}</Link>
                </p>
              </div>
              <AdminReviewActions id={r.id} status={r.status} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-4">{total} reviews</p>
    </div>
  );
}
