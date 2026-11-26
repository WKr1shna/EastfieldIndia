"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, MapPin, WheatOff } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";

export function HeroSection() {
  const { openSampleRequest } = useInquiryPreset();

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-white/10 bg-forest-900 text-ivory-100"
    >
      {/* Authentic Bihar wetland & woven basket of makhana background, bounded to native aspect & resolution to prevent stretching or blur */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="relative h-[340px] w-full max-w-[1440px] shrink-0 overflow-hidden sm:h-[460px] lg:h-full lg:max-h-[768px]">
          <Image
            src="/images/hero/makhana-pond-hero-v2.jpg"
            alt="Woven bamboo basket of Bihar-origin makhana beside a sunlit lotus pond at dawn"
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover object-[76%_58%] lg:object-[68%_center]"
          />
          {/* Left-to-right deep forest green scrim keeps typography crisp while showcasing the makhana basket */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-900/60 to-forest-900 lg:bg-gradient-to-r lg:from-forest-950/95 lg:via-forest-900/72 lg:to-forest-950/15" />
          {/* Side edge feathering into Stage 1 forest canvas (#0B3027) on wide monitors */}
          <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:left-0 lg:w-24 lg:bg-gradient-to-r lg:from-forest-900 lg:to-transparent" />
          <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-28 lg:bg-gradient-to-l lg:from-forest-900 lg:to-transparent" />
          {/* Bottom blend into Stage 1 scroll colour canvas (#0B3027) */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-forest-900 via-forest-900/65 to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:min-h-[640px] lg:grid-cols-12 lg:items-center lg:px-10 lg:py-28">
        {/* Left: Editorial B2B Copy */}
        <div className="lg:col-span-7">
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/45 bg-forest-950/75 px-3.5 py-1 text-xs font-medium tracking-wider text-gold-400 uppercase backdrop-blur-xs">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {siteConfig.heroLocation}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-forest-950/65 px-3.5 py-1 text-xs font-bold tracking-[0.14em] text-ivory-50 uppercase backdrop-blur-xs">
              <WheatOff className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              {siteConfig.productPromise}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-ivory-50 drop-shadow-xs sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]">
            Bihar-Origin Makhana.
            <span className="mt-2 block font-sans text-4xl font-extrabold tracking-tight text-ivory-50 uppercase sm:text-5xl lg:text-[3.6rem] lg:leading-[1.04]">
              Built for{" "}
              <span className="text-gold-400 underline decoration-gold-500/55 decoration-2 underline-offset-8">
                B2B Supply.
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory-100/95 sm:text-lg">
            EastField India connects Bihar&apos;s makhana sourcing and processing ecosystem with
            professional buyers through structured sourcing, aggregation, quality alignment and
            supply.
          </p>

          <p className="mt-3 text-sm font-medium tracking-wide text-gold-400">
            {siteConfig.productPromiseSub} · Connecting Bihar&apos;s makhana ecosystem to domestic
            &amp; global food businesses.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openSampleRequest()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold tracking-wide text-forest-950 uppercase shadow-lg transition-all hover:bg-gold-400"
            >
              <span>Request a Sample</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <a
              href="#makhana"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory-200/40 bg-forest-950/55 px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory-100 backdrop-blur-xs transition-all hover:border-gold-400/70 hover:bg-forest-900/80"
            >
              <span>Explore Our Supply</span>
            </a>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
            <div>
              <dt className="text-[11px] font-medium tracking-widest text-ivory-200/80 uppercase">
                Origin Belt
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ivory-50">Purnea &amp; Katihar</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-widest text-ivory-200/80 uppercase">
                Product Nature
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ivory-50">Guilt-Free · Gluten-Free</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-widest text-ivory-200/80 uppercase">
                Supply Formats
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ivory-50">Bulk &amp; Custom</dd>
            </div>
          </dl>
        </div>

        {/* Right: Subtle origin caption badge resting over open background composition */}
        <div className="hidden lg:col-span-5 lg:flex lg:items-end lg:justify-end lg:self-end">
          <div className="rounded-xl border border-white/15 bg-forest-950/80 px-4 py-3 text-right backdrop-blur-sm">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-400 uppercase">
              From Source to Scale
            </p>
            <p className="mt-0.5 text-xs text-ivory-100/95">
              Bihar-origin Euryale ferox · 4 Suta – 6+ Suta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
