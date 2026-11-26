"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { ProductGradeOption } from "@/validations/inquiry";
import { useSessionContact, type SessionBusinessContact } from "@/hooks/useSessionContact";

export type GradeOption = ProductGradeOption;

interface InquiryPresetState {
  isSampleModalOpen: boolean;
  selectedGrade: GradeOption;
  savedContact: SessionBusinessContact;
  hasSavedContact: boolean;
  setSelectedGrade: (grade: GradeOption) => void;
  saveContact: (contact: SessionBusinessContact) => void;
  clearContact: () => void;
  openSampleRequest: (grade?: GradeOption) => void;
  closeSampleModal: () => void;
  scrollToEnquiry: () => void;
}

const InquiryContext = createContext<InquiryPresetState | null>(null);

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeOption>("Not sure");
  const { savedContact, hasSavedContact, saveContact, clearContact } = useSessionContact();

  const openSampleRequest = useCallback((grade?: GradeOption) => {
    if (grade) {
      setSelectedGrade(grade);
    }
    setIsSampleModalOpen(true);
  }, []);

  const closeSampleModal = useCallback(() => {
    setIsSampleModalOpen(false);
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
        isSampleModalOpen,
        selectedGrade,
        savedContact,
        hasSavedContact,
        setSelectedGrade,
        saveContact,
        clearContact,
        openSampleRequest,
        closeSampleModal,
        scrollToEnquiry,
      }}
    >
      {children}
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
