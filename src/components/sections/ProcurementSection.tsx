"use client";

import React from "react";
import { ArrowRight, ClipboardList, SearchCheck, Truck } from "lucide-react";
import { BUYER_JOURNEY_STEPS, PROCUREMENT_STAGES } from "@/features/procurement/stages";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

const STAGE_ICONS = [ClipboardList, SearchCheck, Truck] as const;

export function ProcurementSection() {
  const { openSampleRequest } = useInquiryPreset();

  return (
    <section id="procurement" className="border-b border-forest-900/10 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                Procurement Process
              </p>
              <span className="rounded-full border border-forest-800/20 bg-white px-3 py-0.5 text-[10px] font-bold tracking-[0.14em] text-forest-900 uppercase">
                {siteConfig.productPromise}
              </span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              Understand. Source &amp; Verify. Supply.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
              A three-stage sourcing architecture built to translate a buyer&apos;s commercial brief
              into verified, repeatable B2B supply.
            </p>
          </div>
        </Reveal>

        {/* Exactly Three Major Stage Headers: 01 — UNDERSTAND, 02 — SOURCE & VERIFY, 03 — SUPPLY */}
        <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
          {/* Desktop flow connector behind cards */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-12 right-12 top-14 hidden h-px bg-gradient-to-r from-forest-700/30 via-gold-500/60 to-forest-700/30 lg:block"
          />

          {PROCUREMENT_STAGES.map((stage, idx) => {
            const Icon = STAGE_ICONS[idx] ?? ClipboardList;
            return (
              <Reveal key={stage.number} delayMs={idx * 90}>
                <article className="relative flex h-full flex-col justify-between rounded-2xl border border-ivory-300 bg-white p-7 shadow-sm sm:p-8">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-gold-400 shadow-xs">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-sm font-bold tracking-wider text-gold-600">
                        STAGE {stage.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-extrabold tracking-wide text-forest-900 uppercase">
                      {stage.number} — {stage.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-ink-800">{stage.headline}</p>

                    <ul className="mt-5 space-y-2 border-t border-ivory-200 pt-5">
                      {stage.steps.map((step) => (
                        <li
                          key={step}
                          className="flex items-center gap-2.5 text-sm text-ink-600"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-700" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <blockquote className="mt-6 rounded-xl border border-ivory-200 bg-ivory-50 px-4 py-3 text-xs font-medium leading-relaxed text-forest-900">
                    &ldquo;{stage.message}&rdquo;
                  </blockquote>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Section 9: Operating Principle Banner */}
        <Reveal delayMs={120}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-gold-500/35 bg-forest-900 px-6 py-10 text-ivory-100 shadow-xl sm:px-10 sm:py-12">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-400 uppercase">
                  Our Operating Principle · {siteConfig.productPromise}
                </p>
                <p className="mt-3 font-serif text-3xl font-medium leading-tight text-ivory-50 sm:text-4xl">
                  Specification-led.{" "}
                  <span className="text-gold-400">Relationship-focused.</span>
                </p>
                <p className="mt-3 text-base text-ivory-200/90 sm:text-lg">
                  Built for repeat buying, not one-off transactions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSampleRequest()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-sm font-semibold tracking-wide text-forest-950 uppercase transition-colors hover:bg-gold-400"
              >
                <span>Request a Sample</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Section 10: Integrated 6-Step Buyer Execution Flow */}
        <Reveal delayMs={160}>
          <div className="mt-10 rounded-2xl border border-ivory-300 bg-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-2 border-b border-ivory-200 pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-gold-600 uppercase">
                  How We Work With Buyers
                </p>
                <p className="mt-1 font-serif text-xl font-medium text-forest-900 sm:text-2xl">
                  From first brief to repeat replenishment
                </p>
              </div>
              <p className="text-xs text-ink-500">
                Mapped across Understand · Source &amp; Verify · Supply
              </p>
            </div>

            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {BUYER_JOURNEY_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex flex-col justify-between rounded-xl border border-ivory-200 bg-ivory-50/75 p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest-900 font-mono text-xs font-bold text-gold-400">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider text-ink-500 uppercase">
                        Stage {item.stageRef}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-bold tracking-wide text-forest-900 uppercase">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
