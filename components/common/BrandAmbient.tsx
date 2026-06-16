import { cn } from "@/lib/utils";

interface BrandAmbientProps {
  className?: string;
  /** Show circuit grid overlay */
  circuit?: boolean;
  /** Show weave texture overlay */
  weave?: boolean;
  /** Subtle ember glow at top */
  glow?: boolean;
}

/**
 * Ambient brand backdrop: pearl base + optional circuit grid, weave texture, ember glow.
 */
export function BrandAmbient({
  className,
  circuit = true,
  weave = true,
  glow = true,
}: BrandAmbientProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} aria-hidden>
      {glow && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,var(--primary-glow)_0%,transparent_60%)] opacity-[0.12]" />
      )}
      {weave && <div className="absolute inset-0 bg-weave opacity-60" />}
      {circuit && <div className="absolute inset-0 bg-circuit opacity-40" />}
    </div>
  );
}
