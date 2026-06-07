import type { UserRole } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["MODERATOR", "SUPER_ADMIN", "SUPPORT", "REVENUE"];

export function isAdminRole(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole);
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageUser(
  actor: { id: string; role: string },
  target: { id: string; role: string }
): { ok: true } | { ok: false; error: string } {
  if (actor.id === target.id) {
    return { ok: false, error: "You cannot modify your own account here." };
  }
  if (target.role === "SUPER_ADMIN" && !isSuperAdmin(actor.role)) {
    return { ok: false, error: "Only super admins can manage other super admins." };
  }
  if (target.role === "MODERATOR" && actor.role === "MODERATOR") {
    return { ok: false, error: "Moderators cannot manage other moderators." };
  }
  return { ok: true };
}
