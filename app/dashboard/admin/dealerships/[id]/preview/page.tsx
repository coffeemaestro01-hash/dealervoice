import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DealerPreviewPage(props: { params: Promise<{ id: string }> }) {
  await requireAdminPage("/dashboard/admin/dealerships", "SUPER_ADMIN", "SUPPORT", "MODERATOR", "REVENUE");
  const { id } = await props.params;

  const dealer = await prisma.dealership.findUnique({
    where: { id },
    include: {
      subscription: true,
      staff: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { reviews: true, claims: true } },
    },
  });
  if (!dealer) notFound();

  const owner = dealer.staff.find((s) => s.role === "owner");

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <Link href="/dashboard/admin/dealerships" className="text-sm text-primary hover:underline">← Dealerships</Link>
      <div>
        <h1 className="text-2xl font-bold">{dealer.name}</h1>
        <p className="text-muted-foreground">Support preview · read-only dealer context</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground">Status</p>
          <Badge className="mt-1">{dealer.status}</Badge>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground">Plan</p>
          <p className="font-semibold">{dealer.subscription?.plan ?? "FREE"}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground">Reviews</p>
          <p className="font-semibold">{dealer._count.reviews}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground">Premium</p>
          <p className="font-semibold">{dealer.isPremiumClaimed ? "Yes" : "No"}</p>
        </div>
      </div>

      {owner && (
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Owner</p>
          <p className="font-medium">{owner.user.name}</p>
          <p className="text-sm text-muted-foreground">{owner.user.email}</p>
          <Link href={`/dashboard/admin/users?q=${encodeURIComponent(owner.user.email ?? "")}`} className="text-xs text-primary hover:underline mt-2 inline-block">
            Manage user →
          </Link>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Link href={`/dealership/${dealer.slug}`} target="_blank" className="text-sm px-4 py-2 border rounded-lg hover:bg-muted">
          Public profile →
        </Link>
        {owner && (
          <Link href={`/dashboard/admin/subscriptions`} className="text-sm px-4 py-2 border rounded-lg hover:bg-muted">
            Subscriptions →
          </Link>
        )}
      </div>

      <AdminNotesPanel targetType="dealership" targetId={dealer.id} />
    </div>
  );
}
