"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Inbox,
  LayoutGrid,
  FileText,
  Zap,
  Settings,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INBOX_BASE_PATH } from "@/lib/inbox/constants";

const NAV_ITEMS = [
  { href: `${INBOX_BASE_PATH}/inbox`, icon: Inbox, label: "Inbox" },
  { href: `${INBOX_BASE_PATH}/kanban`, icon: LayoutGrid, label: "Kanban" },
  { href: `${INBOX_BASE_PATH}/templates`, icon: FileText, label: "Templates" },
  { href: `${INBOX_BASE_PATH}/automations`, icon: Zap, label: "Automations" },
  { href: `${INBOX_BASE_PATH}/settings`, icon: Settings, label: "Settings" },
  { href: `${INBOX_BASE_PATH}/onboarding`, icon: Sparkles, label: "Onboarding" },
];

type AccessState = {
  allowed: boolean;
  plan?: string;
  effectivePlan?: string;
} | null;

export function InboxShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>(null);
  const [checking, setChecking] = useState(true);

  const isUpgradePage = pathname === `${INBOX_BASE_PATH}/upgrade`;

  useEffect(() => {
    if (isUpgradePage) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    fetch("/api/inbox/access")
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        const accessData = payload.data?.access ?? payload;
        setAccess(accessData);
        if (!accessData.allowed) {
          router.replace(`${INBOX_BASE_PATH}/upgrade`);
        } else {
          fetch("/api/inbox/seed", { method: "POST" }).catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) router.replace(`${INBOX_BASE_PATH}/upgrade`);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isUpgradePage, router]);

  if (checking && !isUpgradePage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/40">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/40 flex">
      <aside className="hidden lg:flex flex-col w-56 surface-panel border-r border-border/60 fixed h-full z-10">
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <Star className="fill-current" size={18} />
            DealerVoice
          </Link>
          <span className="text-xs text-muted-foreground mt-0.5 block">DealerVoice Inbox</span>
        </div>

        <nav className="p-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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

        {access?.allowed && access.effectivePlan && (
          <div className="p-3 border-t border-border">
            <p className="px-3 text-xs text-muted-foreground">
              Plan: <span className="font-medium text-foreground">{access.effectivePlan.replace(/_/g, " ")}</span>
            </p>
          </div>
        )}
      </aside>

      <div className="flex-1 lg:ml-56 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur px-6 py-4 lg:px-8">
          <h1 className="text-lg font-bold text-foreground">DealerVoice Inbox</h1>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
