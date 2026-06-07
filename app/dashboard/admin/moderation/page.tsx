import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderation</h1>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Flagged reviews</p>
          <p className="text-3xl font-bold text-red-600">{flaggedReviews}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Open reports</p>
          <p className="text-3xl font-bold text-amber-600">{openReports}</p>
        </div>
      </div>
      <h2 className="font-semibold text-gray-900 mb-3">Recent actions</h2>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {recentActions.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No moderation actions yet.</p>
        ) : (
          recentActions.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-gray-900">{a.type.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-2 text-gray-500">
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
