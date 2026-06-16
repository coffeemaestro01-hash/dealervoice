import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "full" = horizontal lockup (mic + wordmark), "mark" = icon only */
  variant?: "full" | "mark";
  /** height in px (width auto-scales) */
  height?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

/**
 * DealerVoice brand logo (official kit: gold mic/key-fob + navy wordmark).
 * The full lockup has a navy wordmark, so use it on light backgrounds.
 * On dark backgrounds use the FooterBrand component (icon + white text).
 */
export function Logo({
  variant = "full",
  height = 38,
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const isFull = variant === "full";
  const src = isFull ? "/logo/dealervoice-horizontal.png" : "/logo/dealervoice-icon.png";
  const ratio = isFull ? 1600 / 410 : 1;
  const width = Math.round(height * ratio);

  const img = (
    <Image
      src={src}
      alt="DealerVoice"
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none object-contain", className)}
    />
  );

  if (href === null) return img;

  return (
    <Link href={href} className="inline-flex items-center" aria-label="DealerVoice home">
      {img}
    </Link>
  );
}

/** Brand lockup for dark backgrounds: gold icon + white wordmark text. */
export function FooterBrand({ height = 34 }: { height?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="DealerVoice home">
      <Image src="/logo/dealervoice-icon.png" alt="DealerVoice" width={height} height={height} className="object-contain" />
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        DealerVoice<span className="text-primary">.io</span>
      </span>
    </Link>
  );
}
