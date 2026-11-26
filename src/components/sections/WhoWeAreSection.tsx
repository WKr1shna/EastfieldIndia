import React from "react";
import { Building2, Sprout, ArrowRight } from "lucide-react";
import {
  BUYER_ECOSYSTEM_NODES,
  SOURCE_ECOSYSTEM_NODES,
} from "@/features/sourcing/ecosystems";
import { Reveal } from "@/components/ui/Reveal";

export function WhoWeAreSection() {
  return (
    <section id="about" className="bg-grain-ivory border-b border-ivory-300/80 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
              Who We Are · The EastField Model
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              We organise the space between source and buyer.
            </h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-ink-600 sm:text-lg">
              <p>
                EastField India is building a sourcing and aggregation business connecting
                Bihar&apos;s makhana production and processing ecosystem with professional buyers.
              </p>
              <p className="font-medium text-ink-800">
                We work backwards from the brief: grade, quantity, application, destination and
                agreed quality criteria.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Visual Two-Ecosystem Bridge Representation */}
        <Reveal delayMs={100}>
          <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-11 lg:gap-0">
            {/* Source Ecosystem */}
            <div className="flex flex-col justify-between rounded-2xl border border-ivory-300 bg-white p-6 shadow-sm sm:p-8 lg:col-span-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900/10 text-forest-800">
                    <Sprout className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
                    Origin Network
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-wide text-forest-900 uppercase">
                  Source Ecosystem
                </h3>
                <p className="mt-1.5 text-sm text-ink-600">
                  Regional supply rooted in Purnea &amp; Katihar, Bihar.
                </p>

                <ul className="mt-6 space-y-2.5" aria-label="Source ecosystem participants">
                  {SOURCE_ECOSYSTEM_NODES.map((node) => (
                    <li
                      key={node}
                      className="flex items-center gap-3 rounded-lg border border-ivory-200 bg-ivory-50 px-3.5 py-2.5 text-sm font-medium text-ink-800"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-forest-700" />
                      <span>{node}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-6 border-t border-ivory-200 pt-4 text-xs font-medium tracking-wide text-ink-500">
                Harvesting · Popping · Regional Aggregation
              </p>
            </div>

            {/* Connector Left */}
            <div
              aria-hidden="true"
              className="hidden items-center justify-center lg:col-span-1 lg:flex"
            >
              <svg viewBox="0 0 80 40" className="h-10 w-full overflow-visible">
                <line
                  x1="0"
                  y1="20"
                  x2="72"
                  y2="20"
                  stroke="#285C4D"
                  strokeWidth="2"
                  className="animate-flow-line"
                />
                <polygon points="70,15 80,20 70,25" fill="#285C4D" />
              </svg>
            </div>

            {/* Center Bridge: EastField India */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-gold-500/40 bg-forest-900 p-7 text-ivory-100 shadow-xl sm:p-8 lg:col-span-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/40 bg-forest-800 text-xs font-bold tracking-wider text-gold-400">
                    EF
                  </span>
                  <span className="rounded-full border border-gold-500/35 bg-forest-800/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-gold-400 uppercase">
                    The Bridge
                  </span>
                </div>

                <p className="mt-6 text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">
                  EastField India
                </p>
                <h3 className="mt-2 font-serif text-2xl font-medium leading-snug text-ivory-50">
                  The link between the two ecosystems.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory-200/90">
                  Positioned as the leading aggregator of makhana from Purnea and Katihar — aligning
                  lot-level regional supply with commercial buyer specifications.
                </p>
              </div>

              <div className="mt-6 space-y-2 border-t border-white/15 pt-5 text-xs text-ivory-200">
                <div className="flex items-center justify-between">
                  <span className="text-ivory-300/80">Role</span>
                  <span className="font-semibold text-gold-400">Sourcing &amp; Aggregation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ivory-300/80">Approach</span>
                  <span className="font-semibold text-ivory-100">Work Backwards from Brief</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ivory-300/80">Positioning</span>
                  <span className="font-semibold text-ivory-100">Source to Scale</span>
                </div>
              </div>
            </div>

            {/* Connector Right */}
            <div
              aria-hidden="true"
              className="hidden items-center justify-center lg:col-span-1 lg:flex"
            >
              <svg viewBox="0 0 80 40" className="h-10 w-full overflow-visible">
                <line
                  x1="0"
                  y1="20"
                  x2="72"
                  y2="20"
                  stroke="#C6A45C"
                  strokeWidth="2"
                  className="animate-flow-line"
                />
                <polygon points="70,15 80,20 70,25" fill="#C6A45C" />
              </svg>
            </div>

            {/* Mobile Vertical Arrow Indicator */}
            <div className="flex justify-center lg:hidden" aria-hidden="true">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900/10 px-3 py-1 text-xs font-semibold text-forest-800">
                <span>Source to Market Alignment</span>
                <ArrowRight className="h-3.5 w-3.5 rotate-90" />
              </span>
            </div>

            {/* Buyer Ecosystem */}
            <div className="flex flex-col justify-between rounded-2xl border border-ivory-300 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 lg:min-w-0 xl:col-span-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-600">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-ink-500 uppercase">
                    Commercial
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-wide text-forest-900 uppercase">
                  Buyer Ecosystem
                </h3>
                <p className="mt-1.5 text-sm text-ink-600">
                  Domestic &amp; international trade partners.
                </p>

                <ul className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Buyer ecosystem participants">
                  {BUYER_ECOSYSTEM_NODES.map((node) => (
                    <li
                      key={node}
                      className="flex items-center gap-2.5 rounded-lg border border-ivory-200 bg-ivory-50 px-3 py-2 text-xs font-semibold text-ink-800"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{node}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-6 border-t border-ivory-200 pt-4 text-xs font-medium tracking-wide text-ink-500">
                Spec-Matched B2B Supply
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
