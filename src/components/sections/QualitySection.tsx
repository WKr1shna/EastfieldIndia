import React from "react";
import Image from "next/image";
import { ShieldAlert, Check } from "lucide-react";
import { QUALITY_DISCLAIMER, QUALITY_PARAMETERS } from "@/features/quality/parameters";
import { Reveal } from "@/components/ui/Reveal";

export function QualitySection() {
  return (
    <section id="quality" className="border-b border-ivory-300 bg-ivory-200/65 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          {/* Left Sticky Editorial Column */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                Quality &amp; Verification
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Quality starts before the order.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                A clear specification helps both sides assess the same product, the same lot and the
                same acceptance criteria.
              </p>

              <figure className="mt-7 overflow-hidden rounded-2xl border border-ivory-300 bg-white shadow-sm">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/sourcing/b2b-inspection-supply.jpg"
                    alt="Stainless-steel grading sieves, makhana sample inspection bowls, and palletized bulk export sacks"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-ivory-200 bg-white px-4 py-3 text-xs text-ink-600">
                  Lot-level visual &amp; sieve inspection aligned prior to dispatch.
                </figcaption>
              </figure>

              <div
                role="note"
                className="mt-6 rounded-xl border border-gold-500/45 bg-ivory-50 p-4 text-xs leading-relaxed text-ink-800"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-gold-600"
                    aria-hidden="true"
                  />
                  <p>{QUALITY_DISCLAIMER}</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: 8 Specification Parameters */}
          <div className="lg:col-span-7">
            <Reveal delayMs={100}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.16em] text-forest-800 uppercase">
                  Parameters Agreed With The Buyer
                </p>
                <span className="text-xs text-ink-500">8 Core Criteria</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {QUALITY_PARAMETERS.map((param) => (
                  <div
                    key={param.code}
                    className="rounded-2xl border border-ivory-300 bg-white p-5 shadow-xs transition-colors hover:border-forest-700/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-forest-900 uppercase">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold-500/20 text-gold-600">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                        {param.title}
                      </span>
                      <span className="font-mono text-xs text-ink-500">{param.code}</span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-ink-800">{param.summary}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{param.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
