"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Search, ChevronDown, LayoutDashboard, LogOut, User, PenLine, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

const SECONDARY_LINKS = [
  { label: "Vehicles", href: "/vehicles" },
  { label: "How It Works", href: "/about" },
  { label: "Trust", href: "/trust" },
  { label: "Blog", href: "/blog" },
  { label: "Research", href: "/research" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;

  const dashboardHref =
    user?.role === "SUPER_ADMIN" || user?.role === "MODERATOR"
      ? "/dashboard/admin"
      : user?.role === "DEALER_OWNER" || user?.role === "DEALER_GROUP_ADMIN"
      ? "/dashboard/dealer"
      : "/dashboard/customer";

  return (
    <header className="sticky top-0 z-50 bg-pearl backdrop-blur-md border-b border-border shadow-soft">
      <nav className="container flex items-center justify-between h-16 gap-3" aria-label="Main navigation">
        <Logo variant="full" height={32} priority />

        <div className="hidden lg:flex items-center gap-5 flex-1 justify-center">
          <div className="flex items-center gap-1 rounded-full bg-muted border border-border px-1 py-1">
            <Link
              href="/dealers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
            >
              <Search size={14} aria-hidden />
              Search Dealers
            </Link>
            <Link
              href="/write-review"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
            >
              <PenLine size={14} aria-hidden />
              Write a Review
            </Link>
          </div>

          <Link
            href="/claim"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Building2 size={14} aria-hidden />
            For Dealerships: Claim Your Profile
          </Link>

          {SECONDARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex lg:hidden items-center gap-3">
          <Link href="/dealers" className="text-sm text-muted-foreground hover:text-primary font-medium">
            Search
          </Link>
          <Link href="/write-review" className="text-sm text-muted-foreground hover:text-primary font-medium">
            Review
          </Link>
          <Link href="/claim" className="text-sm text-primary hover:text-primary/80 font-semibold">
            Claim
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 text-foreground hover:text-primary hover:bg-accent">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(user.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm">{user.name}</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="gap-2">
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/customer/profile" className="gap-2">
                    <User size={15} />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive gap-2 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut size={15} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary hover:bg-accent">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold border-0">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:text-primary hover:bg-accent"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <div className="container py-4 flex flex-col gap-1">
              <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Car Buyers</p>
              <Link href="/dealers" className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Search size={15} aria-hidden />
                Search Dealers
              </Link>
              <Link href="/write-review" className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <PenLine size={15} aria-hidden />
                Write a Review
              </Link>

              <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dealerships</p>
              <Link href="/claim" className={cn("px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg flex items-center gap-2", "border border-primary/20")} onClick={() => setMobileOpen(false)}>
                <Building2 size={15} aria-hidden />
                Claim Your Profile
              </Link>
              <Link href="/pricing" className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg" onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>

              {SECONDARY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="px-3 py-2.5 text-sm font-medium text-destructive hover:bg-accent rounded-lg text-left">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg" onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>
                    <Link href="/register" className="px-3 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
