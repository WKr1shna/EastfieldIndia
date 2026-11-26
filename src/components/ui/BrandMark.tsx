import React from "react";
import { siteConfig } from "@/config/site";

interface BrandMarkProps {
  variant?: "dark" | "light";
  subtitle?: string;
}

export function BrandMark({ variant = "dark", subtitle = siteConfig.subtitle }: BrandMarkProps) {
  const isDarkSurface = variant === "dark";

  return (
    <span className="inline-flex items-center gap-3 select-none">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold tracking-wider transition-colors ${
          isDarkSurface
            ? "border-gold-500/45 bg-forest-800/90 text-gold-400"
            : "border-forest-800/20 bg-forest-900 text-gold-400"
        }`}
      >
        {siteConfig.shortMark}
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={`text-sm font-semibold tracking-[0.14em] uppercase ${
            isDarkSurface ? "text-ivory-100" : "text-forest-900"
          }`}
        >
          {siteConfig.name}
        </span>
        <span
          className={`text-[10px] font-medium tracking-[0.16em] uppercase ${
            isDarkSurface ? "text-ivory-300/80" : "text-ink-600"
          }`}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
