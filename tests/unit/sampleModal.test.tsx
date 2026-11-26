import React from "react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InquiryProvider, useInquiryPreset } from "@/components/ui/InquiryContext";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";

function PreseededTrigger() {
  const { openSampleRequest, saveContact } = useInquiryPreset();
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          saveContact({
            leadId: "EF-20261127-PRE001",
            name: "Priya Nair",
            phone: "+971 50 123 4567",
            company: "Lotus Exports",
            email: "priya@lotusexports.ae",
          })
        }
      >
        Seed Lead
      </button>
      <button type="button" onClick={() => openSampleRequest("6 Suta")}>
        Open Sample
      </button>
    </div>
  );
}

describe("SampleRequestModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens directly with prefilled details when visitor already submitted initial lead", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        referenceId: "EF-20261127-PRE001",
        message:
          "Thank you for your interest in EastField India. Our team will review your request and get in touch with you.",
      }),
    } as Response);

    render(
      <InquiryProvider disableAutoEntryPopup>
        <PreseededTrigger />
        <SampleRequestModal />
      </InquiryProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Seed Lead/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open Sample/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText(/Priya Nair · Lotus Exports/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Makhana Grade/i)).toHaveValue("6 Suta");

    fireEvent.change(screen.getByLabelText(/Shipping Destination/i), {
      target: { value: "Dubai, UAE" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/EF-20261127-PRE001/)).toBeInTheDocument();
    });
  });
});
