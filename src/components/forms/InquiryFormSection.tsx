"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Building, CheckCircle2, Loader2, PackageCheck, Send } from "lucide-react";
import { inquirySchema } from "@/validations/inquiry";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

export function InquiryFormSection() {
  const { visitorState, savedContact, hasSavedContact, saveContact, openSampleRequest } =
    useInquiryPreset();

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!hasSavedContact) return;
    const raf = window.requestAnimationFrame(() => {
      setCompany((prev) => prev || savedContact.company);
      setName((prev) => prev || savedContact.name);
      setPhone((prev) => prev || savedContact.phone);
      setEmail((prev) => prev || savedContact.email);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [hasSavedContact, savedContact]);

  function clearFieldError(field: string) {
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
    setServerMessage("");

    const payload = {
      requestType: "enquiry" as const,
      company,
      name,
      phone,
      email,
      leadId: savedContact.leadId,
      visitorId: visitorState.visitorId,
      firstVisitAt: visitorState.firstVisitAt,
      latestVisitAt: visitorState.latestVisitAt,
      leadSource: "general_enquiry" as const,
      skippedInitial: visitorState.skippedInitial,
      details,
      website,
      formStartedAt,
    };

    const parsed = inquirySchema.safeParse(payload);
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
      setServerMessage("Please complete the highlighted business and contact fields.");
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        referenceId?: string;
        message?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setStatus("error");
        setServerMessage(data.error || "Unable to submit your enquiry right now.");
        return;
      }

      saveContact({ leadId: data.referenceId || "", company, name, phone, email });
      setStatus("success");
      setReferenceId(data.referenceId || "");
      setServerMessage(
        data.message || "Thank you. Your business enquiry has been received."
      );
      setDetails("");
      setFormStartedAt(Date.now());
    } catch {
      setStatus("error");
      setServerMessage("A network error occurred. Please check your connection and try again.");
    }
  }

  const inputBaseClass =
    "mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 transition-colors focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

  return (
    <section
      id="inquiry"
      className="bg-grain-dark border-b border-white/10 py-16 text-ivory-100 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Column: Business Enquiry / Sample Trigger & GSTIN Details */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-forest-800/80 px-3.5 py-1 text-[11px] font-bold tracking-[0.15em] text-gold-400 uppercase">
                {siteConfig.productPromise}
              </div>

              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-ivory-50 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                Connect with EastField India.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ivory-200/90">
                Leave your business contact details for a quick commercial conversation, or launch
                our dedicated sample request flow to evaluate Bihar-origin makhana grades.
              </p>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => openSampleRequest()}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-xs font-bold tracking-[0.14em] text-forest-950 uppercase transition-colors hover:bg-gold-400"
                >
                  <PackageCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Request a Sample</span>
                </button>
              </div>

              {/* Separate Business Details & GSTIN Panel */}
              <aside
                aria-label="Business details"
                className="mt-8 rounded-2xl border border-white/15 bg-forest-950/75 p-6"
              >
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">
                  <Building className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Business Details</span>
                </div>
                <p className="mt-3 text-base font-semibold text-ivory-50">{siteConfig.name}</p>
                <p className="mt-0.5 text-sm text-ivory-300/85">{siteConfig.location}</p>
                <dl className="mt-4 border-t border-white/10 pt-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="font-medium tracking-wider text-ivory-300/75 uppercase">
                      GSTIN
                    </dt>
                    <dd className="font-mono text-sm font-semibold tracking-wider text-ivory-100">
                      {siteConfig.gstin}
                    </dd>
                  </div>
                </dl>
              </aside>
            </Reveal>
          </div>

          {/* Right Column: Minimal, Frictionless 4-Field General Business Enquiry */}
          <div className="lg:col-span-7">
            <Reveal delayMs={100}>
              <div className="rounded-2xl border border-ivory-300/20 bg-ivory-100 p-6 text-ink-900 shadow-2xl sm:p-9">
                <div className="mb-6 border-b border-ivory-300 pb-4">
                  <p className="text-xs font-bold tracking-[0.16em] text-gold-600 uppercase">
                    General Business Enquiry
                  </p>
                  <h3 className="mt-1 font-serif text-2xl font-medium text-forest-900">
                    Quick B2B Contact
                  </h3>
                </div>

                {status === "success" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="rounded-2xl border border-forest-700/25 bg-white p-8 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-gold-400">
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h4 className="mt-4 font-serif text-2xl font-medium text-forest-900">
                      Enquiry Received
                    </h4>
                    {referenceId && (
                      <p className="mt-2 inline-block rounded-full bg-ivory-200 px-3.5 py-1 font-mono text-xs font-semibold text-forest-900">
                        Reference: {referenceId}
                      </p>
                    )}
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
                      {serverMessage}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => openSampleRequest()}
                        className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold tracking-wider text-forest-950 uppercase transition-colors hover:bg-gold-400"
                      >
                        <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Need a Sample? Request Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus("idle");
                          setReferenceId("");
                          setServerMessage("");
                        }}
                        className="rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-forest-900 uppercase transition-colors hover:bg-ivory-200"
                      >
                        Send Another Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate aria-label="General Business Enquiry Form">
                    <div className="sr-only" aria-hidden="true">
                      <label htmlFor="website">Leave this field blank</label>
                      <input
                        id="website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>

                    {status === "error" && serverMessage && (
                      <div
                        role="alert"
                        className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                        <span>{serverMessage}</span>
                      </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* 1. Company Name */}
                      <div>
                        <label
                          htmlFor="inquiry-company"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Company Name <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-company"
                          name="company"
                          type="text"
                          required
                          autoComplete="organization"
                          value={company}
                          onChange={(e) => {
                            setCompany(e.target.value);
                            clearFieldError("company");
                          }}
                          aria-invalid={Boolean(fieldErrors.company)}
                          aria-describedby={fieldErrors.company ? "err-company" : undefined}
                          placeholder="Your business or company name"
                          className={`${inputBaseClass} ${
                            fieldErrors.company ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.company && (
                          <p id="err-company" className="mt-1 text-xs text-red-700">
                            {fieldErrors.company}
                          </p>
                        )}
                      </div>

                      {/* 2. Full Name */}
                      <div>
                        <label
                          htmlFor="inquiry-name"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Full Name <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearFieldError("name");
                          }}
                          aria-invalid={Boolean(fieldErrors.name)}
                          aria-describedby={fieldErrors.name ? "err-name" : undefined}
                          placeholder="Your full name"
                          className={`${inputBaseClass} ${
                            fieldErrors.name ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.name && (
                          <p id="err-name" className="mt-1 text-xs text-red-700">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      {/* 3. Mobile Number */}
                      <div>
                        <label
                          htmlFor="inquiry-phone"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Mobile Number <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-phone"
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            clearFieldError("phone");
                          }}
                          aria-invalid={Boolean(fieldErrors.phone)}
                          aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
                          placeholder="+91 98XXX XXXXX / +1 ..."
                          className={`${inputBaseClass} ${
                            fieldErrors.phone ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.phone && (
                          <p id="err-phone" className="mt-1 text-xs text-red-700">
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>

                      {/* 4. Email Address */}
                      <div>
                        <label
                          htmlFor="inquiry-email"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Email Address <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError("email");
                          }}
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={fieldErrors.email ? "err-email" : undefined}
                          placeholder="contact@company.com"
                          className={`${inputBaseClass} ${
                            fieldErrors.email ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.email && (
                          <p id="err-email" className="mt-1 text-xs text-red-700">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Optional Brief Message */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="inquiry-details"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Message <span className="font-normal text-ink-500">(Optional)</span>
                        </label>
                        <textarea
                          id="inquiry-details"
                          name="details"
                          rows={2}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Share your requirement, target grade, or preferred time to connect..."
                          className={`${inputBaseClass} border-ivory-300`}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-ivory-300 pt-5 sm:flex-row sm:items-center">
                      <p className="text-xs text-ink-600">
                        {hasSavedContact
                          ? "Your contact details are saved for this session."
                          : "Only 4 essential business details required."}
                      </p>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-sm font-semibold tracking-wide text-gold-400 uppercase transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {status === "submitting" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Enquiry</span>
                            <Send className="h-4 w-4" aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
