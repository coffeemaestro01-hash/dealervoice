import { requireRole } from "@/lib/auth/session";
import { DealerDashboardLayout } from "@/components/dashboard/DealerDashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole("DEALER_OWNER", "DEALER_GROUP_ADMIN", "MODERATOR", "SUPER_ADMIN");
  return <DealerDashboardLayout>{children}</DealerDashboardLayout>;
}
