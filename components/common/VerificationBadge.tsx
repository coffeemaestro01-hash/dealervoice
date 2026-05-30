import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const config = {
  VERIFIED_PURCHASE: { icon: ShieldCheck, label: "Verified Purchase", className: "badge-verified-purchase" },
  VERIFIED_SERVICE: { icon: ShieldCheck, label: "Verified Service", className: "badge-verified-service" },
  PENDING: { icon: ShieldAlert, label: "Pending Verification", className: "verified-badge bg-yellow-100 text-yellow-700" },
  UNVERIFIED: { icon: Shield, label: "Unverified", className: "badge-unverified" },
};

export function VerificationBadge({ status, size = "sm" }: VerificationBadgeProps) {
  const cfg = config[status as keyof typeof config] ?? config.UNVERIFIED;
  const Icon = cfg.icon;
  return (
    <span className={cn(cfg.className, size === "sm" ? "text-xs" : "text-sm")}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}
