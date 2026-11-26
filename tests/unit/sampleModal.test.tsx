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
      <button type="button" onClick={() => openSampleRequest()}>
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

  it("renders Desired Makhana Grade and Product Type dropdowns, summary, and submits cleanly", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
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

    const gradeSelect = screen.getByLabelText(/Desired Makhana Grade/i);
    const typeSelect = screen.getByLabelText(/Product Type/i);
    expect(gradeSelect).toHaveValue("");
    expect(typeSelect).toHaveValue("");

    fireEvent.change(gradeSelect, { target: { value: "5+ Suta" } });
    fireEvent.change(typeSelect, { target: { value: "Handpicked" } });

    expect(screen.getByText(/Sample Requested/i)).toBeInTheDocument();
    expect(screen.getByText(/Grade: 5\+ Suta/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Type: Handpicked/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/EF-20261127-PRE001/)).toBeInTheDocument();
    });

    const sentBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as Record<
      string,
      unknown
    >;
    expect(sentBody.desiredGrade).toBe("5+ Suta");
    expect(sentBody.productType).toBe("Handpicked");
  });
});
