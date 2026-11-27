"use client";

import React, { useEffect, useRef } from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { useInquiryPreset } from "@/components/ui/InquiryContext";

export function SubmissionSuccessModal() {
  const { submissionSuccess, closeSubmissionSuccess } = useInquiryPreset();
  const doneButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!submissionSuccess) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = window.requestAnimationFrame(() => {
      doneButtonRef.current?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSubmissionSuccess();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [submissionSuccess, closeSubmissionSuccess]);

  if (!submissionSuccess) return null;

  return (
    <div
      className="animate-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/75 p-4 backdrop-blur-xs"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSubmissionSuccess();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-success-title"
        aria-describedby="submission-success-message"
        className="animate-modal-panel relative w-full max-w-md overflow-hidden rounded-2xl border border-gold-500/45 bg-ivory-100 text-ink-900 shadow-2xl"
      >
        {/* Top Accent Header */}
        <div className="relative bg-forest-900 px-6 pb-8 pt-6 text-center text-ivory-100">
          <button
            type="button"
            onClick={closeSubmissionSuccess}
            aria-label="Close confirmation dialog"
            className="absolute right-3.5 top-3.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-ivory-200 transition-colors hover:bg-forest-800 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/50 bg-forest-800 text-gold-400 shadow-lg ring-4 ring-gold-500/20">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>

          {submissionSuccess.badgeLabel && (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-forest-950/70 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gold-400 uppercase">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>{submissionSuccess.badgeLabel}</span>
            </span>
          )}
        </div>

        {/* Body */}
        <div className="bg-ivory-50 px-6 pb-7 pt-6 text-center sm:px-8">
          <h2
            id="submission-success-title"
            className="font-serif text-2xl font-medium tracking-tight text-forest-900 sm:text-[1.7rem]"
          >
            {submissionSuccess.title}
          </h2>

          {submissionSuccess.referenceId && (
            <p className="mt-2.5 inline-block rounded-full border border-forest-800/15 bg-ivory-200 px-3.5 py-1 font-mono text-xs font-semibold text-forest-900">
              Reference: {submissionSuccess.referenceId}
            </p>
          )}

          <p
            id="submission-success-message"
            className="mx-auto mt-3.5 max-w-sm text-sm leading-relaxed text-ink-700"
          >
            {submissionSuccess.message}
          </p>

          {submissionSuccess.summaryItems && submissionSuccess.summaryItems.length > 0 && (
            <div className="mt-5 rounded-xl border border-ivory-300 bg-white px-4 py-3.5 text-left text-xs text-forest-900 shadow-2xs">
              {submissionSuccess.summaryTitle && (
                <p className="font-bold tracking-[0.14em] text-gold-600 uppercase">
                  {submissionSuccess.summaryTitle}
                </p>
              )}
              <dl className="mt-2 space-y-1">
                {submissionSuccess.summaryItems.map((item) => (
                  <div key={item.label} className="flex flex-wrap gap-x-1.5">
                    <dt className="font-semibold text-forest-900">{item.label}:</dt>
                    <dd className="text-ink-700">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6">
            <button
              ref={doneButtonRef}
              type="button"
              onClick={closeSubmissionSuccess}
              className="inline-flex w-full items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-xs font-bold tracking-[0.14em] text-gold-400 uppercase shadow-sm transition-colors hover:bg-forest-800 sm:w-auto sm:min-w-[180px]"
            >
              {submissionSuccess.primaryButtonLabel || "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
