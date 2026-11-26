"use client";

import React from "react";
import { ArrowRight, Globe2, PackageCheck, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { BUYER_SEGMENTS } from "@/features/sourcing/ecosystems";
import { siteConfig } from "@/config/site";
import { useInquiryPreset, type BuyerTypeOption } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

const BUYER_ICONS = [Globe2, PackageCheck, ShoppingBag, UtensilsCrossed] as const;

export function B2BBuyersSection() {
  const { openSampleRequest, requestWithBuyerType } = useInquiryPreset();

  return (
    <section id="buyers" className="bg-grain-ivory border-b border-ivory-300 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                  Built for B2B Buyers
                </p>
                <span className="rounded-full border border-forest-800/20 bg-white px-3 py-0.5 text-[10px] font-bold tracking-[0.14em] text-forest-900 uppercase">
                  {siteConfig.productPromise}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                One sourcing interface.
                <br />
                Multiple routes to market.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                EastField is structured around the needs of businesses that buy, distribute,
                process or build products with makhana.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openSampleRequest()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold tracking-wide text-gold-400 uppercase transition-colors hover:bg-forest-800"
              >
                <span>Request a Sample</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href="#inquiry"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-forest-800/25 bg-white px-5 py-3.5 text-sm font-semibold tracking-wide text-forest-900 transition-colors hover:border-forest-800"
              >
                <span>Tell Us What You Need</span>
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {BUYER_SEGMENTS.map((segment, idx) => {
            const Icon = BUYER_ICONS[idx] ?? Globe2;
            return (
              <Reveal key={segment.number} delayMs={idx * 70}>
                <article className="group flex h-full flex-col justify-between rounded-2xl border border-ivory-300 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-forest-700/35 hover:shadow-lg sm:p-8">
                  <div>
                    <div className="flex items-center justify-between border-b border-ivory-200 pb-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ivory-200 font-mono text-sm font-bold text-forest-900">
                          {segment.number}
                        </span>
                        <span className="text-[11px] font-semibold tracking-[0.15em] text-gold-600 uppercase">
                          {segment.tag}
                        </span>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900/5 text-forest-800 transition-colors group-hover:bg-forest-900 group-hover:text-gold-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-bold tracking-wide text-forest-900 sm:text-xl">
                      {segment.number} — {segment.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
                      {segment.description}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {segment.focusPoints.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2.5 text-xs font-medium text-ink-800 sm:text-sm"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-ivory-200 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        requestWithBuyerType(segment.inquiryValue as BuyerTypeOption, "sample")
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-forest-800 uppercase transition-colors hover:text-gold-600"
                    >
                      <span>Request Sample ({segment.inquiryValue})</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
