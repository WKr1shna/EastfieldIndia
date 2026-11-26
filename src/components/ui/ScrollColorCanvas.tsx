"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { interpolateBrandBackground, isLightScrollZone } from "@/utils/colorJourney";

interface ScrollThemeState {
  isLightHeader: boolean;
  progress: number;
}

const ScrollThemeContext = createContext<ScrollThemeState>({
  isLightHeader: false,
  progress: 0,
});

export function useScrollTheme() {
  return useContext(ScrollThemeContext);
}

export function ScrollColorCanvas({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLightHeader, setIsLightHeader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      const raf = window.requestAnimationFrame(() => setReducedMotion(true));
      return () => window.cancelAnimationFrame(raf);
    }

    let rafId = 0;
    let scheduled = false;

    const applyScrollColor = () => {
      scheduled = false;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const nextProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      const bgHex = interpolateBrandBackground(nextProgress);

      container.style.setProperty("--page-scroll-bg", bgHex);
      container.style.setProperty("--page-scroll-progress", `${(nextProgress * 100).toFixed(2)}%`);

      setProgress(nextProgress);
      setIsLightHeader(isLightScrollZone(nextProgress));
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = window.requestAnimationFrame(applyScrollColor);
    };

    rafId = window.requestAnimationFrame(applyScrollColor);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <ScrollThemeContext.Provider value={{ isLightHeader, progress }}>
      <div
        ref={containerRef}
        style={
          reducedMotion
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #0B3027 0%, #17483B 24%, #3B6C5B 42%, #D2DDD1 55%, #EFEAE0 74%, #FAF7EE 100%)",
              }
            : {
                backgroundColor: "var(--page-scroll-bg, #0B3027)",
                transition: "background-color 140ms linear",
              }
        }
        className="relative min-h-screen"
      >
        {children}
      </div>
    </ScrollThemeContext.Provider>
  );
}
