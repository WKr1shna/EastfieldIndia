import React from "react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InquiryProvider, useInquiryPreset } from "@/components/ui/InquiryContext";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";

function TriggerButton() {
  const { openSampleRequest } = useInquiryPreset();
  return (
    <button type="button" onClick={() => openSampleRequest("6 Suta")}>
      Open Sample
    </button>
  );
}

describe("SampleRequestModal", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens when triggered, enforces 4 mandatory contact fields, and reuses session details", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        referenceId: "EF-20261127-SMP101",
        message: "Sample request logged.",
      }),
    } as Response);

    render(
      <InquiryProvider>
        <TriggerButton />
        <SampleRequestModal />
      </InquiryProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Open Sample/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/Desired Makhana Grade/i)).toHaveValue("6 Suta");

    // Empty submit fails on mandatory 4 fields
    fireEvent.click(screen.getByRole("button", { name: /Request a Sample/i }));
    expect(
      await screen.findByText(/Please provide the mandatory business and contact details/i)
    ).toBeInTheDocument();

    // Fill 4 mandatory fields and submit
    fireEvent.change(screen.getByLabelText(/Company Name/i), {
      target: { value: "Lotus Exports" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Priya Nair" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), {
      target: { value: "+971 50 123 4567" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "priya@lotusexports.ae" },
    });
    fireEvent.change(screen.getByLabelText(/Shipping Destination/i), {
      target: { value: "Dubai, UAE" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Request a Sample/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Received/i)).toBeInTheDocument();
      expect(screen.getByText(/EF-20261127-SMP101/)).toBeInTheDocument();
    });

    // Request another grade in same session reuses saved details automatically
    fireEvent.click(screen.getByRole("button", { name: /Request Another Grade/i }));
    expect(await screen.findByText(/Reusing details from this session/i)).toBeInTheDocument();
  });
});
