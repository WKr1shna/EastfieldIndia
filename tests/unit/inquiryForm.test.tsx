import React from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InquiryProvider } from "@/components/ui/InquiryContext";
import { InquiryFormSection } from "@/components/forms/InquiryFormSection";

describe("InquiryFormSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays EastField India GSTIN and Request a Sample mode by default", () => {
    render(
      <InquiryProvider>
        <InquiryFormSection />
      </InquiryProvider>
    );

    expect(screen.getByText("10BIPPA9997L1ZM")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request a Sample/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    render(
      <InquiryProvider>
        <InquiryFormSection />
      </InquiryProvider>
    );

    const submitBtn = screen.getByRole("button", { name: /Request a Sample/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Please complete the highlighted required fields/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument();
  });

  it("submits valid Request a Sample submission and renders confirmation reference", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        referenceId: "EF-20261126-SMP999",
        message: "Thank you. Sample availability will be reviewed.",
      }),
    } as Response);

    render(
      <InquiryProvider>
        <InquiryFormSection />
      </InquiryProvider>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Rohan Verma" } });
    fireEvent.change(screen.getByLabelText(/Company Name/i), {
      target: { value: "Verma Foods" },
    });
    fireEvent.change(screen.getByLabelText(/Business Email/i), {
      target: { value: "rohan@vermafoods.in" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "+91 98100 12345" },
    });
    fireEvent.change(screen.getByLabelText(/^Country/i), { target: { value: "India" } });
    fireEvent.change(screen.getByLabelText(/Buyer Type/i), { target: { value: "Wholesaler" } });
    fireEvent.change(screen.getByLabelText(/Product Grade/i), { target: { value: "5 Suta" } });
    fireEvent.change(screen.getByLabelText(/Sample Requirement/i), {
      target: { value: "500 g 5 Suta sample pack" },
    });
    fireEvent.change(screen.getByLabelText(/Intended Application/i), {
      target: { value: "Wholesale distribution" },
    });
    fireEvent.change(screen.getByLabelText(/Shipping Destination/i), {
      target: { value: "Delhi" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Request a Sample/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Received/i)).toBeInTheDocument();
      expect(screen.getByText(/EF-20261126-SMP999/)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
