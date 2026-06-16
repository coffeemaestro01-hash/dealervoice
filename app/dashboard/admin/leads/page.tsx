import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminLeadActions } from "./AdminLeadActions";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdminPage("/dashboard/admin/leads", "SUPER_ADMIN", "REVENUE", "SUPPORT");

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { dealership: { select: { name: true, slug: true, cityName: true } } },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Global lead inbox</h1>
      <p className="text-sm text-muted-foreground mb-6">All customer leads across dealerships.</p>
      <div className="bg-card rounded-xl border divide-y">
        {leads.length === 0 ? (
          <p className="p-6 text-muted-foreground text-sm">No leads yet.</p>
        ) : (
          leads.map((l) => (
            <div key={l.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{l.name} · {l.email}</p>
                <p className="text-sm text-muted-foreground">{l.dealership.name} · {l.type}</p>
                {l.message && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(l.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge>{l.status}</Badge>
                <AdminLeadActions id={l.id} status={l.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
