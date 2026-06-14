import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdminPage("/dashboard/admin/payments", "SUPER_ADMIN", "REVENUE");

  const [webhooks, invoices] = await Promise.all([
    prisma.webhookLog.findMany({
      where: { provider: "stripe" },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        dealership: { select: { name: true } },
        subscription: { include: { dealership: { select: { name: true } } } },
      },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Payments & webhooks</h1>
      <p className="text-sm text-gray-500">Stripe is the sole payment provider for subscriptions and platform billing.</p>

      <section>
        <h2 className="font-semibold mb-3">Stripe webhook log</h2>
        <div className="bg-white rounded-xl border divide-y max-h-96 overflow-y-auto">
          {webhooks.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No webhook events yet.</p>
          ) : (
            webhooks.map((w) => (
              <div key={w.id} className="px-4 py-2 text-sm flex justify-between gap-4">
                <span className="font-mono text-xs">{w.event}</span>
                <Badge variant={w.status === "success" ? "default" : "outline"}>{w.status}</Badge>
                <span className="text-gray-400 text-xs">{new Date(w.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Recent invoices</h2>
        <div className="bg-white rounded-xl border divide-y">
          {invoices.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No invoices yet.</p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex justify-between text-sm">
                <span>{inv.dealership.name}</span>
                <span>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: inv.currency || "USD" }).format(
                    inv.amount / 100
                  )}{" "}
                  · {inv.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
