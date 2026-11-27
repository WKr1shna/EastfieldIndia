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

    // Select Desired Makhana Grade, Product Type, and Shipping Address before submitting
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Desired Makhana Grade/i), {
      target: { value: "5+ Suta" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Product Type/i), {
      target: { value: "Handpicked" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Address Line 1/i), {
      target: { value: "Plot 14, Industrial Area" },
    });
    fireEvent.change(within(dialog).getByLabelText(/^City/i), {
      target: { value: "Purnea" },
    });
    fireEvent.change(within(dialog).getByLabelText(/State \/ Province \/ Region/i), {
      target: { value: "Bihar" },
    });
    const countryInput = within(dialog).getByLabelText(/^Country/i);
    fireEvent.focus(countryInput);
    fireEvent.change(countryInput, { target: { value: "India" } });
    fireEvent.mouseDown(within(dialog).getByRole("option", { name: "India" }));
    fireEvent.change(within(dialog).getByLabelText(/Postal Code \/ PIN Code/i), {
      target: { value: "854301" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Received!/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Your sample request has been successfully submitted\. Our team will review your requirements and contact you shortly\./i
        )
      ).toBeInTheDocument();
    });

    // Does NOT display success popup if backend persistence fails
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        ok: false,
        error: "We could not save your submission right now. Please try again shortly.",
      }),
    } as Response);

    fireEvent.click(screen.getByRole("button", { name: /^Done$/i }));
    fireEvent.click(screen.getByRole("button", { name: /Request a Sample/i }));
    const retryDialog = await screen.findByRole("dialog");
    fireEvent.change(within(retryDialog).getByLabelText(/Desired Makhana Grade/i), {
      target: { value: "6 Suta" },
    });
    fireEvent.change(within(retryDialog).getByLabelText(/Product Type/i), {
      target: { value: "Regular" },
    });
    fireEvent.change(within(retryDialog).getByLabelText(/Address Line 1/i), {
      target: { value: "99 Retry Road" },
    });
    fireEvent.change(within(retryDialog).getByLabelText(/^City/i), {
      target: { value: "Patna" },
    });
    fireEvent.change(within(retryDialog).getByLabelText(/State \/ Province \/ Region/i), {
      target: { value: "Bihar" },
    });
    fireEvent.change(within(retryDialog).getByLabelText(/^Country/i), {
      target: { value: "India" },
    });
    fireEvent.change(within(retryDialog).getByLabelText(/Postal Code \/ PIN Code/i), {
      target: { value: "800001" },
    });
    fireEvent.click(within(retryDialog).getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    expect(
      await screen.findByText(/We could not save your submission right now/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sample Request Received!/i)).not.toBeInTheDocument();
    expect(within(retryDialog).getByLabelText(/Address Line 1/i)).toHaveValue("99 Retry Road");
  });

  it("closes Welcome popup and shows Thank You! global success popup when entry details succeed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        referenceId: "EF-20261127-WEL01",
        delivery: { persisted: true },
      }),
    } as Response);

    render(
      <InquiryProvider>
        <HeroSection />
        <WelcomeLeadModal />
      </InquiryProvider>
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByRole("heading", { name: /Welcome to EastField India/i })).toBeInTheDocument();

    vi.useRealTimers();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Aarav Singh" } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: "+91 98111 55566" } });
    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: "Mithila Traders" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "aarav@mithilatraders.in" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit Details/i }));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /Welcome to EastField India/i })).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Thank You!/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Your details have been received\. Welcome to EastField India\./i)
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue Exploring/i }));
    expect(screen.queryByRole("heading", { name: /Thank You!/i })).not.toBeInTheDocument();
  });
});
