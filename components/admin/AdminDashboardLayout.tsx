"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavForRole, TEAM_LABELS, type AdminTeam } from "@/lib/admin/permissions";
import type { UserRole } from "@prisma/client";

export function AdminDashboardLayout({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: UserRole;
}) {
  const pathname = usePathname();
  const nav = getNavForRole(userRole);

  const byTeam = nav.reduce<Record<AdminTeam, typeof nav>>(
    (acc, item) => {
      if (!acc[item.team]) acc[item.team] = [];
      acc[item.team].push(item);
      return acc;
    },
    {} as Record<AdminTeam, typeof nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-60 bg-gray-950 fixed h-full z-10 overflow-y-auto">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Star className="fill-current text-gold-500" size={18} />
            DealerVoice
          </Link>
          <span className="text-xs text-gray-500 mt-0.5 block">Admin · {userRole.replace(/_/g, " ")}</span>
        </div>

        <nav className="p-3 flex-1 space-y-4">
          {(Object.keys(byTeam) as AdminTeam[]).map((team) => (
            <div key={team}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-1">
                {TEAM_LABELS[team]}
              </p>
              {byTeam[team].map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5",
                      active ? "bg-gold-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-60">{children}</main>
    </div>
  );
}
