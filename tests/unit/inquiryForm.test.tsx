import React from "react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { InquiryFormSection } from "@/components/forms/InquiryFormSection";

describe("InquiryFormSection (minimal 4-field General Business Enquiry)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays EastField India GSTIN and minimal 4-field enquiry form", () => {
    render(
      <InquiryProvider>
        <InquiryFormSection />
      </InquiryProvider>
    );

    expect(screen.getByText("10BIPPA9997L1ZM")).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Enquiry/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    render(
      <InquiryProvider>
        <InquiryFormSection />
      </InquiryProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit Enquiry/i }));

    expect(
      await screen.findByText(/Please complete the highlighted business and contact fields/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
  });

  it("submits minimal enquiry, saves session contact, and displays confirmation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        referenceId: "EF-20261127-LEAD01",
        message: "Thank you. Your business enquiry has been received.",
      }),
    } as Response);

    render(
      <InquiryProvider>
        <InquiryFormSection />
      </InquiryProvider>
    );

    fireEvent.change(screen.getByLabelText(/Company Name/i), {
      target: { value: "Verma Foods" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Rohan Verma" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), {
      target: { value: "+91 98100 12345" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "rohan@vermafoods.in" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit Enquiry/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enquiry Received/i)).toBeInTheDocument();
      expect(screen.getByText(/EF-20261127-LEAD01/)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem("eastfield_session_contact_v1")).toContain("Verma Foods");
  });
});
