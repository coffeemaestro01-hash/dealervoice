"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Store, MessageSquare, CreditCard, Flag, FileText, Star, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/admin/users", icon: Users, label: "Users" },
  { href: "/dashboard/admin/dealerships", icon: Store, label: "Dealerships" },
  { href: "/dashboard/admin/claims", icon: ClipboardCheck, label: "Claims" },
  { href: "/dashboard/admin/reviews", icon: MessageSquare, label: "Reviews" },
  { href: "/dashboard/admin/moderation", icon: Flag, label: "Moderation" },
  { href: "/dashboard/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/dashboard/admin/cms", icon: FileText, label: "CMS" },
];

export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-56 bg-gray-950 fixed h-full z-10">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Star className="fill-current text-gold-500" size={18} />
            DealerVoice
          </Link>
          <span className="text-xs text-gray-500 mt-0.5 block">Admin Panel</span>
        </div>

        <nav className="p-3 flex-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                  active ? "bg-gold-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-56">{children}</main>
    </div>
  );
}
