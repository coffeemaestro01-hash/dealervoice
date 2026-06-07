import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) redirect("/");
  return user;
}

export function isAdmin(role: string) {
  return (
    role === UserRole.MODERATOR ||
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.SUPPORT ||
    role === UserRole.REVENUE
  );
}

export function isDealerAdmin(role: string) {
  return (
    role === UserRole.DEALER_OWNER ||
    role === UserRole.DEALER_GROUP_ADMIN ||
    isAdmin(role)
  );
}
