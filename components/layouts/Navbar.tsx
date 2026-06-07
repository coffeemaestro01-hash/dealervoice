"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FooterBrand } from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Reviews", href: "/dealers" },
];

const SOLUTION_LINKS = [
  { label: "Toyota Dealers", href: "/solutions/toyota" },
  { label: "Ford Dealers", href: "/solutions/ford" },
  { label: "GM Dealers", href: "/solutions/gm" },
  { label: "Service Departments", href: "/solutions/service" },
  { label: "BDC Teams", href: "/solutions/bdc" },
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
    <header className="sticky top-0 z-50 nav-glass">
      <nav className="container flex items-center justify-between h-[4.25rem]">
        <FooterBrand height={34} />

        <div className="hidden lg:flex items-center gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm text-gray-300 hover:text-gold-400 transition-colors font-medium flex items-center gap-1.5 outline-none tracking-wide">
              Solutions <ChevronDown size={14} className="opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-night-800 border-gold/20">
              {SOLUTION_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="text-gray-300 focus:bg-gold-500/10 focus:text-gold-300">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-300 hover:text-gold-400 transition-colors font-medium tracking-wide">
              {link.label}
            </Link>
          ))}
          <Link href="/#roi-calculator" className="text-sm text-gray-300 hover:text-gold-400 transition-colors font-medium tracking-wide">
            ROI
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 text-gray-200 hover:text-gold-400 hover:bg-white/5 h-10">
                  <Avatar className="w-8 h-8 ring-1 ring-gold/30">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="bg-gold-500/20 text-gold-300 text-xs font-semibold">
                      {getInitials(user.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm">{user.name}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-night-800 border-gold/20">
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="gap-2"><LayoutDashboard size={15} /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/customer/profile" className="gap-2"><User size={15} /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-red-400 gap-2 cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut size={15} /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-gold-400 hover:bg-white/5 h-10 tracking-wide">
                  Sign in
                </Button>
              </Link>
              <Link href="/demo" className="inline-flex h-10 items-center px-6 rounded-full btn-luxury-primary text-night-900 text-sm font-semibold tracking-wide">
                Book Demo
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-200 hover:text-gold-400 hover:bg-white/5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
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
            className="lg:hidden bg-night-900/95 border-t border-gold/15 backdrop-blur-xl"
          >
            <div className="container py-5 flex flex-col gap-1">
              <p className="px-3 pt-1 text-[10px] text-gray-500 uppercase tracking-luxury font-semibold">Solutions</p>
              {SOLUTION_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2.5 text-sm text-gray-300 hover:text-gold-400 rounded-lg" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2.5 text-sm text-gray-300 hover:text-gold-400 rounded-lg" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="px-3 py-2.5 text-sm text-gray-300" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="px-3 py-2.5 text-sm text-red-400 text-left">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-3 py-2.5 text-sm text-gray-300" onClick={() => setMobileOpen(false)}>Sign in</Link>
                    <Link href="/demo" className="mx-3 py-3 text-sm text-center rounded-full btn-luxury-primary text-night-900 font-semibold" onClick={() => setMobileOpen(false)}>
                      Book Demo
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
