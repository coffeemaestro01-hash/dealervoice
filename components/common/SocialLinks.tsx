import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { SOCIAL_LINKS, WHATSAPP_BUSINESS } from "@/lib/constants/social";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "facebook" as const, label: "Facebook", href: SOCIAL_LINKS.facebook, Icon: Facebook },
  { key: "instagram" as const, label: "Instagram", href: SOCIAL_LINKS.instagram, Icon: Instagram },
  { key: "linkedin" as const, label: "LinkedIn", href: SOCIAL_LINKS.linkedin, Icon: Linkedin },
  { key: "whatsapp" as const, label: "WhatsApp", href: WHATSAPP_BUSINESS.href, Icon: MessageCircle },
];

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
  variant?: "footer" | "inline";
}

export function SocialLinks({ className, iconClassName, variant = "footer" }: SocialLinksProps) {
  const base =
    variant === "footer"
      ? "w-9 h-9 grid place-items-center rounded-full border border-primary/30 text-primary hover:bg-primary/10 hover:text-night-900 transition-colors"
      : "w-10 h-10 grid place-items-center rounded-xl border border-border text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/10 transition-colors";

  return (
    <div className={cn("flex gap-2", className)}>
      {ITEMS.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, iconClassName)}
          aria-label={`DealerVoice on ${label}`}
        >
          <Icon size={variant === "footer" ? 16 : 18} aria-hidden />
        </a>
      ))}
    </div>
  );
}
