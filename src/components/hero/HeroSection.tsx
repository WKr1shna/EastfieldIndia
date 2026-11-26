import React from "react";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section
      id="home"
      className="bg-grain-dark relative overflow-hidden border-b border-white/10 text-ivory-100"
    >
      {/* Subtle geometric arcs inspired by EastField print brochure */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full border border-forest-700/40 bg-forest-800/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-[260px] w-[260px] rounded-full bg-forest-700/20"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-24">
        {/* Left: Editorial B2B Copy */}
        <div className="lg:col-span-6">
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/35 bg-forest-800/80 px-3.5 py-1 text-xs font-medium tracking-wider text-gold-400 uppercase">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {siteConfig.heroLocation}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium tracking-wider text-ivory-200/90 uppercase">
              {siteConfig.heroPillars}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-ivory-100 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            Bihar-Origin Makhana.
            <span className="mt-2 block font-sans text-4xl font-extrabold tracking-tight text-ivory-50 uppercase sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]">
              Built for{" "}
              <span className="text-gold-400 underline decoration-gold-500/45 decoration-2 underline-offset-8">
                B2B Supply.
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory-200/90 sm:text-lg">
            EastField India connects Bihar&apos;s makhana sourcing and processing ecosystem with
            professional buyers through structured sourcing, aggregation, quality alignment and
            supply.
          </p>

          <p className="mt-3 text-sm font-medium tracking-wide text-gold-400/95">
            Connecting Bihar&apos;s makhana ecosystem to domestic &amp; global food businesses.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <a
              href="#inquiry"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold tracking-wide text-forest-950 transition-all hover:bg-gold-400"
            >
              <span>Discuss Your Requirement</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#makhana"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory-200/30 bg-forest-800/40 px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory-100 transition-all hover:border-gold-400/60 hover:bg-forest-800"
            >
              <span>Explore Our Supply</span>
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <dt className="text-[11px] font-medium tracking-widest text-ivory-300/75 uppercase">
                Origin Belt
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ivory-100">Purnea &amp; Katihar</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-widest text-ivory-300/75 uppercase">
                Operating Model
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ivory-100">Specification-Led</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-widest text-ivory-300/75 uppercase">
                Supply Formats
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ivory-100">Bulk &amp; Custom</dd>
            </div>
          </dl>
        </div>

        {/* Right: Authentic Makhana Centerpiece */}
        <div className="lg:col-span-6">
          <figure className="relative overflow-hidden rounded-2xl border border-white/15 bg-forest-800 shadow-2xl">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/hero/makhana-hero.jpg"
                alt="Handcrafted stoneware bowl of authentic Bihar-origin makhana (puffed lotus seeds) in natural morning light with lotus leaves"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent"
              />
            </div>

            <figcaption className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-forest-950/85 px-4 py-3 backdrop-blur-sm">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-400 uppercase">
                  From Source to Scale
                </p>
                <p className="mt-0.5 text-xs text-ivory-100/95">
                  Bihar-origin Euryale ferox · Structured aggregation &amp; B2B lot verification
                </p>
              </div>
              <span className="rounded-md border border-gold-500/35 bg-forest-800/80 px-2.5 py-1 text-[11px] font-medium tracking-wider text-ivory-100 uppercase">
                4 Suta – 6+ Suta
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
