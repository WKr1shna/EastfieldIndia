"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { BUYER_TYPES, InquiryMode, PRODUCT_GRADES } from "@/validations/inquiry";

export type BuyerTypeOption = (typeof BUYER_TYPES)[number];
export type GradeOption = (typeof PRODUCT_GRADES)[number];

interface InquiryPresetState {
  requestMode: InquiryMode;
  selectedGrade: GradeOption | "";
  selectedBuyerType: BuyerTypeOption | "";
  setRequestMode: (mode: InquiryMode) => void;
  setSelectedGrade: (grade: GradeOption | "") => void;
  setSelectedBuyerType: (buyerType: BuyerTypeOption | "") => void;
  requestWithGrade: (grade: GradeOption, mode?: InquiryMode) => void;
  requestWithBuyerType: (buyerType: BuyerTypeOption, mode?: InquiryMode) => void;
  openSampleRequest: (grade?: GradeOption) => void;
}

const InquiryContext = createContext<InquiryPresetState | null>(null);

function scrollToInquiry() {
  if (typeof document === "undefined") return;
  const el = document.getElementById("inquiry");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [requestMode, setRequestMode] = useState<InquiryMode>("sample");
  const [selectedGrade, setSelectedGrade] = useState<GradeOption | "">("");
  const [selectedBuyerType, setSelectedBuyerType] = useState<BuyerTypeOption | "">("");

  const requestWithGrade = useCallback((grade: GradeOption, mode: InquiryMode = "sample") => {
    setRequestMode(mode);
    setSelectedGrade(grade);
    scrollToInquiry();
  }, []);

  const requestWithBuyerType = useCallback(
    (buyerType: BuyerTypeOption, mode: InquiryMode = "sample") => {
      setRequestMode(mode);
      setSelectedBuyerType(buyerType);
      scrollToInquiry();
    },
    []
  );

  const openSampleRequest = useCallback((grade?: GradeOption) => {
    setRequestMode("sample");
    if (grade) {
      setSelectedGrade(grade);
    }
    scrollToInquiry();
  }, []);

  return (
    <InquiryContext.Provider
      value={{
        requestMode,
        selectedGrade,
        selectedBuyerType,
        setRequestMode,
        setSelectedGrade,
        setSelectedBuyerType,
        requestWithGrade,
        requestWithBuyerType,
        openSampleRequest,
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
