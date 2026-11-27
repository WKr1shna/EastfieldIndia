"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck, X } from "lucide-react";
import { entryLeadSchema } from "@/validations/inquiry";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { FormAlert } from "@/components/ui/FormAlert";

export function WelcomeLeadModal() {
  const {
    welcomeModalMode,
    visitorState,
    saveContact,
    closeWelcomeModal,
    completeWelcomeForSampleGate,
    showSubmissionSuccess,
  } = useInquiryPreset();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const isOpen = welcomeModalMode !== "closed";
  const isSampleGate = welcomeModalMode === "sample_gate";

  useEffect(() => {
    if (!isOpen) {
      const resetRaf = window.requestAnimationFrame(() => {
        setStatus("idle");
        setIsDuplicate(false);
        setServerMessage("");
        setFieldErrors({});
      });
      return () => window.cancelAnimationFrame(resetRaf);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = window.requestAnimationFrame(() => {
      setFormStartedAt(Date.now());
      firstInputRef.current?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeWelcomeModal(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeWelcomeModal]);

  if (!isOpen) return null;

  function clearError(field: string) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setServerMessage("");

    const payload = {
      requestType: "entry_lead" as const,
      name,
      phone,
      company,
      email,
      visitorId: visitorState.visitorId,
      firstVisitAt: visitorState.firstVisitAt,
      latestVisitAt: visitorState.latestVisitAt,
      leadSource: isSampleGate ? ("sample_gate" as const) : ("entry_popup" as const),
      skippedInitial: visitorState.skippedInitial,
      website,
      formStartedAt,
    };

    const parsed = entryLeadSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setStatus("error");
      setServerMessage("Please complete all four business contact details.");
      return;
    }

    setFieldErrors({});
    setIsDuplicate(false);
    setStatus("submitting");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        duplicate?: boolean;
        referenceId?: string;
        message?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
        delivery?: { persisted?: boolean };
      };

      if (!response.ok || !data.ok || data.delivery?.persisted === false) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setIsDuplicate(Boolean(response.status === 409 || data.duplicate));
        setStatus("error");
        setServerMessage(data.error || "Unable to save your details right now.");
        return;
      }

      saveContact({
        leadId: data.referenceId || "",
        name,
        phone,
        company,
        email,
      });

      if (isSampleGate) {
        completeWelcomeForSampleGate();
        return;
      }

      setStatus("idle");
      closeWelcomeModal(false);
      showSubmissionSuccess({
        variant: "welcome_lead",
        title: "Thank You!",
        message: "Your details have been received. Welcome to EastField India.",
        badgeLabel: "Welcome · Saved",
        referenceId: data.referenceId,
        primaryButtonLabel: "Continue Exploring",
      });
    } catch {
      setStatus("error");
      setServerMessage("A network error occurred. Please check your connection and try again.");
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/75 p-3 sm:p-5 backdrop-blur-xs"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWelcomeModal(true);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gold-500/35 bg-ivory-100 text-ink-900 shadow-2xl md:grid-cols-12"
      >
        {/* Accessible Close Button */}
        <button
          type="button"
          onClick={() => closeWelcomeModal(true)}
          aria-label="Close welcome dialog"
          className="absolute right-3.5 top-3.5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-900/15 bg-ivory-50/90 text-forest-900 transition-colors hover:bg-ivory-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Column: Authentic Makhana Brand Showcase (Desktop) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-900 p-8 text-ivory-100 md:col-span-5 md:flex">
          <Image
            src="/images/hero/makhana-hero.jpg"
            alt="Bihar-origin makhana in a handcrafted stoneware bowl"
            fill
            sizes="360px"
            className="object-cover opacity-35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/80 to-forest-950/70"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gold-500/45 bg-forest-900 shadow-xs">
                <Image
                  src="/images/brand/eastfield-logo.png"
                  alt="EastField India Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-xs font-semibold tracking-[0.16em] text-ivory-100 uppercase">
                {siteConfig.name}
              </span>
            </div>

            <div className="mt-8 inline-block rounded-full border border-gold-500/45 bg-forest-950/80 px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] text-gold-400 uppercase">
              {siteConfig.productPromise}
            </div>

            <p className="mt-4 font-serif text-2xl font-medium leading-snug text-ivory-50">
              Bihar-Origin Makhana.
              <span className="mt-1 block font-sans text-lg font-bold tracking-wide text-gold-400 uppercase">
                Built for B2B Supply.
              </span>
            </p>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-4 text-xs text-ivory-200/90">
            <p className="font-semibold text-gold-400">Purnea &amp; Katihar · Bihar, India</p>
            <p className="mt-1">{siteConfig.tagline}</p>
          </div>
        </div>

        {/* Right Column: Welcome Form */}
        <div className="p-6 sm:p-8 md:col-span-7">
          {/* Mobile Brand Header */}
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <span className="rounded-full bg-forest-900 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-gold-400 uppercase">
              {siteConfig.productPromise}
            </span>
          </div>

          <div className="pr-8">
            <p className="text-[11px] font-bold tracking-[0.16em] text-gold-600 uppercase">
              {isSampleGate ? "Step 1 of 2 · Business Details Required" : "B2B Sourcing Desk"}
            </p>
            <h2
              id="welcome-modal-title"
              className="mt-1.5 font-serif text-2xl font-medium text-forest-900 sm:text-3xl"
            >
              Welcome to EastField India
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {isSampleGate
                ? "Please share these four business contact details first so our team can coordinate your sample request."
                : "Discover Bihar-origin makhana, sourced for businesses and buyers."}
            </p>
          </div>

            <form onSubmit={handleSubmit} noValidate className="mt-5" aria-label="Welcome Lead Form">
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="welcome-website">Leave blank</label>
                <input
                  id="welcome-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {status === "error" && serverMessage && (
                <FormAlert message={serverMessage} isDuplicate={isDuplicate} compact />
              )}

              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="welcome-name"
                    className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                  >
                    Full Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="welcome-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    aria-invalid={Boolean(fieldErrors.name)}
                    placeholder="Your full name"
                    className={`${inputClass} ${
                      fieldErrors.name ? "border-red-500" : "border-ivory-300"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
                  )}
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label
                    htmlFor="welcome-phone"
                    className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                  >
                    Mobile Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="welcome-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError("phone");
                    }}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    placeholder="+91 98XXX XXXXX / +1 ..."
                    className={`${inputClass} ${
                      fieldErrors.phone ? "border-red-500" : "border-ivory-300"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* 3. Company Name */}
                <div>
                  <label
                    htmlFor="welcome-company"
                    className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                  >
                    Company Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="welcome-company"
                    name="company"
                    type="text"
                    required
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      clearError("company");
                    }}
                    aria-invalid={Boolean(fieldErrors.company)}
                    placeholder="Business or company name"
                    className={`${inputClass} ${
                      fieldErrors.company ? "border-red-500" : "border-ivory-300"
                    }`}
                  />
                  {fieldErrors.company && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.company}</p>
                  )}
                </div>

                {/* 4. Email Address */}
                <div>
                  <label
                    htmlFor="welcome-email"
                    className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                  >
                    Email Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="welcome-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    placeholder="contact@company.com"
                    className={`${inputClass} ${
                      fieldErrors.email ? "border-red-500" : "border-ivory-300"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-ivory-300 bg-white/80 px-3.5 py-2.5 text-[11px] leading-relaxed text-ink-600">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden="true" />
                <p>
                  Used solely to coordinate B2B makhana sourcing enquiries and sample requests.
                  Submitting is optional for browsing.{" "}
                  <Link
                    href="/privacy"
                    onClick={() => closeWelcomeModal(false)}
                    className="font-semibold text-forest-900 underline hover:text-gold-600"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="mt-5 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => closeWelcomeModal(true)}
                  className="w-full rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide text-ink-600 transition-colors hover:bg-ivory-200 hover:text-forest-900 sm:w-auto"
                >
                  Skip for now
                </button>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-xs font-bold tracking-[0.14em] text-gold-400 uppercase transition-colors hover:bg-forest-800 disabled:opacity-70 sm:w-auto"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{isSampleGate ? "Continue to Sample Request" : "Submit Details"}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
