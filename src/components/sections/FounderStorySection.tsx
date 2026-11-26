"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

export function FounderStorySection() {
  const { openSampleRequest } = useInquiryPreset();

  return (
    <section
      id="founder"
      className="border-b border-forest-900/10 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Distinct Editorial Manuscript Spread: How we work -> Why we started -> Let's work together */}
        <div className="relative overflow-hidden rounded-3xl border border-gold-500/40 bg-ivory-50 p-7 shadow-xl sm:p-10 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-2xl border border-gold-500/15"
          />

          <Reveal>
            <div className="relative border-b border-ivory-300 pb-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold tracking-[0.18em] text-gold-600 uppercase sm:text-sm">
                  Meet the Brains Behind the Vision · Get to Know Our Roots
                </p>
                <span className="rounded-full border border-forest-800/20 bg-ivory-200 px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] text-forest-900 uppercase">
                  {siteConfig.productPromise}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                Rooted in Bihar. Inspired by India.{" "}
                <span className="text-forest-700">Made for the World.</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Editorial Sidebar: Unobstructed Founder Portrait & High-Contrast Nameplate */}
            <div className="lg:col-span-4">
              <Reveal delayMs={80}>
                <aside className="overflow-hidden rounded-2xl border border-forest-800/15 bg-forest-900 text-ivory-100 shadow-lg">
                  <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-gold-500/25 bg-forest-950">
                    <Image
                      src="/images/founder/surya-alok.jpg"
                      alt="Surya Alok, Founder of EastField India"
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover object-[50%_18%]"
                    />
                  </div>

                  {/* Dedicated high-contrast nameplate below portrait */}
                  <div className="border-b border-white/12 bg-forest-950/60 px-7 py-5 sm:px-8">
                    <h3 className="font-serif text-2xl font-semibold tracking-tight text-ivory-50 sm:text-[1.65rem]">
                      {siteConfig.founder.name}
                    </h3>
                    <p className="mt-1 text-xs font-bold tracking-[0.16em] text-gold-400 uppercase">
                      {siteConfig.founder.role}
                    </p>
                  </div>

                  <div className="p-7 sm:p-8">
                    <blockquote className="border-l-2 border-gold-500 pl-4 font-serif text-lg leading-snug text-ivory-50">
                      &ldquo;Our roots are Indian. Our vision is global.&rdquo;
                    </blockquote>

                    <div className="mt-6 rounded-xl border border-white/15 bg-forest-800/70 p-4">
                      <p className="text-[11px] font-bold tracking-[0.15em] text-gold-400 uppercase">
                        {siteConfig.productPromise}
                      </p>
                      <p className="mt-1 text-xs text-ivory-100/90">
                        {siteConfig.productPromiseSub}
                      </p>
                    </div>

                    <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-ivory-200/80">Origin Focus</dt>
                        <dd className="font-semibold text-ivory-50">Bihar, India</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-ivory-200/80">Core Ecosystem</dt>
                        <dd className="font-semibold text-ivory-50">Purnea &amp; Katihar</dd>
                      </div>
                    </dl>

                    <a
                      href={siteConfig.founder.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold-500/50 bg-forest-800 px-5 py-3 text-xs font-bold tracking-wider text-gold-400 uppercase transition-colors hover:bg-gold-500 hover:text-forest-950"
                    >
                      <span>Connect on LinkedIn</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </aside>
              </Reveal>
            </div>

            {/* Editorial Narrative: High-contrast ink-900 typography on solid ivory */}
            <div className="lg:col-span-8">
              <Reveal delayMs={140}>
                <article className="max-w-[64ch] space-y-6 text-[1.0625rem] leading-[1.85] text-ink-900 sm:text-[1.125rem]">
                  <div className="border-l-2 border-gold-500 pl-4">
                    <p className="font-serif text-xl font-semibold text-forest-900 sm:text-2xl">
                      {siteConfig.founder.name}
                    </p>
                    <p className="text-xs font-bold tracking-[0.16em] text-forest-700 uppercase">
                      {siteConfig.founder.role}
                    </p>
                  </div>

                  <p className="font-serif text-xl leading-relaxed text-forest-900 sm:text-[1.35rem]">
                    Coming from Bihar, I have a natural connection with the region&apos;s rich food
                    and cultural heritage.
                  </p>
                  <p>
                    My personal interest in healthy living, conscious eating and nutrition has made
                    me appreciate the value of traditional Indian foods and indigenous superfoods.
                  </p>
                  <p>
                    India has an extraordinary food heritage. From makhana in Bihar to countless
                    regional ingredients across the country, generations have preserved foods that
                    deserve greater recognition and appreciation.
                  </p>
                  <p>Yet, much of this heritage remains underrepresented in international markets.</p>
                  <p className="font-semibold text-forest-900">
                    That is where EastField India begins.
                  </p>
                  <p>
                    My vision is to build a brand that takes India&apos;s regional and traditional
                    superfoods beyond geographical boundaries. We are starting with makhana, a
                    product deeply connected to Bihar, with the ambition to explore and introduce
                    more of India&apos;s distinctive food heritage to the world.
                  </p>
                  <p>
                    For me, this is about more than business. It is about celebrating where our food
                    comes from, making traditional nutrition more accessible and creating
                    opportunities for India&apos;s regional produce.
                  </p>
                  <p>
                    I want EastField India to represent something meaningful: Indian heritage,
                    conscious food choices and a global outlook.
                  </p>

                  <div className="border-t border-ivory-300 pt-6">
                    <p className="font-serif text-2xl font-semibold text-forest-900">
                      Our roots are Indian. Our vision is global.
                    </p>
                    <p className="mt-3 text-base font-bold text-forest-900">
                      — {siteConfig.founder.name}
                    </p>
                    <p className="text-sm font-medium text-ink-600">{siteConfig.founder.role}</p>
                  </div>

                  {/* Natural Closing Bridge: Why we started -> Let's work together */}
                  <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-gold-500/35 bg-ivory-200/80 p-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.16em] text-gold-600 uppercase">
                        Let&apos;s Work Together
                      </p>
                      <p className="mt-1 text-sm font-semibold text-forest-900">
                        Ready to evaluate Bihar-origin makhana for your business?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openSampleRequest()}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-xs font-bold tracking-[0.14em] text-gold-400 uppercase transition-colors hover:bg-forest-800"
                    >
                      <span>Request a Sample</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
