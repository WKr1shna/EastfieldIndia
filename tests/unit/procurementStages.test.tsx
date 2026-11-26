import React from "react";
import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { ProcurementSection } from "@/components/sections/ProcurementSection";

describe("ProcurementSection 4-card phase labels", () => {
  it("groups Steps 01–04 under STAGE 01 UNDERSTAND, STAGE 02 SOURCE & VERIFY (2 cards), and STAGE 03 SUPPLY", () => {
    const { container } = render(
      <InquiryProvider>
        <ProcurementSection />
      </InquiryProvider>
    );

    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    const cards = Array.from(list!.querySelectorAll("li"));
    expect(cards).toHaveLength(4);

    const expected = [
      { step: "01", stage: "STAGE 01", phase: "UNDERSTAND", title: "SHARE THE BRIEF" },
      { step: "02", stage: "STAGE 02", phase: "SOURCE & VERIFY", title: "SOURCE & EVALUATE SAMPLE" },
      { step: "03", stage: "STAGE 02", phase: "SOURCE & VERIFY", title: "CONFIRM & VERIFY THE LOT" },
      { step: "04", stage: "STAGE 03", phase: "SUPPLY", title: "DISPATCH & REPLENISH" },
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
