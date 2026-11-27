import React from "react";
import Image from "next/image";
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
        className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border shadow-xs transition-colors ${
          isDarkSurface
            ? "border-gold-500/45 bg-forest-900"
            : "border-forest-800/20 bg-ivory-100"
        }`}
      >
        <Image
          src="/images/brand/eastfield-logo.png"
          alt="EastField India Lotus Brand Emblem"
          width={40}
          height={40}
          priority
          className="h-full w-full object-cover"
        />
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
