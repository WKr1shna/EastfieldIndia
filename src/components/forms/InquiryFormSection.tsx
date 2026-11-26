"use client";

import React, { useState } from "react";
import { AlertCircle, Building, CheckCircle2, Loader2, PackageCheck, Send } from "lucide-react";
import {
  FORM_BUYER_TYPES,
  FORM_PRODUCT_GRADES,
  inquirySchema,
} from "@/validations/inquiry";
import { siteConfig } from "@/config/site";
import {
  useInquiryPreset,
  type BuyerTypeOption,
  type GradeOption,
} from "@/components/ui/InquiryContext";
import { Reveal } from "@/components/ui/Reveal";

interface FormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  sampleRequirement: string;
  quantity: string;
  application: string;
  destination: string;
  packaging: string;
  quality: string;
  details: string;
  website: string;
}

const INITIAL_VALUES: FormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "",
  sampleRequirement: "",
  quantity: "",
  application: "",
  destination: "",
  packaging: "",
  quality: "",
  details: "",
  website: "",
};

export function InquiryFormSection() {
  const {
    requestMode,
    selectedGrade,
    selectedBuyerType,
    setRequestMode,
    setSelectedGrade,
    setSelectedBuyerType,
  } = useInquiryPreset();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());

  const isSampleMode = requestMode === "sample";

  function clearFieldError(name: string) {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (name === "grade") {
      setSelectedGrade(value as GradeOption | "");
      clearFieldError("grade");
      return;
    }
    if (name === "buyerType") {
      setSelectedBuyerType(value as BuyerTypeOption | "");
      clearFieldError("buyerType");
      return;
    }
    setValues((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerMessage("");

    const payload = {
      ...values,
      requestType: requestMode,
      grade: selectedGrade,
      buyerType: selectedBuyerType,
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
      setServerMessage("Please complete the highlighted required fields before submitting.");
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
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setStatus("error");
        setServerMessage(
          data.error || "Unable to submit your request right now. Please try again shortly."
        );
        return;
      }

      setStatus("success");
      setReferenceId(data.referenceId || "");
      setServerMessage(
        data.message ||
          "Thank you. We will review sample availability and coordinate the next steps."
      );
      setValues(INITIAL_VALUES);
      setSelectedGrade("");
      setSelectedBuyerType("");
      setFormStartedAt(Date.now());
    } catch {
      setStatus("error");
      setServerMessage(
        "A network error occurred while submitting your request. Please check your connection and try again."
      );
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
          {/* Left Column: Framing, Sample Info & GST Business Details */}
          <div className="lg:col-span-4">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-forest-800/80 px-3.5 py-1 text-[11px] font-bold tracking-[0.15em] text-gold-400 uppercase">
                {siteConfig.productPromise}
              </div>

              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-ivory-50 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                {isSampleMode ? "Request a Sample." : "Start with a specification."}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ivory-200/90">
                {isSampleMode
                  ? "Tell us about your requirement. We'll review sample availability and coordinate the next steps."
                  : "Share the grade, quantity, application and destination. We will review the requirement and confirm the next steps."}
              </p>

              <div className="mt-7 space-y-3 rounded-2xl border border-white/15 bg-forest-800/55 p-6">
                <p className="text-xs font-semibold tracking-[0.15em] text-gold-400 uppercase">
                  What Helps Us Review Faster
                </p>
                <ul className="space-y-2 text-sm text-ivory-200/90">
                  <li>1. Target Suta grade family or custom sizing criteria</li>
                  <li>2. Sample evaluation scope or trial order volume</li>
                  <li>3. Intended application (snacking, retail pack, bulk trade)</li>
                  <li>4. Shipping destination city, state, or port</li>
                </ul>
              </div>

              {/* Clean, readable Business Details & GSTIN Panel */}
              <aside
                aria-label="Business details"
                className="mt-6 rounded-2xl border border-white/15 bg-forest-950/75 p-6"
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

              <p className="mt-5 text-xs leading-relaxed text-ivory-300/80">
                Sample availability, commercial terms, dispatch schedules, and packing options are
                confirmed against each buyer enquiry.
              </p>
            </Reveal>
          </div>

          {/* Right Column: Accessible Request a Sample / Specification Form */}
          <div className="lg:col-span-8">
            <Reveal delayMs={100}>
              <div className="rounded-2xl border border-ivory-300/20 bg-ivory-100 p-6 text-ink-900 shadow-2xl sm:p-9">
                {/* Mode Toggle Tabs */}
                <div
                  role="tablist"
                  aria-label="Inquiry mode"
                  className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-ivory-300 bg-ivory-200 p-1.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSampleMode}
                    onClick={() => {
                      setRequestMode("sample");
                      setFieldErrors({});
                      setStatus("idle");
                      setServerMessage("");
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                      isSampleMode
                        ? "bg-forest-900 text-gold-400 shadow-xs"
                        : "text-ink-600 hover:text-forest-900"
                    }`}
                  >
                    <PackageCheck className="h-4 w-4" aria-hidden="true" />
                    <span>Request a Sample</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isSampleMode}
                    onClick={() => {
                      setRequestMode("specification");
                      setFieldErrors({});
                      setStatus("idle");
                      setServerMessage("");
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                      !isSampleMode
                        ? "bg-forest-900 text-gold-400 shadow-xs"
                        : "text-ink-600 hover:text-forest-900"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Bulk B2B Specification</span>
                  </button>
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
                    <h3 className="mt-4 font-serif text-2xl font-medium text-forest-900">
                      {isSampleMode ? "Sample Request Received" : "Specification Received"}
                    </h3>
                    {referenceId && (
                      <p className="mt-2 inline-block rounded-full bg-ivory-200 px-3.5 py-1 font-mono text-xs font-semibold text-forest-900">
                        Reference: {referenceId}
                      </p>
                    )}
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-600">
                      {serverMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        setReferenceId("");
                        setServerMessage("");
                      }}
                      className="mt-6 inline-flex items-center justify-center rounded-full bg-forest-900 px-6 py-2.5 text-xs font-semibold tracking-wider text-ivory-100 uppercase transition-colors hover:bg-forest-800"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label={isSampleMode ? "Request a Sample Form" : "B2B Makhana Inquiry Form"}
                  >
                    {/* Honeypot field for spam prevention */}
                    <div className="sr-only" aria-hidden="true">
                      <label htmlFor="website">Leave this field blank</label>
                      <input
                        id="website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={values.website}
                        onChange={handleChange}
                      />
                    </div>

                    {status === "error" && serverMessage && (
                      <div
                        role="alert"
                        className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                        <span>{serverMessage}</span>
                      </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Full Name */}
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
                          value={values.name}
                          onChange={handleChange}
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

                      {/* Company Name */}
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
                          value={values.company}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.company)}
                          aria-describedby={fieldErrors.company ? "err-company" : undefined}
                          placeholder="Business or organisation name"
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

                      {/* Business Email */}
                      <div>
                        <label
                          htmlFor="inquiry-email"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Business Email <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={values.email}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={fieldErrors.email ? "err-email" : undefined}
                          placeholder="procurement@company.com"
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

                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="inquiry-phone"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Phone Number <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-phone"
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          value={values.phone}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.phone)}
                          aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
                          placeholder="+91 98XXX XXXXX"
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

                      {/* Country */}
                      <div>
                        <label
                          htmlFor="inquiry-country"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Country <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-country"
                          name="country"
                          type="text"
                          required
                          autoComplete="country-name"
                          value={values.country}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.country)}
                          aria-describedby={fieldErrors.country ? "err-country" : undefined}
                          placeholder="e.g., India, UAE, United Kingdom, USA"
                          className={`${inputBaseClass} ${
                            fieldErrors.country ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.country && (
                          <p id="err-country" className="mt-1 text-xs text-red-700">
                            {fieldErrors.country}
                          </p>
                        )}
                      </div>

                      {/* Buyer Type */}
                      <div>
                        <label
                          htmlFor="inquiry-buyerType"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Buyer Type <span className="text-red-700">*</span>
                        </label>
                        <select
                          id="inquiry-buyerType"
                          name="buyerType"
                          required
                          value={selectedBuyerType}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.buyerType)}
                          aria-describedby={fieldErrors.buyerType ? "err-buyerType" : undefined}
                          className={`${inputBaseClass} ${
                            fieldErrors.buyerType ? "border-red-500" : "border-ivory-300"
                          }`}
                        >
                          <option value="">Select buyer type</option>
                          {FORM_BUYER_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.buyerType && (
                          <p id="err-buyerType" className="mt-1 text-xs text-red-700">
                            {fieldErrors.buyerType}
                          </p>
                        )}
                      </div>

                      {/* Product Grade */}
                      <div>
                        <label
                          htmlFor="inquiry-grade"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Product Grade <span className="text-red-700">*</span>
                        </label>
                        <select
                          id="inquiry-grade"
                          name="grade"
                          required
                          value={selectedGrade}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.grade)}
                          aria-describedby={fieldErrors.grade ? "err-grade" : undefined}
                          className={`${inputBaseClass} ${
                            fieldErrors.grade ? "border-red-500" : "border-ivory-300"
                          }`}
                        >
                          <option value="">Select product grade</option>
                          {FORM_PRODUCT_GRADES.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.grade && (
                          <p id="err-grade" className="mt-1 text-xs text-red-700">
                            {fieldErrors.grade}
                          </p>
                        )}
                      </div>

                      {/* Mode-specific Field: Sample Requirement OR Quantity Required */}
                      {isSampleMode ? (
                        <div>
                          <label
                            htmlFor="inquiry-sampleRequirement"
                            className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                          >
                            Sample Requirement <span className="text-red-700">*</span>
                          </label>
                          <input
                            id="inquiry-sampleRequirement"
                            name="sampleRequirement"
                            type="text"
                            required
                            value={values.sampleRequirement}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.sampleRequirement)}
                            aria-describedby={
                              fieldErrors.sampleRequirement ? "err-sampleRequirement" : undefined
                            }
                            placeholder="e.g., 500 g 6 Suta + 5 Suta evaluation pack"
                            className={`${inputBaseClass} ${
                              fieldErrors.sampleRequirement ? "border-red-500" : "border-ivory-300"
                            }`}
                          />
                          {fieldErrors.sampleRequirement && (
                            <p id="err-sampleRequirement" className="mt-1 text-xs text-red-700">
                              {fieldErrors.sampleRequirement}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="inquiry-quantity"
                            className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                          >
                            Quantity Required <span className="text-red-700">*</span>
                          </label>
                          <input
                            id="inquiry-quantity"
                            name="quantity"
                            type="text"
                            required
                            value={values.quantity}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.quantity)}
                            aria-describedby={fieldErrors.quantity ? "err-quantity" : undefined}
                            placeholder="e.g., 500 kg trial / 2 MT monthly"
                            className={`${inputBaseClass} ${
                              fieldErrors.quantity ? "border-red-500" : "border-ivory-300"
                            }`}
                          />
                          {fieldErrors.quantity && (
                            <p id="err-quantity" className="mt-1 text-xs text-red-700">
                              {fieldErrors.quantity}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Intended Application */}
                      <div>
                        <label
                          htmlFor="inquiry-application"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Intended Application <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-application"
                          name="application"
                          type="text"
                          required
                          value={values.application}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.application)}
                          aria-describedby={fieldErrors.application ? "err-application" : undefined}
                          placeholder="e.g., Flavoured roasting, D2C retail pack, wholesale"
                          className={`${inputBaseClass} ${
                            fieldErrors.application ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.application && (
                          <p id="err-application" className="mt-1 text-xs text-red-700">
                            {fieldErrors.application}
                          </p>
                        )}
                      </div>

                      {/* Shipping Destination */}
                      <div>
                        <label
                          htmlFor="inquiry-destination"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Shipping Destination <span className="text-red-700">*</span>
                        </label>
                        <input
                          id="inquiry-destination"
                          name="destination"
                          type="text"
                          required
                          value={values.destination}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.destination)}
                          aria-describedby={fieldErrors.destination ? "err-destination" : undefined}
                          placeholder="City, warehouse address, or port"
                          className={`${inputBaseClass} ${
                            fieldErrors.destination ? "border-red-500" : "border-ivory-300"
                          }`}
                        />
                        {fieldErrors.destination && (
                          <p id="err-destination" className="mt-1 text-xs text-red-700">
                            {fieldErrors.destination}
                          </p>
                        )}
                      </div>

                      {!isSampleMode && (
                        <>
                          <div>
                            <label
                              htmlFor="inquiry-packaging"
                              className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                            >
                              Packaging Requirements
                            </label>
                            <input
                              id="inquiry-packaging"
                              name="packaging"
                              type="text"
                              value={values.packaging}
                              onChange={handleChange}
                              placeholder="e.g., Bulk lined bags, 10 kg cartons, private-label"
                              className={`${inputBaseClass} border-ivory-300`}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="inquiry-quality"
                              className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                            >
                              Quality Requirements
                            </label>
                            <input
                              id="inquiry-quality"
                              name="quality"
                              type="text"
                              value={values.quality}
                              onChange={handleChange}
                              placeholder="e.g., Moisture %, broken %, documents needed"
                              className={`${inputBaseClass} border-ivory-300`}
                            />
                          </div>
                        </>
                      )}

                      {/* Additional Requirements */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="inquiry-details"
                          className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                        >
                          Additional Requirements
                        </label>
                        <textarea
                          id="inquiry-details"
                          name="details"
                          rows={3}
                          value={values.details}
                          onChange={handleChange}
                          placeholder={
                            isSampleMode
                              ? "Share target volume after sample approval, quality criteria, or delivery notes..."
                              : "Share timeline, sample expectations, or replenishment cadence..."
                          }
                          className={`${inputBaseClass} border-ivory-300`}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-ivory-300 pt-5 sm:flex-row sm:items-center">
                      <p className="text-xs text-ink-600">
                        Tell us about your requirement. We&apos;ll review sample availability and
                        coordinate the next steps.
                      </p>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-sm font-semibold tracking-wide text-gold-400 uppercase transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {status === "submitting" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            <span>Submitting...</span>
                          </>
                        ) : isSampleMode ? (
                          <>
                            <span>Request a Sample</span>
                            <Send className="h-4 w-4" aria-hidden="true" />
                          </>
                        ) : (
                          <>
                            <span>Submit B2B Specification</span>
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
