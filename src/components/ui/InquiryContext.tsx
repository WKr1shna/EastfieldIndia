"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { BUYER_TYPES, PRODUCT_GRADES } from "@/validations/inquiry";

export type BuyerTypeOption = (typeof BUYER_TYPES)[number];
export type GradeOption = (typeof PRODUCT_GRADES)[number];

interface InquiryPresetState {
  selectedGrade: GradeOption | "";
  selectedBuyerType: BuyerTypeOption | "";
  setSelectedGrade: (grade: GradeOption | "") => void;
  setSelectedBuyerType: (buyerType: BuyerTypeOption | "") => void;
  requestWithGrade: (grade: GradeOption) => void;
  requestWithBuyerType: (buyerType: BuyerTypeOption) => void;
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
  const [selectedGrade, setSelectedGrade] = useState<GradeOption | "">("");
  const [selectedBuyerType, setSelectedBuyerType] = useState<BuyerTypeOption | "">("");

  const requestWithGrade = useCallback((grade: GradeOption) => {
    setSelectedGrade(grade);
    scrollToInquiry();
  }, []);

  const requestWithBuyerType = useCallback((buyerType: BuyerTypeOption) => {
    setSelectedBuyerType(buyerType);
    scrollToInquiry();
  }, []);

  return (
    <InquiryContext.Provider
      value={{
        selectedGrade,
        selectedBuyerType,
        setSelectedGrade,
        setSelectedBuyerType,
        requestWithGrade,
        requestWithBuyerType,
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
