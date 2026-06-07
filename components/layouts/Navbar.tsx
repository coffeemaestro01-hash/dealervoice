"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Search, ChevronDown, LayoutDashboard, LogOut, User, PenLine, Building2 } from "lucide-react";
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
import { cn, getInitials } from "@/lib/utils";

const SECONDARY_LINKS = [
  { label: "How It Works", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
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
    <header className="sticky top-0 z-50 bg-night-800/90 backdrop-blur-md border-b border-gold/25 shadow-lg">
      <nav className="container flex items-center justify-between h-16 gap-3" aria-label="Main navigation">
        <FooterBrand height={32} />

        {/* Two-door desktop nav */}
        <div className="hidden lg:flex items-center gap-5 flex-1 justify-center">
          <div className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-1 py-1">
            <span className="sr-only">Consumer</span>
            <Link
              href="/dealers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 hover:text-gold-400 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <Search size={14} aria-hidden />
              Search Dealers
            </Link>
            <Link
              href="/dealers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 hover:text-gold-400 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <PenLine size={14} aria-hidden />
              Write a Review
            </Link>
          </div>

          <Link
            href="/claim"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-300 px-3 py-1.5 rounded-lg border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors"
          >
            <Building2 size={14} aria-hidden />
            For Dealerships: Claim Your Profile
          </Link>

          {SECONDARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-gold-400 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Tablet: condensed consumer links */}
        <div className="hidden md:flex lg:hidden items-center gap-3">
          <Link href="/dealers" className="text-sm text-gray-300 hover:text-gold-400 font-medium">
            Search
          </Link>
          <Link href="/claim" className="text-sm text-gold-400 hover:text-gold-300 font-semibold">
            Claim Profile
          </Link>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 text-gray-200 hover:text-gold-400 hover:bg-white/5">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="bg-gold-100 text-gold-700 text-xs font-semibold">
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
                  className="text-red-600 gap-2 cursor-pointer"
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
                <Button variant="ghost" size="sm" className="text-gray-200 hover:text-gold-400 hover:bg-white/5">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gold-gradient text-night-900 font-semibold hover:opacity-90 border-0">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-200 hover:text-gold-400 hover:bg-white/5"
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
            className="md:hidden bg-night-800 border-t border-gold/25"
          >
            <div className="container py-4 flex flex-col gap-1">
              <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Car Buyers</p>
              <Link
                href="/dealers"
                className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-gold-400 rounded-lg flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Search size={15} aria-hidden />
                Search Dealers
              </Link>
              <Link
                href="/dealers"
                className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-gold-400 rounded-lg flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <PenLine size={15} aria-hidden />
                Write a Review
              </Link>

              <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Dealerships</p>
              <Link
                href="/claim"
                className={cn(
                  "px-3 py-2.5 text-sm font-semibold text-gold-400 hover:bg-gold/10 rounded-lg flex items-center gap-2",
                  "border border-gold/20"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Building2 size={15} aria-hidden />
                Claim Your Profile
              </Link>

              {SECONDARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-gold-400 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gold/20 mt-2 pt-2 flex flex-col gap-1">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-gold-400 rounded-lg" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-gold-400 rounded-lg" onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>
                    <Link href="/register" className="px-3 py-2.5 text-sm font-medium text-night-900 bg-gold-gradient rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                      Get started
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
