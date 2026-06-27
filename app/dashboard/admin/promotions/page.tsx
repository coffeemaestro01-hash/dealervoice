import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminPromotionsTabs } from "@/components/admin/AdminPromotionsTabs";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  await requireAdminPage("/dashboard/admin/promotions", "SUPER_ADMIN");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Promotions</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Chicago Jackpot, billing-period bonuses, and Stripe discount codes.
      </p>
      <AdminPromotionsTabs />
    </div>
  );
}
