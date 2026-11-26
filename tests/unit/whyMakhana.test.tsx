import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { WhyMakhanaSection } from "@/components/sections/WhyMakhanaSection";
import { HELD_CLIENT_CLAIMS_PENDING_SUBSTANTIATION } from "@/features/products/nutrition";

describe("WhyMakhanaSection poster, nutritional highlights & compliance", () => {
  it("renders WHY MAKHANA?, GUILT-FREE. GLUTEN-FREE., all poster statements, and 5 new nutritional highlights", () => {
    render(
      <InquiryProvider disableAutoEntryPopup>
        <WhyMakhanaSection />
      </InquiryProvider>
    );

    expect(screen.getByRole("heading", { name: /WHY MAKHANA\?/i })).toBeInTheDocument();
    expect(screen.getAllByText(/GUILT-FREE\. GLUTEN-FREE\./i).length).toBeGreaterThanOrEqual(1);

    const expectedStatements = [
      "SUPPORTS HEART HEALTH",
      "SUPPORTS DIGESTIVE HEALTH",
      "RICH IN ANTIOXIDANTS",
      "SUPPORTS BONE HEALTH",
      "SOURCE OF PLANT-BASED NUTRIENTS",
      "SUPPORTS WEIGHT MANAGEMENT",
      "A SATISFYING, CRUNCHY SNACK",
      "NUTRIENT-RICH",
      "TRADITIONAL INDIAN SUPERFOOD",
      "ESSENTIAL & NON-ESSENTIAL AMINO ACIDS",
      "HISTIDINE-RICH",
      "NUTRITION THAT SUPPORTS IMMUNITY",
      "RICH AMINO ACID PROFILE",
      "LOW GLYCEMIC INDEX",
    ];

    for (const statement of expectedStatements) {
      expect(screen.getAllByText(statement).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not publish unsubstantiated medical claims as public facts", () => {
    const { container } = render(
      <InquiryProvider disableAutoEntryPopup>
        <WhyMakhanaSection />
      </InquiryProvider>
    );

    const text = container.textContent ?? "";
    for (const withheldClaim of HELD_CLIENT_CLAIMS_PENDING_SUBSTANTIATION) {
      expect(text.toLowerCase()).not.toContain(withheldClaim.toLowerCase());
    }
    expect(text.toLowerCase()).not.toContain("treats diabetes");
    expect(text.toLowerCase()).not.toContain("prevents diabetes");
  });
});
