import React from "react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { WelcomeLeadModal } from "@/components/forms/WelcomeLeadModal";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { HeroSection } from "@/components/hero/HeroSection";

describe("Entry Welcome Modal & Gated Sample Flow (Visitors A, B, C)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows Welcome modal shortly after entry, allows Skip for now, and gates Request a Sample until 4 details are submitted", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      const body = JSON.parse(String(init?.body || "{}")) as { requestType?: string };
      if (body.requestType === "entry_lead") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            referenceId: "EF-20261127-GATE01",
            message: "Thank you. Your business contact details have been saved.",
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          ok: true,
          referenceId: "EF-20261127-GATE01",
          message:
            "Thank you for your interest in EastField India. Our team will review your request and get in touch with you.",
        }),
      } as Response;
    });

    render(
      <InquiryProvider>
        <HeroSection />
        <WelcomeLeadModal />
        <SampleRequestModal />
      </InquiryProvider>
    );

    // Appears shortly after entering website
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByRole("heading", { name: /Welcome to EastField India/i })).toBeInTheDocument();

    // Visitor B skips the welcome popup
    fireEvent.click(screen.getByRole("button", { name: /Skip for now/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Visitor B clicks Request a Sample -> initial 4-field gate appears first
    fireEvent.click(screen.getByRole("button", { name: /Request a Sample/i }));
    expect(
      screen.getByText(/Please share these four business contact details first/i)
    ).toBeInTheDocument();

    // Fill 4 required details and advance straight to sample request
    vi.useRealTimers();
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Priya Nair" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), {
      target: { value: "+971 50 123 4567" },
    });
    fireEvent.change(screen.getByLabelText(/Company Name/i), {
      target: { value: "Lotus Exports" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "priya@lotusexports.ae" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue to Sample Request/i }));

    // Now SampleRequestModal opens with saved details pre-filled
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^Request a Sample$/i })).toBeInTheDocument();
      expect(screen.getByText(/Priya Nair · Lotus Exports/i)).toBeInTheDocument();
    });

    // Select Desired Makhana Grade and Product Type before submitting
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Desired Makhana Grade/i), {
      target: { value: "5+ Suta" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Product Type/i), {
      target: { value: "Handpicked" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Thank you for your interest in EastField India\. Our team will review your request and get in touch with you\./i
        )
      ).toBeInTheDocument();
    });
  });
});
