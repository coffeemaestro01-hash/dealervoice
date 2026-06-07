import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { canAccessAdminRoute, isStaffRole } from "@/lib/admin/permissions";
import type { UserRole } from "@prisma/client";

export async function requireAdminPage(pathname: string, ...allowed: UserRole[]) {
  const user = await requireAuth();
  if (!isStaffRole(user.role)) redirect("/");
  const role = user.role as UserRole;
  if (allowed.length > 0 && !allowed.includes(role) && role !== "SUPER_ADMIN") {
    redirect("/dashboard/admin");
  }
  if (!canAccessAdminRoute(role, pathname)) redirect("/dashboard/admin");
  return user;
}
