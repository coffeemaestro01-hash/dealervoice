"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Search, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
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

const NAV_LINKS = [
  { label: "Find Dealers", href: "/dealers" },
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
      <nav className="container flex items-center justify-between h-16">
        {/* Logo */}
        <FooterBrand height={32} />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-300 hover:text-gold-400 transition-colors font-medium">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dealers">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-200 hover:text-gold-400 hover:bg-white/5">
              <Search size={15} />
              Search
            </Button>
          </Link>

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

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-200 hover:text-gold-400 hover:bg-white/5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-night-800 border-t border-gold/25"
          >
            <div className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
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
