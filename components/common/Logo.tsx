import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "full" shows icon + wordmark, "mark" shows just the icon */
  variant?: "full" | "mark";
  /** height in px (width auto-scales) */
  height?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

/**
 * DealerVoice brand logo — gold-on-black.
 * Uses the generated SVG assets in /public/logo/svg.
 */
export function Logo({
  variant = "full",
  height = 36,
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const isFull = variant === "full";
  const src = isFull ? "/logo/svg/logo-full.svg" : "/logo/svg/logo-mark.svg";
  const ratio = isFull ? 900 / 240 : 1;
  const width = Math.round(height * ratio);

  const img = (
    <Image
      src={src}
      alt="DealerVoice"
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none", className)}
    />
  );

  if (href === null) return img;

  return (
    <Link href={href} className="inline-flex items-center" aria-label="DealerVoice home">
      {img}
    </Link>
  );
}
