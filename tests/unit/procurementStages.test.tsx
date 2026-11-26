import React from "react";
import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { ProcurementSection } from "@/components/sections/ProcurementSection";

describe("ProcurementSection 6-card phase labels", () => {
  it("groups Steps 01–06 under STAGE 01 UNDERSTAND, STAGE 02 SOURCE & VERIFY, and STAGE 03 SUPPLY", () => {
    const { container } = render(
      <InquiryProvider>
        <ProcurementSection />
      </InquiryProvider>
    );

    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    const cards = Array.from(list!.querySelectorAll("li"));
    expect(cards).toHaveLength(6);

    const expected = [
      { step: "01", stage: "STAGE 01", phase: "UNDERSTAND", title: "SHARE THE BRIEF" },
      { step: "02", stage: "STAGE 02", phase: "SOURCE & VERIFY", title: "CHECK AVAILABILITY" },
      { step: "03", stage: "STAGE 02", phase: "SOURCE & VERIFY", title: "EVALUATE THE SAMPLE" },
      { step: "04", stage: "STAGE 02", phase: "SOURCE & VERIFY", title: "CONFIRM THE LOT" },
      { step: "05", stage: "STAGE 02", phase: "SOURCE & VERIFY", title: "AGGREGATE & VERIFY" },
      { step: "06", stage: "STAGE 03", phase: "SUPPLY", title: "DISPATCH & REPLENISH" },
    ];

    cards.forEach((card, idx) => {
      const exp = expected[idx];
      const scoped = within(card as HTMLElement);
      expect(scoped.getByText(exp.step)).toBeInTheDocument();
      expect(scoped.getByText(exp.stage)).toBeInTheDocument();
      expect(scoped.getByText(exp.phase)).toBeInTheDocument();
      expect(scoped.getByText(exp.title)).toBeInTheDocument();
    });
  });
});
