import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center", light }: Props) {
  const centered = align === "center";
  return (
    <div className={`mb-14 md:mb-16 max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-5 ${centered ? "justify-center" : ""}`}>
          <span className="luxury-line w-8" />
          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? "text-gold-400" : "text-gold-600"}`}>
            {eyebrow}
          </span>
          <span className="luxury-line w-8" />
        </div>
      )}
      <h2 className={`font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold leading-[1.15] tracking-tight ${light ? "text-white" : "text-white"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg leading-relaxed ${light ? "text-gray-400" : "text-gray-400"} ${centered ? "mx-auto" : ""} max-w-2xl`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
