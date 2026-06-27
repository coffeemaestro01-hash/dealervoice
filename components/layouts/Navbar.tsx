"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  PenLine,
  Building2,
} from "lucide-react";
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

const BUYERS_LINKS = [
  { label: "Overview", href: "/buyers" },
  { label: "Find dealers", href: "/dealers" },
  { label: "Explore coverage", href: "/explore" },
  { label: "Write a review", href: "/write-review" },
  { label: "Trust & scores", href: "/trust" },
  { label: "Chicago", href: "/chicago" },
];

const DEALERS_LINKS = [
  { label: "Dealer solutions", href: "/for-dealers" },
  { label: "Claim profile", href: "/claim" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dealer dashboard", href: "/dashboard/dealer" },
];

const COMPANY_LINKS = [
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function NavDropdown({
  label,
  links,
  triggerClassName,
}: {
  label: string;
  links: { label: string; href: string }[];
  triggerClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          }
        >
          {label}
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar({ overHero = false }: { overHero?: boolean }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;

  const dashboardHref =
    user?.role === "SUPER_ADMIN" || user?.role === "MODERATOR"
      ? "/dashboard/admin"
      : user?.role === "DEALER_OWNER" || user?.role === "DEALER_GROUP_ADMIN"
        ? "/dashboard/dealer"
        : "/dashboard/customer";

  const navLinkClass =
    "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-medium";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b",
        overHero
          ? "absolute inset-x-0 bg-transparent border-white/10"
          : "surface-panel border-border/60 shadow-soft"
      )}
    >
      <nav className="container flex items-center justify-between h-16 gap-3" aria-label="Main navigation">
        <Logo variant="full" height={32} priority inverted />

        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          <NavDropdown label="For buyers" links={BUYERS_LINKS} triggerClassName={navLinkClass} />
          <NavDropdown label="For dealers" links={DEALERS_LINKS} triggerClassName={navLinkClass} />
          <NavDropdown label="Company" links={COMPANY_LINKS} triggerClassName={navLinkClass} />
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link href="/dealers">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5",
                overHero
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Search size={15} />
              Search
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 px-2",
                    overHero
                      ? "text-white hover:text-white hover:bg-white/10"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  )}
                >
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
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    overHero
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  }
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold border-0">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "md:hidden",
            overHero
              ? "text-white hover:text-white hover:bg-white/10"
              : "text-foreground hover:text-primary hover:bg-accent"
          )}
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
              <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                For buyers
              </p>
              {BUYERS_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                For dealers
              </p>
              {DEALERS_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-lg",
                    link.href === "/for-dealers"
                      ? "text-primary font-semibold bg-primary/5 border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-primary"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Company
              </p>
              {COMPANY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
                {user ? (
                  <>
                    <Link
                      href={dashboardHref}
                      className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="px-3 py-2.5 text-sm font-medium text-destructive hover:bg-accent rounded-lg text-left"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="px-3 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg text-center"
                      onClick={() => setMobileOpen(false)}
                    >
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
