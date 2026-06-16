import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminReportsPanel } from "./AdminReportsPanel";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  const [flaggedReviews, openReports, recentActions] = await Promise.all([
    prisma.review.count({ where: { status: "FLAGGED" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.moderationAction.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { moderator: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Moderation</h1>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/admin/reviews?status=FLAGGED" className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
          <p className="text-sm text-muted-foreground">Flagged reviews</p>
          <p className="text-3xl font-bold text-destructive">{flaggedReviews}</p>
          <p className="text-xs text-primary mt-2">Review queue →</p>
        </Link>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Open reports</p>
          <p className="text-3xl font-bold text-primary">{openReports}</p>
        </div>
      </div>

      <h2 className="font-semibold text-foreground mb-3">Open reports</h2>
      <div className="bg-card rounded-xl border border-border mb-8">
        <AdminReportsPanel />
      </div>
      <h2 className="font-semibold text-foreground mb-3">Recent actions</h2>
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {recentActions.length === 0 ? (
          <p className="p-6 text-muted-foreground text-sm">No moderation actions yet.</p>
        ) : (
          recentActions.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-foreground">{a.type.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{a.moderator.name}</span>
                <Badge variant="outline">{new Date(a.createdAt).toLocaleDateString()}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
