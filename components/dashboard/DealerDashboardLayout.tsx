"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, MessageSquare, Settings, Users, Star, TrendingUp, CreditCard, LayoutDashboard, Mail, Car, LifeBuoy, Bot, Gift, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/dealer", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/dealer/inbox", icon: Inbox, label: "Customer Inbox" },
  { href: "/dashboard/dealer/inventory", icon: Car, label: "Inventory" },
  { href: "/dashboard/dealer/leads", icon: Mail, label: "Leads" },
  { href: "/dashboard/dealer/assistant", icon: Bot, label: "AI Assistant" },
  { href: "/dashboard/dealer/reviews", icon: MessageSquare, label: "Reviews" },
  { href: "/dashboard/dealer/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/dealer/competitors", icon: TrendingUp, label: "Competitors" },
  { href: "/dashboard/dealer/team", icon: Users, label: "Team" },
  { href: "/dashboard/dealer/support", icon: LifeBuoy, label: "Support" },
  { href: "/dashboard/dealer/promotions", icon: Gift, label: "Promotions" },
  { href: "/dashboard/dealer/settings", icon: Settings, label: "Settings" },
];

export function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background/40 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 surface-panel border-r border-border/60 fixed h-full z-10">
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <Star className="fill-current" size={18} />
            DealerVoice
          </Link>
          <span className="text-xs text-muted-foreground mt-0.5 block">Dealer Dashboard</span>
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
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Link href="/dashboard/dealer/billing" className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors",
            pathname.startsWith("/dashboard/dealer/billing")
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted"
          )}>
            <CreditCard size={16} />
            Billing & Plans
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
