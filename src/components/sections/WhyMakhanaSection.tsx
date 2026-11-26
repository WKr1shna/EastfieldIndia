"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  Dna,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  WheatOff,
} from "lucide-react";
import {
  CULINARY_APPLICATIONS,
  NUTRITION_ACCURACY_NOTE,
  NUTRITIONAL_HIGHLIGHTS,
  NUTRITIONAL_PROFILE_PILLARS,
  POSTER_BANNER_BENEFIT,
  POSTER_LEFT_BENEFITS,
  POSTER_RIGHT_BENEFITS,
  type PosterBenefit,
} from "@/features/products/nutrition";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

const HIGHLIGHT_ICONS = [Dna, Sparkles, ShieldCheck, Layers, Scale] as const;

export function WhyMakhanaSection() {
  const [selectedBenefit, setSelectedBenefit] = useState<PosterBenefit>(POSTER_BANNER_BENEFIT);
  const { openSampleRequest } = useInquiryPreset();

  return (
    <section
      id="why-makhana"
      className="border-b border-forest-900/10 py-16 text-ink-900 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Poster Container: Warm Cream with Muted Gold Framing */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/45 bg-ivory-50/96 p-6 shadow-xl sm:p-10 lg:p-14">
            {/* Subtle corner gold hairlines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-2xl border border-gold-500/20"
            />

            <div className="relative">
              {/* Top Poster Header + Integrated Makhana Visuals */}
              <div className="grid items-center gap-8 border-b border-gold-500/35 pb-8 lg:grid-cols-12">
                <div className="text-center lg:col-span-7 lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/50 bg-ivory-200 px-4 py-1.5 text-xs font-extrabold tracking-[0.18em] text-forest-900 uppercase">
                    <WheatOff className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
                    <span>{siteConfig.productPromise}</span>
                  </div>

                  <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-forest-900 uppercase sm:text-5xl lg:text-6xl">
                    WHY MAKHANA?
                  </h2>
                  <p className="mt-2.5 text-sm font-semibold tracking-[0.14em] text-gold-600 uppercase sm:text-base">
                    A traditional Indian superfood · Crunchy by nature
                  </p>
                </div>

                {/* Integrated Dual Makhana Photography */}
                <div className="grid grid-cols-2 gap-3 lg:col-span-5">
                  <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold-500/35 bg-forest-900">
                    <Image
                      src="/images/makhana/makhana-closeup-crunch.jpg"
                      alt="Close-up of crisp cream-white Bihar makhana puffs showing natural texture"
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 45vw, 20vw"
                      className="object-cover"
                    />
                  </figure>
                  <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold-500/35 bg-forest-900">
                    <Image
                      src="/images/makhana/makhana-culinary-versatility.jpg"
                      alt="Stoneware bowl of authentic popped Bihar makhana in natural morning light"
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 45vw, 20vw"
                      className="object-cover"
                    />
                  </figure>
                </div>
              </div>

              {/* Poster Hero Statement Row */}
              <div className="border-b border-gold-500/35 py-6 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedBenefit(POSTER_BANNER_BENEFIT)}
                  aria-pressed={selectedBenefit.id === POSTER_BANNER_BENEFIT.id}
                  className={`inline-flex flex-col items-center rounded-xl px-6 py-2 transition-colors ${
                    selectedBenefit.id === POSTER_BANNER_BENEFIT.id
                      ? "bg-ivory-200/80"
                      : "hover:bg-ivory-200/50"
                  }`}
                >
                  <span className="text-xl font-extrabold tracking-[0.12em] text-forest-900 uppercase sm:text-3xl">
                    {POSTER_BANNER_BENEFIT.statement}
                  </span>
                </button>
              </div>

              {/* Poster Two-Column Uppercase Grid with Vertical Divider */}
              <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-gold-500/45">
                {/* Left Column */}
                <div className="divide-y divide-gold-500/25 md:pr-8">
                  {POSTER_LEFT_BENEFITS.map((item) => {
                    const active = selectedBenefit.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedBenefit(item)}
                        aria-pressed={active}
                        className={`flex w-full items-center justify-between gap-4 py-5 text-left transition-colors sm:py-6 ${
                          active ? "text-forest-900" : "text-forest-900/90 hover:text-gold-600"
                        }`}
                      >
                        <span className="text-base font-extrabold tracking-[0.08em] uppercase sm:text-xl">
                          {item.statement}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
                            active ? "bg-gold-500" : "bg-gold-500/30"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="divide-y divide-gold-500/25 border-t border-gold-500/25 md:border-t-0 md:pl-8">
                  {POSTER_RIGHT_BENEFITS.map((item) => {
                    const active = selectedBenefit.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedBenefit(item)}
                        aria-pressed={active}
                        className={`flex w-full items-center justify-between gap-4 py-5 text-left transition-colors sm:py-6 ${
                          active ? "text-forest-900" : "text-forest-900/90 hover:text-gold-600"
                        }`}
                      >
                        <span className="text-base font-extrabold tracking-[0.08em] uppercase sm:text-xl">
                          {item.statement}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
                            active ? "bg-gold-500" : "bg-gold-500/30"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact Interactive Context Strip for Selected Poster Statement */}
              <div className="mt-2 flex flex-col justify-between gap-4 rounded-2xl border border-gold-500/35 bg-forest-900 px-6 py-5 text-ivory-100 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] text-gold-400 uppercase">
                    {selectedBenefit.statement}
                  </p>
                  <p className="mt-1 text-sm text-ivory-100/90">{selectedBenefit.contextLine}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openSampleRequest()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-xs font-bold tracking-[0.14em] text-forest-950 uppercase transition-colors hover:bg-gold-400"
                >
                  <span>Request a Sample</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Editorial Nutritional Highlights Showcase (Amino Acids, Histidine, Immunity, EAAI, Low GI) */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-gold-500/35 bg-forest-900 p-6 text-ivory-100 shadow-lg sm:p-9">
                <div className="flex flex-col justify-between gap-4 border-b border-white/12 pb-6 lg:flex-row lg:items-end">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-gold-400 uppercase">
                      <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Nutritional Highlights · Euryale Ferox Seed Kernel</span>
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-medium text-ivory-50 sm:text-3xl">
                      Amino Acid Composition &amp; Balanced Nutrition.
                    </h3>
                  </div>
                  <span className="inline-block self-start rounded-full border border-gold-500/40 bg-forest-800 px-3.5 py-1 text-[10px] font-bold tracking-[0.16em] text-gold-400 uppercase lg:self-auto">
                    {siteConfig.productPromise}
                  </span>
                </div>

                {/* 2-Column Editorial Grid with Thin Hairline Separators */}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2">
                  {NUTRITIONAL_HIGHLIGHTS.map((item, idx) => {
                    const Icon = HIGHLIGHT_ICONS[idx] ?? Dna;
                    const isLeftCol = idx % 2 === 0;
                    return (
                      <article
                        key={item.id}
                        className={`flex flex-col justify-between border-b border-white/12 py-6 ${
                          isLeftCol ? "md:border-r md:pr-8" : "md:pl-8"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] text-gold-400 uppercase">
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{item.badge}</span>
                            </span>
                            <span className="font-mono text-xs text-ivory-300/60">
                              {item.number}
                            </span>
                          </div>

                          <h4 className="mt-3 text-base font-extrabold tracking-[0.06em] text-ivory-50 uppercase sm:text-lg">
                            {item.heading}
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed text-ivory-200/85">
                            {item.description}
                          </p>
                        </div>
                      </article>
                    );
                  })}

                  {/* 6th Balanced Visual Cell Pairing with Authentic Close-up Photography */}
                  <div className="flex flex-col justify-between border-b border-white/12 py-6 md:pl-8">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-gold-500/35 bg-forest-950">
                        <Image
                          src="/images/makhana/makhana-closeup-crunch.jpg"
                          alt="Popped Bihar makhana kernel close-up texture"
                          fill
                          loading="lazy"
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.15em] text-gold-400 uppercase">
                          Whole Seed Integrity
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-ivory-200/90">
                          Popped directly from Bihar-grown aquatic lotus seeds without frying,
                          preserving its natural airy crunch and mineral profile.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Nutritional Profile & Versatility Footer inside Poster */}
              <div className="mt-7 grid gap-4 border-t border-gold-500/25 pt-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-gold-600 uppercase">
                    Plain Makhana Nutritional Profile
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {NUTRITIONAL_PROFILE_PILLARS.map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-ivory-300 bg-white px-3 py-1 text-xs font-semibold text-forest-900"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-gold-600 uppercase">
                    Commercial &amp; Culinary Versatility
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {CULINARY_APPLICATIONS.map((app) => (
                      <span
                        key={app.id}
                        title={app.summary}
                        className="rounded-full border border-forest-800/20 bg-ivory-200 px-3 py-1 text-xs font-semibold text-forest-900"
                      >
                        {app.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-5 border-t border-gold-500/20 pt-4 text-xs leading-relaxed text-ink-600">
                {NUTRITION_ACCURACY_NOTE}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
