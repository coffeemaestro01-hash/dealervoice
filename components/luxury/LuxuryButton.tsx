import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  icon?: React.ReactNode;
}

export function LuxuryButton({ href, children, variant = "primary", className, icon }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-full text-sm font-semibold tracking-wide transition-all duration-300",
        variant === "primary" && "btn-luxury-primary text-night-900",
        variant === "outline" && "btn-luxury-outline text-gold-300",
        variant === "ghost" && "btn-luxury-ghost text-gray-200",
        className
      )}
    >
      {children}
      {icon}
    </Link>
  );
}
