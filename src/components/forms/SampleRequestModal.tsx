"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Edit3, Loader2, PackageCheck, Send, X } from "lucide-react";
import { PRODUCT_GRADES, inquirySchema, type ProductGradeOption } from "@/validations/inquiry";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";

export function SampleRequestModal() {
  const {
    isSampleModalOpen,
    selectedGrade,
    savedContact,
    hasSavedContact,
    setSelectedGrade,
    saveContact,
    clearContact,
    closeSampleModal,
  } = useInquiryPreset();

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sampleRequirement, setSampleRequirement] = useState("");
  const [destination, setDestination] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [editingSaved, setEditingSaved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());

  // Sync saved session contact into fields whenever modal opens
  useEffect(() => {
    if (!isSampleModalOpen) return;
    const raf = window.requestAnimationFrame(() => {
      setFormStartedAt(Date.now());
      if (hasSavedContact) {
        setCompany(savedContact.company);
        setName(savedContact.name);
        setPhone(savedContact.phone);
        setEmail(savedContact.email);
        setEditingSaved(false);
      } else {
        setEditingSaved(true);
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isSampleModalOpen, hasSavedContact, savedContact]);

  // Close on Escape and lock body scroll while open
  useEffect(() => {
    if (!isSampleModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSampleModal();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSampleModalOpen, closeSampleModal]);

  if (!isSampleModalOpen) return null;

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
      requestType: "sample" as const,
      company,
      name,
      phone,
      email,
      grade: selectedGrade,
      sampleRequirement,
      destination,
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
      if (nextErrors.company || nextErrors.name || nextErrors.phone || nextErrors.email) {
        setEditingSaved(true);
      }
      setStatus("error");
      setServerMessage("Please provide the mandatory business and contact details.");
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
        setServerMessage(data.error || "Unable to submit your sample request right now.");
        return;
      }

      saveContact({ company, name, phone, email });
      setStatus("success");
      setReferenceId(data.referenceId || "");
      setServerMessage(
        data.message ||
          "Thank you. Your sample request has been received. We will review sample availability and coordinate the next steps."
      );
      setSampleRequirement("");
      setDestination("");
      setDetails("");
      setFormStartedAt(Date.now());
    } catch {
      setStatus("error");
      setServerMessage("A network error occurred. Please check your connection and try again.");
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/75 p-4 backdrop-blur-xs"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSampleModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sample-modal-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gold-500/35 bg-ivory-100 text-ink-900 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-forest-900 px-6 py-5 text-ivory-100">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-gold-400 uppercase">
              <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{siteConfig.productPromise} · Sample Evaluation</span>
            </div>
            <h2 id="sample-modal-title" className="mt-1 font-serif text-2xl font-medium text-ivory-50">
              Request a Sample
            </h2>
          </div>

          <button
            type="button"
            onClick={closeSampleModal}
            aria-label="Close sample request dialog"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-ivory-200 transition-colors hover:bg-forest-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-forest-700/20 bg-white p-7 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-gold-400">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-2xl font-medium text-forest-900">
                Sample Request Received
              </h3>
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
                  onClick={() => {
                    setStatus("idle");
                    setReferenceId("");
                    setServerMessage("");
                  }}
                  className="rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-forest-900 uppercase hover:bg-ivory-200"
                >
                  Request Another Grade
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    closeSampleModal();
                  }}
                  className="rounded-full bg-forest-900 px-6 py-2.5 text-xs font-semibold tracking-wider text-gold-400 uppercase hover:bg-forest-800"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Request a Sample Form">
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="modal-website">Leave blank</label>
                <input
                  id="modal-website"
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

              {/* Step 1: Mandatory Business & Contact Details (or Smart Session Reuse Summary) */}
              <div className="rounded-xl border border-ivory-300 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold tracking-[0.14em] text-forest-900 uppercase">
                    1. Business &amp; Contact Details <span className="text-red-700">*</span>
                  </p>
                  {hasSavedContact && !editingSaved && (
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingSaved(true)}
                        className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:text-gold-600"
                      >
                        <Edit3 className="h-3 w-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          clearContact();
                          setCompany("");
                          setName("");
                          setPhone("");
                          setEmail("");
                          setEditingSaved(true);
                        }}
                        className="text-ink-500 hover:text-red-700"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {hasSavedContact && !editingSaved ? (
                  <div className="mt-3 rounded-lg border border-ivory-200 bg-ivory-50 px-3.5 py-2.5 text-xs text-ink-800">
                    <p className="font-semibold text-forest-900">
                      Reusing details from this session:
                    </p>
                    <p className="mt-1">
                      {company} · {name} · {phone} · {email}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="sample-company"
                        className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                      >
                        Company Name <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="sample-company"
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
                        placeholder="Business or company name"
                        className={`${inputClass} ${
                          fieldErrors.company ? "border-red-500" : "border-ivory-300"
                        }`}
                      />
                      {fieldErrors.company && (
                        <p className="mt-1 text-xs text-red-700">{fieldErrors.company}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="sample-name"
                        className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                      >
                        Full Name <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="sample-name"
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
                        placeholder="Contact person's full name"
                        className={`${inputClass} ${
                          fieldErrors.name ? "border-red-500" : "border-ivory-300"
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="sample-phone"
                        className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                      >
                        Mobile Number <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="sample-phone"
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
                        placeholder="+91 98XXX XXXXX / +1 ..."
                        className={`${inputClass} ${
                          fieldErrors.phone ? "border-red-500" : "border-ivory-300"
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="sample-email"
                        className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                      >
                        Email Address <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="sample-email"
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
                        placeholder="procurement@company.com"
                        className={`${inputClass} ${
                          fieldErrors.email ? "border-red-500" : "border-ivory-300"
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Sample Specification (Separate & Streamlined) */}
              <div className="mt-4 rounded-xl border border-ivory-300 bg-white p-4 sm:p-5">
                <p className="text-xs font-bold tracking-[0.14em] text-forest-900 uppercase">
                  2. Sample Specification
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sample-grade"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Desired Makhana Grade
                    </label>
                    <select
                      id="sample-grade"
                      name="grade"
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value as ProductGradeOption)}
                      className={`${inputClass} border-ivory-300`}
                    >
                      {PRODUCT_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="sample-requirement"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Quantity / Sample Requirement
                    </label>
                    <input
                      id="sample-requirement"
                      name="sampleRequirement"
                      type="text"
                      value={sampleRequirement}
                      onChange={(e) => setSampleRequirement(e.target.value)}
                      placeholder="e.g., 500 g evaluation pack"
                      className={`${inputClass} border-ivory-300`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="sample-destination"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Shipping Destination
                    </label>
                    <input
                      id="sample-destination"
                      name="destination"
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="City, state, or country"
                      className={`${inputClass} border-ivory-300`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="sample-details"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Additional Requirements
                    </label>
                    <textarea
                      id="sample-details"
                      name="details"
                      rows={2}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Intended application, moisture/broken notes, or estimated order volume..."
                      className={`${inputClass} border-ivory-300`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs text-ink-600">
                  Tell us about your requirement. We&apos;ll review sample availability and
                  coordinate the next steps.
                </p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-xs font-bold tracking-[0.14em] text-gold-400 uppercase transition-colors hover:bg-forest-800 disabled:opacity-70"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Request a Sample</span>
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
