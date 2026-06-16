import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const actionFilter = (sp.action ?? "").trim();
  const limit = 40;

  const where = actionFilter
    ? { action: { contains: actionFilter, mode: "insensitive" as const } }
    : {};

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Audit log</h1>
      <p className="text-sm text-muted-foreground mb-6">Administrative actions across users, dealerships, claims, and subscriptions.</p>

      <form className="flex gap-2 mb-6" action="/dashboard/admin/audit" method="get">
        <input
          name="action"
          defaultValue={actionFilter}
          placeholder="Filter by action (e.g. user.admin_delete)"
          className="border border-border rounded-lg px-3 py-2 text-sm w-72"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-foreground rounded-lg text-sm font-medium">
          Filter
        </button>
      </form>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {logs.length === 0 ? (
          <p className="p-6 text-muted-foreground text-sm">No audit entries found.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline">{log.action}</Badge>
                <span className="text-muted-foreground">{log.resource}</span>
                {log.resourceId && <span className="text-xs text-muted-foreground font-mono">{log.resourceId}</span>}
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-muted-foreground">
                by {log.user?.name ?? "System"} {log.user?.email ? `(${log.user.email})` : ""}
              </p>
              {log.newValues != null && (
                <pre className="text-xs text-muted-foreground mt-1 bg-muted rounded p-2 overflow-x-auto">
                  {JSON.stringify(log.newValues, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        {total} entries · page {page} of {totalPages}
      </p>
    </div>
  );
}
