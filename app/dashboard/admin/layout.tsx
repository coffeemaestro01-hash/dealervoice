import { requireRole } from "@/lib/auth/session";
import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";
import type { UserRole } from "@prisma/client";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MODERATOR", "SUPER_ADMIN", "SUPPORT", "REVENUE");
  // Route-level guard handled per-page; layout only checks staff role
  return <AdminDashboardLayout userRole={user.role as UserRole}>{children}</AdminDashboardLayout>;
}
