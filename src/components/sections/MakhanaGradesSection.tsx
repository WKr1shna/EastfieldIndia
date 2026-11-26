"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Layers } from "lucide-react";
import { MAKHANA_GRADES, SUPPLY_FORMATS, type MakhanaGrade } from "@/features/products/grades";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

export function MakhanaGradesSection() {
  const [selectedGrade, setSelectedGrade] = useState<MakhanaGrade>(MAKHANA_GRADES[2]);
  const { openSampleRequest, scrollToEnquiry } = useInquiryPreset();

  return (
    <section
      id="makhana"
      className="border-b border-forest-900/10 py-16 text-ink-900 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                  Our Makhana · Commercial Supply
                </p>
                <span className="rounded-full border border-forest-800/20 bg-white/85 px-3 py-0.5 text-[10px] font-bold tracking-[0.14em] text-forest-900 uppercase">
                  {siteConfig.productPromise}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Grades matched to the requirement.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                Indicative commercial grade families. Actual availability, size distribution and
                suitability are confirmed lot by lot.
              </p>
            </div>

            <div className="rounded-xl border border-forest-900/15 bg-white/85 px-4 py-3 text-xs text-ink-700 shadow-xs">
              <span className="font-semibold text-forest-900">Visual Note:</span> Product cards show
              illustrative grade visuals; exact size profile is verified per sample lot.
            </div>
          </div>
        </Reveal>

        {/* Interactive Grade Cards Grid */}
        <Reveal delayMs={100}>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MAKHANA_GRADES.map((grade) => {
              const isSelected = selectedGrade.id === grade.id;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setSelectedGrade(grade)}
                  aria-pressed={isSelected}
                  className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                    isSelected
                      ? "border-forest-800 bg-white shadow-xl ring-2 ring-gold-500/60"
                      : "border-forest-900/12 bg-white/90 shadow-xs hover:-translate-y-1 hover:border-forest-700/40 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-ivory-200">
                    <Image
                      src={grade.image}
                      alt={grade.imageAlt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-md border border-white/20 bg-forest-950/80 px-2 py-0.5 text-[10px] font-medium tracking-wider text-ivory-100 uppercase backdrop-blur-sm">
                      Illustrative
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold tracking-wide text-forest-900">
                          {grade.name}
                        </h3>
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-gold-500"
                              : "bg-forest-900/15 group-hover:bg-gold-500/60"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-gold-600">{grade.shortLabel}</p>
                      <p className="mt-2 text-xs leading-relaxed text-ink-600">{grade.summary}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-ivory-200 pt-3">
                      <span className="text-[10px] font-semibold tracking-wider text-ink-500 uppercase">
                        Guilt-Free · Gluten-Free
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-forest-800 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Active Grade Detailed Specification Panel */}
        <Reveal delayMs={150}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-gold-500/40 bg-white/95 p-6 shadow-lg sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ivory-300 bg-ivory-100">
                  <Image
                    key={selectedGrade.id}
                    src={selectedGrade.image}
                    alt={selectedGrade.imageAlt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-opacity duration-300"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 to-transparent p-4"
                  >
                    <p className="text-[11px] font-medium text-ivory-100">
                      {selectedGrade.visualNote}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-forest-900 px-3 py-1 text-xs font-semibold tracking-wider text-gold-400 uppercase">
                    Indicative Grade Family
                  </span>
                  <span className="rounded-full border border-forest-800/20 bg-ivory-100 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-forest-900 uppercase">
                    {siteConfig.productPromise}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-medium text-forest-900 sm:text-3xl">
                  {selectedGrade.name} — {selectedGrade.shortLabel}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink-600">
                  {selectedGrade.useCase}
                </p>

                <dl className="mt-6 grid gap-4 border-y border-ivory-200 py-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold tracking-[0.14em] text-gold-600 uppercase">
                      Sizing &amp; Lot Context
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ink-800">
                      {selectedGrade.sizingContext}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-[0.14em] text-gold-600 uppercase">
                      Supply &amp; Packaging Context
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ink-800">
                      {selectedGrade.packagingContext}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openSampleRequest(selectedGrade.inquiryValue)}
                    className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold tracking-wide text-gold-400 uppercase transition-colors hover:bg-forest-800"
                  >
                    <span>Request a Sample · {selectedGrade.name}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToEnquiry()}
                    className="inline-flex items-center gap-2 rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-3 text-xs font-semibold tracking-wider text-forest-900 uppercase transition-colors hover:border-forest-800 hover:bg-ivory-200"
                  >
                    <span>Connect With Us</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Supply Formats Bar */}
        <Reveal delayMs={180}>
          <div className="mt-8 rounded-2xl border border-forest-800/15 bg-forest-900 p-6 text-ivory-100 shadow-lg sm:p-7">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gold-400" aria-hidden="true" />
              <h3 className="text-xs font-semibold tracking-[0.18em] text-gold-400 uppercase">
                Supply Formats
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SUPPLY_FORMATS.map((fmt) => (
                <div
                  key={fmt.title}
                  className="rounded-xl border border-white/10 bg-forest-800/70 p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-ivory-50">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                    <span>{fmt.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory-200/85">{fmt.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
