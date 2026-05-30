import { requireRole } from "@/lib/auth/session";
import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole("MODERATOR", "SUPER_ADMIN");
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
