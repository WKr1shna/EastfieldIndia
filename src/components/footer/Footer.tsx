"use client";

import React from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { MAKHANA_GRADES } from "@/features/products/grades";
import { BrandMark } from "@/components/ui/BrandMark";
import { useInquiryPreset } from "@/components/ui/InquiryContext";

export function Footer() {
  const { openSampleRequest } = useInquiryPreset();

  return (
    <footer className="bg-forest-950 text-ivory-200">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <BrandMark variant="dark" subtitle="Bihar-Origin Makhana" />
            <p className="mt-5 inline-block rounded-full border border-gold-500/35 bg-forest-900 px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] text-gold-400 uppercase">
              {siteConfig.productPromise}
            </p>
            <p className="mt-4 max-w-sm font-serif text-lg leading-snug text-ivory-100">
              {siteConfig.tagline}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory-300/80">
              Connecting Bihar&apos;s makhana sourcing and processing ecosystem in Purnea and
              Katihar with professional domestic and international B2B buyers.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-ivory-300/85">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                {siteConfig.location}
              </span>
              <span aria-hidden="true">·</span>
              <span>GSTIN: {siteConfig.gstin}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="sm:col-span-6 lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-ivory-200/85 transition-colors hover:text-gold-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Grade Links */}
          <div className="sm:col-span-6 lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">
              Makhana Grades
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {MAKHANA_GRADES.map((grade) => (
                <li key={grade.id}>
                  <a
                    href="#makhana"
                    className="text-ivory-200/85 transition-colors hover:text-gold-400"
                  >
                    {grade.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* B2B Sample & Sourcing Desk */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">
              B2B Sample &amp; Sourcing Desk
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ivory-300/85">
              Tell us about your requirement. We&apos;ll review sample availability and coordinate
              the next steps.
            </p>
            <button
              type="button"
              onClick={() => openSampleRequest()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-semibold tracking-wider text-forest-950 uppercase transition-colors hover:bg-gold-400"
            >
              <span>Request a Sample</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-ivory-300/80">
              <p>Founder: {siteConfig.founder.name}</p>
              <a
                href={siteConfig.founder.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-gold-400 hover:underline"
              >
                <span>LinkedIn Profile</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 text-xs text-ivory-300/70 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} · Bihar, India · GSTIN:{" "}
            {siteConfig.gstin} ·{" "}
            <a href="/privacy" className="text-gold-400 underline hover:text-ivory-100">
              Privacy Policy
            </a>
          </p>
          <p>
            Product availability, sample terms, tolerances and dispatch terms are confirmed per
            enquiry.
          </p>
        </div>
      </div>
    </footer>
  );
}
