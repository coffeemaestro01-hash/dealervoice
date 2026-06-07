import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminDsrActions } from "./AdminDsrActions";

export const dynamic = "force-dynamic";

export default async function AdminDsrPage() {
  await requireAdminPage("/dashboard/admin/dsr", "SUPER_ADMIN", "MODERATOR");

  const requests = await prisma.dsrRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy requests (DSR)</h1>
      <div className="bg-white rounded-xl border divide-y">
        {requests.length === 0 ? (
          <p className="p-6 text-gray-500">No privacy requests.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="px-4 py-4 flex justify-between items-center gap-4">
              <div>
                <p className="font-medium">{r.user.name} · {r.kind}</p>
                <p className="text-sm text-gray-500">{r.user.email}</p>
                <p className="text-xs text-gray-400">SLA {new Date(r.slaDueAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{r.status}</Badge>
                <AdminDsrActions id={r.id} status={r.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
