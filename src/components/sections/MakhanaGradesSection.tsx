"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Layers } from "lucide-react";
import { MAKHANA_GRADES, SUPPLY_FORMATS, type MakhanaGrade } from "@/features/products/grades";
import { siteConfig } from "@/config/site";
import { useInquiryPreset, type GradeOption } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

export function MakhanaGradesSection() {
  const [selectedGrade, setSelectedGrade] = useState<MakhanaGrade>(MAKHANA_GRADES[2]);
  const { openSampleRequest, requestWithGrade } = useInquiryPreset();

  return (
    <section
      id="makhana"
      className="bg-grain-dark border-b border-white/10 py-16 text-ivory-100 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-400 uppercase">
                  Our Makhana · Commercial Supply
                </p>
                <span className="rounded-full border border-gold-500/40 bg-forest-800 px-3 py-0.5 text-[10px] font-bold tracking-[0.14em] text-gold-400 uppercase">
                  {siteConfig.productPromise}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-ivory-50 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Grades matched to the requirement.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ivory-200/85 sm:text-lg">
                Indicative commercial grade families. Actual availability, size distribution and
                suitability are confirmed lot by lot.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-forest-800/60 px-4 py-3 text-xs text-ivory-200">
              <span className="font-semibold text-gold-400">Visual Note:</span> Product cards show
              illustrative grade visuals; exact size profile is verified per sample lot.
            </div>
          </div>
        </Reveal>

        {/* Interactive Grade Cards Grid (Each with distinct imagery) */}
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
                      ? "border-gold-400 bg-forest-800 shadow-xl ring-1 ring-gold-400/50"
                      : "border-white/12 bg-forest-800/45 hover:-translate-y-1 hover:border-gold-500/45 hover:bg-forest-800/80"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-forest-950">
                    <Image
                      src={grade.image}
                      alt={grade.imageAlt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-forest-950/80 px-2 py-0.5 text-[10px] font-medium tracking-wider text-ivory-200 uppercase backdrop-blur-sm">
                      Illustrative
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold tracking-wide text-ivory-50">
                          {grade.name}
                        </h3>
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 rounded-full transition-colors ${
                            isSelected ? "bg-gold-400" : "bg-white/20 group-hover:bg-gold-400/60"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-xs font-medium text-gold-400">{grade.shortLabel}</p>
                      <p className="mt-2 text-xs leading-relaxed text-ivory-200/80">
                        {grade.summary}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[10px] font-semibold tracking-wider text-ivory-300/80 uppercase">
                        Guilt-Free · Gluten-Free
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-gold-400 transition-transform group-hover:translate-x-0.5"
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
          <div className="mt-8 overflow-hidden rounded-2xl border border-gold-500/30 bg-forest-950/60 p-6 sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-forest-900">
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
                    <p className="text-[11px] font-medium text-ivory-200/90">
                      {selectedGrade.visualNote}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-xs font-semibold tracking-wider text-gold-400 uppercase">
                    Indicative Grade Family
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-ivory-100 uppercase">
                    {siteConfig.productPromise}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-medium text-ivory-50 sm:text-3xl">
                  {selectedGrade.name} — {selectedGrade.shortLabel}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ivory-200/90">
                  {selectedGrade.useCase}
                </p>

                <dl className="mt-6 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold tracking-[0.14em] text-gold-400 uppercase">
                      Sizing &amp; Lot Context
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ivory-200">
                      {selectedGrade.sizingContext}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-[0.14em] text-gold-400 uppercase">
                      Supply &amp; Packaging Context
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ivory-200">
                      {selectedGrade.packagingContext}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openSampleRequest(selectedGrade.inquiryValue as GradeOption)}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold tracking-wide text-forest-950 uppercase transition-colors hover:bg-gold-400"
                  >
                    <span>Request a Sample · {selectedGrade.name}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      requestWithGrade(selectedGrade.inquiryValue as GradeOption, "specification")
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-forest-800/50 px-5 py-3 text-xs font-semibold tracking-wider text-ivory-100 uppercase transition-colors hover:border-gold-400/60"
                  >
                    <span>Discuss Bulk Spec</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Supply Formats Bar */}
        <Reveal delayMs={180}>
          <div className="mt-8 rounded-2xl border border-white/15 bg-forest-800/50 p-6 sm:p-7">
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
                  className="rounded-xl border border-white/10 bg-forest-900/60 p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-ivory-50">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                    <span>{fmt.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory-200/80">{fmt.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
