"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Edit3, Loader2, PackageCheck, Send, X } from "lucide-react";
import {
  SAMPLE_GRADES,
  SAMPLE_PRODUCT_TYPES,
  inquirySchema,
  type SampleGradeOption,
  type SampleProductTypeOption,
} from "@/validations/inquiry";
import { siteConfig } from "@/config/site";
import { useInquiryPreset } from "@/components/ui/InquiryContext";
import { CountryCombobox } from "@/components/ui/CountryCombobox";

export function SampleRequestModal() {
  const {
    isSampleModalOpen,
    selectedGrade,
    visitorState,
    savedContact,
    hasSavedContact,
    setSelectedGrade,
    saveContact,
    closeSampleModal,
  } = useInquiryPreset();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [productType, setProductType] = useState<SampleProductTypeOption | "">("");

  // Structured shipping address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [editingSaved, setEditingSaved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [submittedSummary, setSubmittedSummary] = useState<{
    grade: string;
    productType: string;
    address: string;
  } | null>(null);
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!isSampleModalOpen) return;
    const raf = window.requestAnimationFrame(() => {
      setFormStartedAt(Date.now());
      setStatus("idle");
      setServerMessage("");
      setFieldErrors({});
      setSubmittedSummary(null);
      if (hasSavedContact) {
        setName(savedContact.name);
        setPhone(savedContact.phone);
        setCompany(savedContact.company);
        setEmail(savedContact.email);
        setEditingSaved(false);
      } else {
        setEditingSaved(true);
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isSampleModalOpen, hasSavedContact, savedContact]);

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
    if (status === "submitting") return;
    setServerMessage("");

    const payload = {
      requestType: "sample" as const,
      name,
      phone,
      company,
      email,
      leadId: savedContact.leadId,
      visitorId: visitorState.visitorId,
      firstVisitAt: visitorState.firstVisitAt,
      latestVisitAt: visitorState.latestVisitAt,
      leadSource: visitorState.skippedInitial ? ("sample_gate" as const) : ("entry_popup" as const),
      skippedInitial: visitorState.skippedInitial,
      desiredGrade: selectedGrade,
      productType,
      shippingAddress: {
        addressLine1,
        addressLine2,
        city,
        state: stateRegion,
        postalCode,
        country,
      },
      details,
      website,
      formStartedAt,
    };

    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.length > 0 ? issue.path.join(".") : "form";
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      if (nextErrors.company || nextErrors.name || nextErrors.phone || nextErrors.email) {
        setEditingSaved(true);
      }
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
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setStatus("error");
        setServerMessage(data.error || "Unable to submit your sample request right now.");
        return;
      }

      saveContact({
        leadId: data.referenceId || savedContact.leadId,
        name,
        phone,
        company,
        email,
      });

      const formattedAddress = [
        addressLine1,
        addressLine2,
        city,
        `${stateRegion} ${postalCode}`.trim(),
        country,
      ]
        .filter(Boolean)
        .join(", ");

      setSubmittedSummary({
        grade: selectedGrade,
        productType,
        address: formattedAddress,
      });
      setStatus("success");
      setReferenceId(data.referenceId || "");
      setServerMessage(
        data.message ||
          "Thank you for your interest in EastField India. Our team will review your request and get in touch with you."
      );
      setDetails("");
      setFormStartedAt(Date.now());
    } catch {
      setStatus("error");
      setServerMessage("A network error occurred. Please check your connection and try again.");
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

  const hasAddressPreview = Boolean(addressLine1 || city || stateRegion || postalCode || country);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/75 p-3 sm:p-4 backdrop-blur-xs"
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
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-white/10 bg-forest-900 px-6 py-5 text-ivory-100">
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

        <div className="p-5 sm:p-7">
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
                Sample Request Submitted
              </h3>
              {referenceId && (
                <p className="mt-2 inline-block rounded-full bg-ivory-200 px-3.5 py-1 font-mono text-xs font-semibold text-forest-900">
                  Reference: {referenceId}
                </p>
              )}
              {submittedSummary && (
                <div className="mx-auto mt-4 max-w-md rounded-xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-left text-xs text-forest-900">
                  <p className="font-bold tracking-wider text-gold-600 uppercase">Sample Requested</p>
                  <p className="mt-1">Grade: {submittedSummary.grade}</p>
                  <p className="mt-0.5">Product Type: {submittedSummary.productType}</p>
                  <p className="mt-1.5 text-ink-600">
                    <span className="font-semibold text-forest-900">Shipping To: </span>
                    {submittedSummary.address}
                  </p>
                </div>
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
                    setSubmittedSummary(null);
                  }}
                  className="rounded-full border border-forest-800/25 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-forest-900 uppercase hover:bg-ivory-200"
                >
                  Request Another Sample
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

              {/* 1. Customer Details */}
              <div className="rounded-xl border border-ivory-300 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold tracking-[0.14em] text-forest-900 uppercase">
                    Customer Details
                  </p>
                  {!editingSaved && (
                    <button
                      type="button"
                      onClick={() => setEditingSaved(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-gold-600"
                    >
                      <Edit3 className="h-3 w-3" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {!editingSaved ? (
                  <div className="mt-2.5 rounded-lg border border-ivory-200 bg-ivory-50 px-3.5 py-2.5 text-xs text-ink-800">
                    <p className="font-semibold text-forest-900">
                      {name} · {company}
                    </p>
                    <p className="mt-0.5 text-ink-600">
                      {phone} · {email}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                        placeholder="Your full name"
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

              {/* 2. Product Specification */}
              <div className="mt-4 rounded-xl border border-ivory-300 bg-white p-4 sm:p-5">
                <p className="text-xs font-bold tracking-[0.14em] text-forest-900 uppercase">
                  Product Specification
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sample-grade"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Desired Makhana Grade <span className="text-red-700">*</span>
                    </label>
                    <select
                      id="sample-grade"
                      name="desiredGrade"
                      required
                      value={selectedGrade}
                      onChange={(e) => {
                        setSelectedGrade(e.target.value as SampleGradeOption | "");
                        clearFieldError("desiredGrade");
                      }}
                      aria-invalid={Boolean(fieldErrors.desiredGrade)}
                      className={`${inputClass} ${
                        fieldErrors.desiredGrade ? "border-red-500" : "border-ivory-300"
                      }`}
                    >
                      <option value="">Select your desired grade</option>
                      {SAMPLE_GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.desiredGrade && (
                      <p className="mt-1 text-xs text-red-700">{fieldErrors.desiredGrade}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sample-product-type"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Product Type <span className="text-red-700">*</span>
                    </label>
                    <select
                      id="sample-product-type"
                      name="productType"
                      required
                      value={productType}
                      onChange={(e) => {
                        setProductType(e.target.value as SampleProductTypeOption | "");
                        clearFieldError("productType");
                      }}
                      aria-invalid={Boolean(fieldErrors.productType)}
                      className={`${inputClass} ${
                        fieldErrors.productType ? "border-red-500" : "border-ivory-300"
                      }`}
                    >
                      <option value="">Select product type</option>
                      {SAMPLE_PRODUCT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.productType && (
                      <p className="mt-1 text-xs text-red-700">{fieldErrors.productType}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Structured Shipping Details */}
              <div className="mt-4 rounded-xl border border-ivory-300 bg-white p-4 sm:p-5">
                <p className="text-xs font-bold tracking-[0.14em] text-forest-900 uppercase">
                  Shipping Details
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="shipping-address-line-1"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Address Line 1 <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="shipping-address-line-1"
                      name="addressLine1"
                      type="text"
                      required
                      autoComplete="address-line1"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        clearFieldError("shippingAddress.addressLine1");
                      }}
                      aria-invalid={Boolean(fieldErrors["shippingAddress.addressLine1"])}
                      placeholder="House/building number, street, or primary address"
                      className={`${inputClass} ${
                        fieldErrors["shippingAddress.addressLine1"]
                          ? "border-red-500"
                          : "border-ivory-300"
                      }`}
                    />
                    {fieldErrors["shippingAddress.addressLine1"] && (
                      <p className="mt-1 text-xs text-red-700">
                        {fieldErrors["shippingAddress.addressLine1"]}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="shipping-address-line-2"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Address Line 2{" "}
                      <span className="font-normal text-ink-500">(Optional)</span>
                    </label>
                    <input
                      id="shipping-address-line-2"
                      name="addressLine2"
                      type="text"
                      autoComplete="address-line2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apartment, suite, floor, landmark, or locality"
                      className={`${inputClass} border-ivory-300`}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="shipping-city"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      City <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="shipping-city"
                      name="city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        clearFieldError("shippingAddress.city");
                      }}
                      aria-invalid={Boolean(fieldErrors["shippingAddress.city"])}
                      placeholder="City"
                      className={`${inputClass} ${
                        fieldErrors["shippingAddress.city"] ? "border-red-500" : "border-ivory-300"
                      }`}
                    />
                    {fieldErrors["shippingAddress.city"] && (
                      <p className="mt-1 text-xs text-red-700">
                        {fieldErrors["shippingAddress.city"]}
                      </p>
                    )}
                  </div>

                  {/* State / Province / Region */}
                  <div>
                    <label
                      htmlFor="shipping-state"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      State / Province / Region <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="shipping-state"
                      name="state"
                      type="text"
                      required
                      autoComplete="address-level1"
                      value={stateRegion}
                      onChange={(e) => {
                        setStateRegion(e.target.value);
                        clearFieldError("shippingAddress.state");
                      }}
                      aria-invalid={Boolean(fieldErrors["shippingAddress.state"])}
                      placeholder="State, province, or region"
                      className={`${inputClass} ${
                        fieldErrors["shippingAddress.state"] ? "border-red-500" : "border-ivory-300"
                      }`}
                    />
                    {fieldErrors["shippingAddress.state"] && (
                      <p className="mt-1 text-xs text-red-700">
                        {fieldErrors["shippingAddress.state"]}
                      </p>
                    )}
                  </div>

                  {/* Postal Code / PIN Code */}
                  <div>
                    <label
                      htmlFor="shipping-postal-code"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Postal Code / PIN Code <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="shipping-postal-code"
                      name="postalCode"
                      type="text"
                      required
                      autoComplete="postal-code"
                      inputMode={country === "India" ? "numeric" : "text"}
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        clearFieldError("shippingAddress.postalCode");
                      }}
                      aria-invalid={Boolean(fieldErrors["shippingAddress.postalCode"])}
                      placeholder={country === "India" ? "e.g., 854301" : "Postal / ZIP / PIN code"}
                      className={`${inputClass} ${
                        fieldErrors["shippingAddress.postalCode"]
                          ? "border-red-500"
                          : "border-ivory-300"
                      }`}
                    />
                    {fieldErrors["shippingAddress.postalCode"] && (
                      <p className="mt-1 text-xs text-red-700">
                        {fieldErrors["shippingAddress.postalCode"]}
                      </p>
                    )}
                  </div>

                  {/* Country (Searchable Dropdown) */}
                  <div>
                    <label
                      htmlFor="shipping-country"
                      className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                    >
                      Country <span className="text-red-700">*</span>
                    </label>
                    <CountryCombobox
                      id="shipping-country"
                      value={country}
                      hasError={Boolean(fieldErrors["shippingAddress.country"])}
                      errorId={
                        fieldErrors["shippingAddress.country"] ? "err-shipping-country" : undefined
                      }
                      onChange={(nextCountry) => {
                        setCountry(nextCountry);
                        clearFieldError("shippingAddress.country");
                        clearFieldError("shippingAddress.postalCode");
                      }}
                    />
                    {fieldErrors["shippingAddress.country"] && (
                      <p id="err-shipping-country" className="mt-1 text-xs text-red-700">
                        {fieldErrors["shippingAddress.country"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Additional Information + Pre-Submission Summary */}
              <div className="mt-4 rounded-xl border border-ivory-300 bg-white p-4 sm:p-5">
                <label
                  htmlFor="sample-details"
                  className="block text-xs font-semibold tracking-wide text-forest-900 uppercase"
                >
                  Additional Requirements{" "}
                  <span className="font-normal text-ink-500">(Optional)</span>
                </label>
                <textarea
                  id="sample-details"
                  name="details"
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Sample pack weight preference, intended application, or quality notes..."
                  className={`${inputClass} border-ivory-300`}
                />

                {(selectedGrade || productType || hasAddressPreview) && (
                  <div
                    aria-label="Sample selection summary"
                    className="mt-4 rounded-xl border border-gold-500/35 bg-ivory-50 px-4 py-3 text-xs text-forest-900"
                  >
                    <p className="font-bold tracking-wider text-gold-600 uppercase">
                      Sample Requested
                    </p>
                    <ul className="mt-1.5 space-y-0.5 font-medium">
                      <li>Grade: {selectedGrade || "Not selected yet"}</li>
                      <li>Product Type: {productType || "Not selected yet"}</li>
                      {hasAddressPreview && (
                        <li className="text-ink-700">
                          Ship To:{" "}
                          {[
                            addressLine1,
                            addressLine2,
                            city,
                            `${stateRegion} ${postalCode}`.trim(),
                            country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs text-ink-600">
                  Our team will review sample availability and get in touch with you.
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
                      <span>REQUEST A SAMPLE</span>
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
