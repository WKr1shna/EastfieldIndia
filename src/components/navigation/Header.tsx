"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BrandMark } from "@/components/ui/BrandMark";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { useScrollTheme } from "@/components/ui/ScrollColorCanvas";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openSampleRequest } = useInquiryPreset();
  const { isLightHeader } = useScrollTheme();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const lightNav = isLightHeader;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-500 ${
        lightNav
          ? "border-b border-forest-900/12 bg-ivory-50/92 text-forest-900 shadow-xs backdrop-blur-md"
          : scrolled
          ? "border-b border-white/10 bg-forest-900/92 text-ivory-100 shadow-sm backdrop-blur-md"
          : "border-b border-white/10 bg-forest-900/95 text-ivory-100"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
        <a href="#home" aria-label="EastField India Home" className="shrink-0">
          <BrandMark variant={lightNav ? "light" : "dark"} />
        </a>

        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
          {siteConfig.navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                lightNav
                  ? "text-forest-900/85 hover:text-gold-600"
                  : "text-ivory-200/90 hover:text-gold-400"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => openSampleRequest()}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all ${
              lightNav
                ? "bg-forest-900 text-gold-400 hover:bg-forest-800"
                : "bg-gold-500 text-forest-950 hover:bg-gold-400"
            }`}
          >
            <span>Request a Sample</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors lg:hidden ${
            lightNav
              ? "border-forest-900/20 text-forest-900 hover:bg-ivory-200"
              : "border-white/15 text-ivory-100 hover:bg-forest-800"
          }`}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Subtle Scroll Journey Progress Hairline */}
      <div aria-hidden="true" className="h-[2px] w-full bg-transparent">
        <div
          className="h-full bg-gold-500/80 transition-[width] duration-150 ease-out"
          style={{ width: "var(--page-scroll-progress, 0%)" }}
        />
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          className={`border-t px-5 pb-6 pt-4 lg:hidden ${
            lightNav
              ? "border-forest-900/12 bg-ivory-50 text-forest-900"
              : "border-white/10 bg-forest-900 text-ivory-100"
          }`}
        >
          <div
            className={`mb-3 rounded-lg border px-3 py-2 text-center text-[11px] font-bold tracking-[0.16em] uppercase ${
              lightNav
                ? "border-forest-900/15 bg-ivory-200 text-forest-900"
                : "border-gold-500/30 bg-forest-800/70 text-gold-400"
            }`}
          >
            {siteConfig.productPromise}
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {siteConfig.navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                  lightNav
                    ? "text-forest-900 hover:bg-ivory-200"
                    : "text-ivory-100 hover:bg-forest-800 hover:text-gold-400"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div
            className={`mt-4 border-t pt-4 ${
              lightNav ? "border-forest-900/10" : "border-white/10"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openSampleRequest();
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors ${
                lightNav
                  ? "bg-forest-900 text-gold-400 hover:bg-forest-800"
                  : "bg-gold-500 text-forest-950 hover:bg-gold-400"
              }`}
            >
              <span>Request a Sample</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
