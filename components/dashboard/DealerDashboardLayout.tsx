"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, MessageSquare, Settings, Users, Star, TrendingUp, CreditCard, Award, LayoutDashboard, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/dealer", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/dealer/leads", icon: Mail, label: "Leads" },
  { href: "/dashboard/dealer/reviews", icon: MessageSquare, label: "Reviews" },
  { href: "/dashboard/dealer/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/dealer/competitors", icon: TrendingUp, label: "Competitors" },
  { href: "/dashboard/dealer/team", icon: Users, label: "Team" },
  { href: "/dashboard/dealer/settings", icon: Settings, label: "Settings" },
];

export function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 fixed h-full z-10">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-gold-800">
            <Star className="fill-current" size={18} />
            DealerVoice
          </Link>
          <span className="text-xs text-gray-500 mt-0.5 block">Dealer Dashboard</span>
        </div>

        <nav className="p-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                  active
                    ? "bg-gold-50 text-gold-800"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link href="/pricing" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <CreditCard size={16} />
            Upgrade Plan
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
