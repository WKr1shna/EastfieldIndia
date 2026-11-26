import React from "react";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";

export function FounderStorySection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Elevated warm-ivory manuscript frame guarantees crisp readability across green-to-sage transition */}
        <div className="rounded-3xl border border-gold-500/35 bg-ivory-50/96 p-7 shadow-xl backdrop-blur-xs sm:p-10 lg:p-14">
          <Reveal>
            <div className="border-b border-ivory-300 pb-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
                  Founder&apos;s Note · Brand Heritage
                </p>
                <span className="rounded-full border border-forest-800/20 bg-ivory-200 px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] text-forest-900 uppercase">
                  {siteConfig.productPromise}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                Rooted in Bihar. Inspired by India.{" "}
                <span className="text-forest-700">Made for the World.</span>
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <Reveal delayMs={80}>
                <aside className="rounded-2xl border border-forest-800/15 bg-forest-900 p-7 text-ivory-100 shadow-lg sm:p-8">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold-500/45 bg-forest-800 font-serif text-xl font-semibold text-gold-400"
                    >
                      SA
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ivory-50">
                        {siteConfig.founder.name}
                      </h3>
                      <p className="text-xs font-medium tracking-wider text-gold-400 uppercase">
                        {siteConfig.founder.role}
                      </p>
                    </div>
                  </div>

                  <blockquote className="mt-7 border-l-2 border-gold-500 pl-4 font-serif text-lg leading-snug text-ivory-100">
                    &ldquo;Our roots are Indian. Our vision is global.&rdquo;
                  </blockquote>

                  <div className="mt-6 rounded-xl border border-white/10 bg-forest-800/60 p-3.5">
                    <p className="text-[11px] font-bold tracking-[0.15em] text-gold-400 uppercase">
                      {siteConfig.productPromise}
                    </p>
                    <p className="mt-1 text-xs text-ivory-200/85">
                      {siteConfig.productPromiseSub}
                    </p>
                  </div>

                  <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-xs">
                    <div className="flex items-center justify-between">
                      <dt className="text-ivory-300/80">Origin Focus</dt>
                      <dd className="font-semibold text-ivory-100">Bihar, India</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-ivory-300/80">Core Ecosystem</dt>
                      <dd className="font-semibold text-ivory-100">Purnea &amp; Katihar</dd>
                    </div>
                  </dl>

                  <a
                    href={siteConfig.founder.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold-500/45 bg-forest-800/80 px-5 py-2.5 text-xs font-semibold tracking-wider text-gold-400 uppercase transition-colors hover:bg-gold-500 hover:text-forest-950"
                  >
                    <span>Connect on LinkedIn</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </aside>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delayMs={140}>
                <article className="max-w-2xl space-y-5 text-base leading-[1.8] text-ink-800 sm:text-[1.0625rem]">
                  <p className="text-xs font-semibold tracking-[0.16em] text-ink-500 uppercase">
                    Surya Alok | Founder, EastField India
                  </p>

                  <p>
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
                  <p className="font-medium text-forest-900">
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
                    <p className="font-serif text-xl font-semibold text-forest-900">
                      Our roots are Indian. Our vision is global.
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink-600">
                      — Surya Alok
                      <br />
                      Founder, EastField India
                    </p>
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
