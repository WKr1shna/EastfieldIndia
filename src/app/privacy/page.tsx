import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How EastField India collects, uses, and safeguards business contact details submitted for B2B makhana sourcing enquiries and sample requests.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ivory-100 text-ink-900">
      <header className="border-b border-white/10 bg-forest-900 py-4 text-ivory-100">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Return to EastField India homepage">
            <BrandMark variant="dark" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold tracking-wider text-ivory-100 uppercase hover:border-gold-400 hover:text-gold-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
          Privacy &amp; Data Handling
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium text-forest-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          {siteConfig.name} · {siteConfig.location} · GSTIN: {siteConfig.gstin}
        </p>

        <div className="mt-8 space-y-8 rounded-2xl border border-ivory-300 bg-white p-7 text-sm leading-relaxed text-ink-700 sm:p-10">
          <section>
            <h2 className="text-base font-bold tracking-wide text-forest-900 uppercase">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              When you choose to submit a welcome contact form, general business enquiry, or sample
              request, we collect your business contact information: <strong>Full Name</strong>,{" "}
              <strong>Mobile Number</strong>, <strong>Company Name</strong>, and{" "}
              <strong>Email Address</strong>, along with any optional sample or sourcing details you
              provide (such as requested makhana grade, quantity, or shipping destination).
            </p>
            <p className="mt-2">
              Submitting your details is never required merely to browse public pages on our
              website. You may select <em>Skip for now</em> on the welcome modal and explore the
              website freely.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold tracking-wide text-forest-900 uppercase">
              2. How We Use Your Details
            </h2>
            <p className="mt-2">
              We use the information strictly to respond to your B2B makhana sourcing enquiry,
              assess sample availability, coordinate sample dispatches, and communicate regarding
              commercial supply requirements. We do not sell or rent your business contact details
              to third-party marketers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold tracking-wide text-forest-900 uppercase">
              3. Browser Storage &amp; Session Continuity
            </h2>
            <p className="mt-2">
              We store minimal preference and contact-continuity state in your browser&apos;s local
              or session storage so that (a) visitors who skip the welcome modal are not repeatedly
              prompted, and (b) visitors who have already submitted their four contact details do
              not have to re-enter them when requesting a product sample.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold tracking-wide text-forest-900 uppercase">
              4. Security &amp; Retention
            </h2>
            <p className="mt-2">
              Lead records are validated server-side, protected by rate limiting and access
              controls, and retained only as long as reasonably required to manage commercial B2B
              enquiries and legal compliance. To request correction or removal of your contact
              details, please reach out through our enquiry form or official LinkedIn channel.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
