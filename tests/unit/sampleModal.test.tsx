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

describe("SampleRequestModal structured address & summary", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("collects structured shipping address with searchable country dropdown, preserves values on error, and submits", async () => {
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

    // Fill address line 1 before triggering missing-field validation to confirm preservation
    fireEvent.change(screen.getByLabelText(/Address Line 1/i), {
      target: { value: "42 MG Road" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    expect(
      await screen.findByText(/Please complete the highlighted required fields/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Address Line 1/i)).toHaveValue("42 MG Road");

    // Fill specification & structured shipping address including searchable country dropdown
    fireEvent.change(screen.getByLabelText(/Desired Makhana Grade/i), {
      target: { value: "5+ Suta" },
    });
    fireEvent.change(screen.getByLabelText(/Product Type/i), {
      target: { value: "Handpicked" },
    });
    fireEvent.change(screen.getByLabelText(/Address Line 2/i), {
      target: { value: "Suite 304" },
    });
    fireEvent.change(screen.getByLabelText(/^City/i), {
      target: { value: "Bengaluru" },
    });
    fireEvent.change(screen.getByLabelText(/State \/ Province \/ Region/i), {
      target: { value: "Karnataka" },
    });

    const countryInput = screen.getByLabelText(/^Country/i);
    fireEvent.focus(countryInput);
    fireEvent.change(countryInput, { target: { value: "Ind" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "India" }));

    fireEvent.change(screen.getByLabelText(/Postal Code \/ PIN Code/i), {
      target: { value: "560001" },
    });

    expect(screen.getByText(/Sample Requested/i)).toBeInTheDocument();
    expect(screen.getByText(/Grade: 5\+ Suta/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Type: Handpicked/i)).toBeInTheDocument();
    expect(screen.getByText(/42 MG Road, Suite 304, Bengaluru, Karnataka 560001, India/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Submitted/i)).toBeInTheDocument();
    });

    const sentBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      desiredGrade: string;
      productType: string;
      shippingAddress: Record<string, string>;
    };
    expect(sentBody.desiredGrade).toBe("5+ Suta");
    expect(sentBody.productType).toBe("Handpicked");
    expect(sentBody.shippingAddress).toEqual({
      addressLine1: "42 MG Road",
      addressLine2: "Suite 304",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
    });
  });
});
