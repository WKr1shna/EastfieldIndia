"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Flame, HeartHandshake, Leaf, Sparkles, WheatOff } from "lucide-react";
import {
  CULINARY_APPLICATIONS,
  MAKHANA_ATTRIBUTES,
  NUTRITION_ACCURACY_NOTE,
  NUTRITION_HIGHLIGHTS,
  NUTRITIONAL_PROFILE_PILLARS,
} from "@/features/products/nutrition";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

export function WhyMakhanaSection() {
  const [activeApp, setActiveApp] = useState(CULINARY_APPLICATIONS[0]);
  const { openSampleRequest } = useInquiryPreset();

  return (
    <section
      id="why-makhana"
      className="bg-grain-ivory border-b border-ivory-300 py-16 text-ink-900 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Top Product Story & Recurring Brand Motif */}
        <Reveal>
          <div className="flex flex-col justify-between gap-6 border-b border-ivory-300 pb-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] text-gold-400 uppercase">
                  <WheatOff className="h-3.5 w-3.5" aria-hidden="true" />
                  {siteConfig.productPromise}
                </span>
                <span className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
                  {siteConfig.productPromiseSub}
                </span>
              </div>

              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]">
                Why Makhana?
              </h2>
              <p className="mt-3 text-lg font-medium text-forest-800 sm:text-xl">
                A traditional Indian superfood. A naturally satisfying crunch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openSampleRequest()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-xs font-semibold tracking-[0.14em] text-gold-400 uppercase transition-colors hover:bg-forest-800"
            >
              <span>Request a Sample</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        {/* Visual Product Showcase: Close-up Crunch + Core Attributes */}
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <figure className="relative overflow-hidden rounded-2xl border border-ivory-300 bg-forest-900 shadow-lg">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/makhana/makhana-closeup-crunch.jpg"
                    alt="Macro close-up of whole and halved Bihar makhana showing crisp aerated white interior and natural seed-coat flecks"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-transparent"
                  />
                </div>
                <figcaption className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-forest-950/85 px-4 py-3 text-ivory-100 backdrop-blur-sm">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.16em] text-gold-400 uppercase">
                      {siteConfig.productPromise}
                    </p>
                    <p className="mt-0.5 text-xs text-ivory-200/90">
                      Popped Euryale ferox kernel · Light honeycomb expansion &amp; natural crunch
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delayMs={100}>
              <p className="text-xs font-semibold tracking-[0.16em] text-gold-600 uppercase">
                What Makes Makhana Distinct
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-700">
                Harvested from Bihar&apos;s freshwater wetlands and popped through traditional
                heat-roasting, makhana (fox nuts / popped lotus seeds) delivers a clean, crisp bite
                without heavy processing—making it equally prized by conscious snackers and global
                food brands.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {MAKHANA_ATTRIBUTES.map((attr) => (
                  <div
                    key={attr.label}
                    className="rounded-xl border border-ivory-300 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-forest-900 uppercase">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                      <span>{attr.label}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{attr.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Nutritional & Wellness Characteristics */}
        <Reveal delayMs={120}>
          <div className="mt-16">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                  Nutritional Characteristics
                </p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-forest-900 sm:text-3xl">
                  Naturally nutrient-dense in its plain form.
                </h3>
              </div>
              <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                India&apos;s traditional crunch, reimagined
              </p>
            </div>

            {/* Nutritional Profile Bar */}
            <div className="mt-6 grid gap-3 rounded-2xl border border-forest-800/15 bg-forest-900 p-5 text-ivory-100 sm:grid-cols-2 lg:grid-cols-5">
              {NUTRITIONAL_PROFILE_PILLARS.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-white/10 bg-forest-800/60 px-4 py-3.5"
                >
                  <p className="text-xs font-bold tracking-wider text-gold-400 uppercase">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-ivory-200/85">{item.note}</p>
                </div>
              ))}
            </div>

            {/* 5 Nutrition & Wellness Cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {NUTRITION_HIGHLIGHTS.map((card, idx) => {
                const Icon =
                  idx === 0
                    ? HeartHandshake
                    : idx === 1
                    ? Leaf
                    : idx === 2
                    ? Sparkles
                    : Flame;
                return (
                  <article
                    key={card.id}
                    className="flex flex-col justify-between rounded-2xl border border-ivory-300 bg-white p-6 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold tracking-[0.14em] text-gold-600 uppercase">
                          {card.eyebrow}
                        </span>
                        <Icon className="h-4 w-4 text-forest-700" aria-hidden="true" />
                      </div>
                      <h4 className="mt-3 text-sm font-bold tracking-wide text-forest-900 uppercase">
                        {card.title}
                      </h4>
                      <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
                        {card.description}
                      </p>
                    </div>

                    {card.nutrients && (
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ivory-200 pt-3">
                        {card.nutrients.map((mineral) => (
                          <span
                            key={mineral}
                            className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[11px] font-semibold text-forest-900"
                          >
                            {mineral}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}

              {/* Interactive Culinary & Application Explorer Card */}
              <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-forest-800/15 bg-forest-900 text-ivory-100 shadow-md md:col-span-2 lg:col-span-1">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src="/images/makhana/makhana-culinary-versatility.jpg"
                    alt="Plain and lightly toasted spiced makhana bowls with whole spices showing culinary versatility"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/35 to-transparent"
                  />
                  <span className="absolute left-4 top-3 rounded-full border border-gold-500/40 bg-forest-950/85 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-gold-400 uppercase">
                    Versatile Applications
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {CULINARY_APPLICATIONS.map((app) => {
                      const active = activeApp.id === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setActiveApp(app)}
                          aria-pressed={active}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                            active
                              ? "bg-gold-500 text-forest-950"
                              : "bg-forest-800 text-ivory-200 hover:bg-forest-700"
                          }`}
                        >
                          {app.title.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-ivory-50">{activeApp.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory-200/85">
                    {activeApp.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activeApp.formats.map((f) => (
                      <span
                        key={f}
                        className="rounded-md border border-white/15 bg-forest-800/70 px-2 py-0.5 text-[10px] text-ivory-200"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>

            <p className="mt-5 rounded-xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-xs leading-relaxed text-ink-600">
              {NUTRITION_ACCURACY_NOTE}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
