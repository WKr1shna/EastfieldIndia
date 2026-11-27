"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SAMPLE_GRADES, type SampleGradeOption } from "@/validations/inquiry";
import {
  useSessionContact,
  type SessionBusinessContact,
  type VisitorLeadState,
} from "@/hooks/useSessionContact";
import { SubmissionSuccessModal } from "@/components/ui/SubmissionSuccessModal";

export type GradeOption = SampleGradeOption | "";
export type WelcomeModalMode = "closed" | "entry" | "sample_gate";

export interface SubmissionSuccessSummaryItem {
  label: string;
  value: string;
}

export interface SubmissionSuccessPayload {
  variant: "welcome_lead" | "sample_request" | "general_enquiry";
  title: string;
  message: string;
  referenceId?: string;
  badgeLabel?: string;
  summaryTitle?: string;
  summaryItems?: SubmissionSuccessSummaryItem[];
  primaryButtonLabel?: string;
}

interface InquiryPresetState {
  welcomeModalMode: WelcomeModalMode;
  isSampleModalOpen: boolean;
  selectedGrade: GradeOption;
  visitorState: VisitorLeadState;
  savedContact: SessionBusinessContact;
  hasSavedContact: boolean;
  submissionSuccess: SubmissionSuccessPayload | null;
  setSelectedGrade: (grade: GradeOption) => void;
  saveContact: (
    contact: Omit<SessionBusinessContact, "leadId"> & { leadId?: string }
  ) => void;
  markSkippedInitial: () => void;
  clearContact: () => void;
  closeWelcomeModal: (skipped?: boolean) => void;
  completeWelcomeForSampleGate: () => void;
  openSampleRequest: (grade?: string) => void;
  closeSampleModal: () => void;
  showSubmissionSuccess: (payload: SubmissionSuccessPayload) => void;
  closeSubmissionSuccess: () => void;
  scrollToEnquiry: () => void;
}

const InquiryContext = createContext<InquiryPresetState | null>(null);

function normalizeSampleGrade(grade?: string): GradeOption {
  if (!grade) return "";
  return (SAMPLE_GRADES as readonly string[]).includes(grade)
    ? (grade as SampleGradeOption)
    : "";
}

export function InquiryProvider({
  children,
  disableAutoEntryPopup = false,
}: {
  children: React.ReactNode;
  disableAutoEntryPopup?: boolean;
}) {
  const [welcomeModalMode, setWelcomeModalMode] = useState<WelcomeModalMode>("closed");
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeOption>("");
  const [submissionSuccess, setSubmissionSuccess] = useState<SubmissionSuccessPayload | null>(null);
  const {
    visitorState,
    savedContact,
    hasSavedContact,
    saveContact,
    markSkippedInitial,
    clearContact,
  } = useSessionContact();

  useEffect(() => {
    if (disableAutoEntryPopup) return;
    if (visitorState.skippedInitial || visitorState.submittedLead) return;

    const timer = window.setTimeout(() => {
      setWelcomeModalMode((prev) => (prev === "closed" ? "entry" : prev));
    }, 550);

    return () => window.clearTimeout(timer);
  }, [disableAutoEntryPopup, visitorState.skippedInitial, visitorState.submittedLead]);

  const closeWelcomeModal = useCallback(
    (skipped = true) => {
      if (skipped) {
        markSkippedInitial();
      }
      setWelcomeModalMode("closed");
    },
    [markSkippedInitial]
  );

  const completeWelcomeForSampleGate = useCallback(() => {
    setWelcomeModalMode("closed");
    setIsSampleModalOpen(true);
  }, []);

  const openSampleRequest = useCallback(
    (grade?: string) => {
      setSubmissionSuccess(null);
      if (grade !== undefined) {
        setSelectedGrade(normalizeSampleGrade(grade));
      }
      if (hasSavedContact) {
        setWelcomeModalMode("closed");
        setIsSampleModalOpen(true);
      } else {
        setIsSampleModalOpen(false);
        setWelcomeModalMode("sample_gate");
      }
    },
    [hasSavedContact]
  );

  const closeSampleModal = useCallback(() => {
    setIsSampleModalOpen(false);
  }, []);

  const showSubmissionSuccess = useCallback((payload: SubmissionSuccessPayload) => {
    setSubmissionSuccess(payload);
  }, []);

  const closeSubmissionSuccess = useCallback(() => {
    setSubmissionSuccess(null);
  }, []);

  const scrollToEnquiry = useCallback(() => {
    if (typeof document === "undefined") return;
    const el = document.getElementById("inquiry");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <InquiryContext.Provider
      value={{
        welcomeModalMode,
        isSampleModalOpen,
        selectedGrade,
        visitorState,
        savedContact,
        hasSavedContact,
        submissionSuccess,
        setSelectedGrade,
        saveContact,
        markSkippedInitial,
        clearContact,
        closeWelcomeModal,
        completeWelcomeForSampleGate,
        openSampleRequest,
        closeSampleModal,
        showSubmissionSuccess,
        closeSubmissionSuccess,
        scrollToEnquiry,
      }}
    >
      {children}
      <SubmissionSuccessModal />
    </InquiryContext.Provider>
  );
}

export function useInquiryPreset() {
  const ctx = useContext(InquiryContext);
  if (!ctx) {
    throw new Error("useInquiryPreset must be used within InquiryProvider");
  }
  return ctx;
}
