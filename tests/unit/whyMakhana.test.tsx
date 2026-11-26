import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { WhyMakhanaSection } from "@/components/sections/WhyMakhanaSection";
import { HELD_CLIENT_CLAIMS_PENDING_SUBSTANTIATION } from "@/features/products/nutrition";

describe("WhyMakhanaSection poster & compliance", () => {
  it("renders WHY MAKHANA?, GUILT-FREE. GLUTEN-FREE., and all poster benefit statements", () => {
    render(
      <InquiryProvider>
        <WhyMakhanaSection />
      </InquiryProvider>
    );

    expect(screen.getByRole("heading", { name: /WHY MAKHANA\?/i })).toBeInTheDocument();
    expect(screen.getByText(/GUILT-FREE\. GLUTEN-FREE\./i)).toBeInTheDocument();

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
    ];

    for (const statement of expectedStatements) {
      expect(screen.getAllByText(statement).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not publish unsubstantiated medical claims as public facts", () => {
    const { container } = render(
      <InquiryProvider>
        <WhyMakhanaSection />
      </InquiryProvider>
    );

    const text = container.textContent ?? "";
    for (const withheldClaim of HELD_CLIENT_CLAIMS_PENDING_SUBSTANTIATION) {
      expect(text.toLowerCase()).not.toContain(withheldClaim.toLowerCase());
    }
  });
});
