"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Compass, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

interface HubDetail {
  id: "purnea" | "katihar";
  name: string;
  regionLabel: string;
  summary: string;
  role: string;
  cx: number;
  cy: number;
}

const SOURCING_HUBS: HubDetail[] = [
  {
    id: "purnea",
    name: "Purnea",
    regionLabel: "Kosi–Seemanchal Cultivation & Processing Hub",
    summary:
      "One of Bihar's primary makhana production and popping belts, supporting commercial suta grading and seasonal lot availability.",
    role: "Primary popping, sizing & regional aggregation corridor",
    cx: 278,
    cy: 118,
  },
  {
    id: "katihar",
    name: "Katihar",
    regionLabel: "Mahananda Wetland & Trade Consolidation Hub",
    summary:
      "A core makhana-producing and trading ecosystem in eastern Bihar linking wetland harvesting networks with commercial buyers.",
    role: "Processor network coordination & bulk lot consolidation",
    cx: 302,
    cy: 162,
  },
];

export function SourcingRegionSection() {
  const [activeHub, setActiveHub] = useState<HubDetail>(SOURCING_HUBS[0]);

  return (
    <section id="sourcing" className="border-b border-ivory-300 bg-ivory-200/70 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left: Regional Copy & Interactive Hub Selector */}
          <div className="lg:col-span-6">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                Our Sourcing Region · Bihar, India
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Rooted in Bihar&apos;s Makhana Ecosystem.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                We work within the sourcing ecosystem of Purnea and Katihar, connecting regional
                supply with buyer requirements.
              </p>

              <div className="mt-6 rounded-xl border border-forest-800/15 bg-forest-900 px-5 py-4 text-ivory-100">
                <p className="text-xs font-semibold tracking-[0.15em] text-gold-400 uppercase">
                  Regional Positioning
                </p>
                <p className="mt-1 font-serif text-lg font-medium text-ivory-50">
                  A link between regional sourcing and professional markets.
                </p>
              </div>

              {/* Interactive Hub Cards */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {SOURCING_HUBS.map((hub) => {
                  const selected = activeHub.id === hub.id;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => setActiveHub(hub)}
                      aria-pressed={selected}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        selected
                          ? "border-forest-800 bg-white shadow-md ring-1 ring-forest-800/20"
                          : "border-ivory-300 bg-ivory-50/80 hover:border-forest-700/40 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold tracking-wide text-forest-900 uppercase">
                          <MapPin
                            className={`h-4 w-4 ${selected ? "text-gold-600" : "text-forest-700"}`}
                            aria-hidden="true"
                          />
                          {hub.name}
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            selected ? "bg-gold-500" : "bg-ivory-300"
                          }`}
                        />
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-ink-600">{hub.regionLabel}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-ivory-300 bg-white p-5">
                <p className="text-xs font-semibold tracking-[0.14em] text-forest-700 uppercase">
                  {activeHub.name} · Sourcing Focus
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{activeHub.summary}</p>
                <p className="mt-2.5 text-xs font-semibold text-forest-900">{activeHub.role}</p>
              </div>
            </Reveal>
          </div>

          {/* Right: Illustrated Regional Map + Authentic Wetland Photography */}
          <div className="space-y-5 lg:col-span-6">
            <Reveal delayMs={120}>
              {/* Stylized Illustrated Map of Eastern Bihar Makhana Belt */}
              <div className="rounded-2xl border border-forest-800/15 bg-forest-900 p-5 text-ivory-100 shadow-lg sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    <span className="text-xs font-semibold tracking-[0.15em] text-gold-400 uppercase">
                      Eastern Bihar Sourcing Belt
                    </span>
                  </div>
                  <span className="text-[11px] text-ivory-300/75">
                    Stylized Regional Illustration
                  </span>
                </div>

                <svg
                  viewBox="0 0 420 240"
                  role="img"
                  aria-label="Stylized illustration of Bihar highlighting the Purnea and Katihar makhana sourcing belt and outbound trade corridors"
                  className="w-full rounded-xl border border-white/10 bg-forest-950/60"
                >
                  {/* Subtle grid */}
                  <defs>
                    <pattern id="region-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path
                        d="M 24 0 L 0 0 0 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="420" height="240" fill="url(#region-grid)" />

                  {/* Stylized Bihar boundary silhouette (artistic outline, clearly illustrative) */}
                  <path
                    d="M 78 62 L 152 54 L 222 60 L 295 58 L 336 74 L 344 116 L 330 168 L 288 188 L 234 196 L 178 192 L 116 196 L 76 172 L 66 122 Z"
                    fill="#17483B"
                    fillOpacity="0.48"
                    stroke="#35705F"
                    strokeWidth="1.5"
                  />

                  {/* Kosi-Mahananda Wetland Zone highlight */}
                  <ellipse
                    cx="288"
                    cy="134"
                    rx="46"
                    ry="44"
                    fill="#C6A45C"
                    fillOpacity="0.14"
                    stroke="#C6A45C"
                    strokeOpacity="0.45"
                    strokeDasharray="4 4"
                  />

                  {/* Stylized River Arcs */}
                  <path
                    d="M 74 134 Q 168 118 242 132 T 340 144"
                    fill="none"
                    stroke="#35705F"
                    strokeWidth="2"
                    strokeOpacity="0.55"
                  />

                  {/* Outbound B2B Trade Connection Arcs */}
                  <path
                    d="M 278 118 Q 205 90 112 110"
                    fill="none"
                    stroke="#C6A45C"
                    strokeWidth="1.5"
                    className="animate-flow-line"
                  />
                  <path
                    d="M 302 162 Q 350 184 392 198"
                    fill="none"
                    stroke="#C6A45C"
                    strokeWidth="1.5"
                    className="animate-flow-line"
                  />

                  {/* Domestic & Export Corridor Labels */}
                  <circle cx="112" cy="110" r="3.5" fill="#EDE6D4" />
                  <text x="86" y="100" fill="#EDE6D4" fontSize="9.5" fontFamily="sans-serif">
                    Domestic Markets
                  </text>
                  <text x="322" y="214" fill="#D4B46F" fontSize="9.5" fontFamily="sans-serif">
                    Export Corridors
                  </text>

                  {/* Hub Markers */}
                  {SOURCING_HUBS.map((hub) => {
                    const selected = activeHub.id === hub.id;
                    return (
                      <g
                        key={hub.id}
                        onClick={() => setActiveHub(hub)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={hub.cx}
                          cy={hub.cy}
                          r={selected ? 14 : 10}
                          fill="#C6A45C"
                          fillOpacity={selected ? 0.28 : 0.14}
                        />
                        <circle
                          cx={hub.cx}
                          cy={hub.cy}
                          r={selected ? 6 : 4.5}
                          fill={selected ? "#D4B46F" : "#F5F1E5"}
                          stroke="#0B3027"
                          strokeWidth="1.5"
                        />
                        <text
                          x={hub.cx - 48}
                          y={hub.id === "purnea" ? hub.cy - 12 : hub.cy + 18}
                          fill="#FAF8F2"
                          fontSize="11.5"
                          fontWeight="700"
                          fontFamily="sans-serif"
                        >
                          {hub.name}
                        </text>
                      </g>
                    );
                  })}

                  <text
                    x="18"
                    y="224"
                    fill="rgba(237,230,212,0.55)"
                    fontSize="8.5"
                    fontFamily="sans-serif"
                  >
                    BIHAR, INDIA · ILLUSTRATIVE SOURCING ORIENTATION (NOT TO CARTOGRAPHIC SCALE)
                  </text>
                </svg>
              </div>

              {/* Authentic Bihar Wetland Photography */}
              <figure className="relative overflow-hidden rounded-2xl border border-ivory-300 bg-forest-900 shadow-md">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src="/images/sourcing/bihar-lotus-wetland.jpg"
                    alt="Morning light over traditional Euryale ferox makhana ponds in Bihar wetlands"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-transparent to-transparent"
                  />
                </div>
                <figcaption className="absolute inset-x-4 bottom-3 flex items-center justify-between text-xs text-ivory-100">
                  <span className="font-medium">
                    Bihar&apos;s wetland ecology · Traditional Euryale ferox cultivation
                  </span>
                  <span className="hidden text-gold-400 sm:inline">Purnea &amp; Katihar Belt</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
