import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import HomePage from "@/app/page";

describe("HomePage narrative section order", () => {
  it("places Founder Story immediately below Procurement Process and before Request a Sample CTA", () => {
    const { container } = render(
      <InquiryProvider disableAutoEntryPopup>
        <HomePage />
      </InquiryProvider>
    );

    const sections = Array.from(container.querySelectorAll("main > section")).map((el) => el.id);

    expect(sections).toEqual([
      "home",
      "about",
      "sourcing",
      "why-makhana",
      "makhana",
      "buyers",
      "quality",
      "procurement",
      "founder",
      "inquiry",
    ]);
  });
});
