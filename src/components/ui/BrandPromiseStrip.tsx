import React from "react";
import { siteConfig } from "@/config/site";

export function BrandPromiseStrip() {
  return (
    <div
      aria-label="EastField India brand pillars"
      className="border-b border-white/10 bg-forest-950/45 text-ivory-100 backdrop-blur-xs"
    >
      <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-5 sm:px-8 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-10">
        <div className="py-4 lg:pr-6">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-400 uppercase">
            Brand Story
          </p>
          <p className="mt-1 font-serif text-sm font-medium text-ivory-100">
            {siteConfig.tagline}
          </p>
        </div>
        <div className="py-4 lg:px-6">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-400 uppercase">
            Product Promise
          </p>
          <p className="mt-1 text-sm font-extrabold tracking-[0.1em] text-ivory-50 uppercase">
            {siteConfig.productPromise}{" "}
            <span className="font-normal tracking-normal text-ivory-300/85 normal-case">
              · {siteConfig.productPromiseSub}
            </span>
          </p>
        </div>
        <div className="py-4 lg:pl-6">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-400 uppercase">
            Business Positioning
          </p>
          <p className="mt-1 text-sm font-semibold text-ivory-100">
            Bihar-Origin Makhana. Built for B2B Supply.
          </p>
        </div>
      </div>
    </div>
  );
}
