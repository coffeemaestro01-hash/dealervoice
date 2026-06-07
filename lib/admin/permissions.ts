import type { UserRole } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Store,
  MessageSquare,
  CreditCard,
  Flag,
  FileText,
  ScrollText,
  DollarSign,
  Inbox,
  Megaphone,
  Wallet,
  Shield,
  Database,
  Globe,
  Mail,
  Sparkles,
  Activity,
  Settings,
  UsersRound,
  ClipboardCheck,
} from "lucide-react";

export type AdminTeam = "founder" | "ops" | "trust" | "growth" | "platform";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  team: AdminTeam;
  roles: UserRole[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true, team: "founder", roles: ["SUPER_ADMIN", "REVENUE", "MODERATOR", "SUPPORT"] },
  { href: "/dashboard/admin/revenue", label: "Revenue", icon: DollarSign, team: "founder", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/leads", label: "Leads", icon: Inbox, team: "ops", roles: ["SUPER_ADMIN", "REVENUE", "SUPPORT"] },
  { href: "/dashboard/admin/sponsors", label: "Sponsors", icon: Megaphone, team: "founder", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/payments", label: "Payments", icon: Wallet, team: "founder", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/inbox", label: "Unified inbox", icon: Flag, team: "ops", roles: ["SUPER_ADMIN", "SUPPORT", "MODERATOR"] },
  { href: "/dashboard/admin/users", label: "Users", icon: Users, team: "trust", roles: ["SUPER_ADMIN", "MODERATOR", "SUPPORT"] },
  { href: "/dashboard/admin/dealerships", label: "Dealerships", icon: Store, team: "ops", roles: ["SUPER_ADMIN", "MODERATOR", "SUPPORT", "REVENUE"] },
  { href: "/dashboard/admin/claims", label: "Claims", icon: ClipboardCheck, team: "ops", roles: ["SUPER_ADMIN", "SUPPORT", "MODERATOR"] },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: MessageSquare, team: "trust", roles: ["SUPER_ADMIN", "MODERATOR"] },
  { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: CreditCard, team: "founder", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/data-quality", label: "Data quality", icon: Database, team: "growth", roles: ["SUPER_ADMIN", "REVENUE", "SUPPORT"] },
  { href: "/dashboard/admin/geo", label: "Geo coverage", icon: Globe, team: "growth", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/campaigns", label: "Campaigns", icon: Mail, team: "growth", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/merchandising", label: "Merchandising", icon: Sparkles, team: "growth", roles: ["SUPER_ADMIN", "REVENUE"] },
  { href: "/dashboard/admin/cms", label: "CMS", icon: FileText, team: "growth", roles: ["SUPER_ADMIN", "MODERATOR"] },
  { href: "/dashboard/admin/dsr", label: "Privacy (DSR)", icon: Shield, team: "trust", roles: ["SUPER_ADMIN", "MODERATOR"] },
  { href: "/dashboard/admin/health", label: "System health", icon: Activity, team: "platform", roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings, team: "platform", roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/admin/team", label: "Team & roles", icon: UsersRound, team: "platform", roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/admin/audit", label: "Audit log", icon: ScrollText, team: "founder", roles: ["SUPER_ADMIN"] },
];

export const TEAM_LABELS: Record<AdminTeam, string> = {
  founder: "Founder / Revenue",
  ops: "Ops & Support",
  trust: "Trust & Safety",
  growth: "Growth & Content",
  platform: "Platform",
};

export function isStaffRole(role?: string | null): boolean {
  return !!role && ["SUPER_ADMIN", "MODERATOR", "SUPPORT", "REVENUE"].includes(role);
}

export function getNavForRole(role: UserRole): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => item.roles.includes(role));
}

export function canAccessAdminRoute(role: UserRole, pathname: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const item = ADMIN_NAV.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  );
  if (!item) return pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/dealerships/");
  return item.roles.includes(role);
}

export const TEAM_MATRIX = [
  { team: "Founder / you", areas: "Revenue, Subscriptions, Sponsors, Payments, Audit" },
  { team: "Ops / Support", areas: "Leads, Claims, Unified inbox, Dealerships, Dealer preview" },
  { team: "Trust & Safety", areas: "Reviews, Users, Privacy (DSR), Moderation" },
  { team: "Growth / Content", areas: "CMS, Campaigns, Data quality, Geo, Merchandising" },
  { team: "Platform (super admin)", areas: "Settings, Health, Team & roles, Feature flags" },
] as const;
