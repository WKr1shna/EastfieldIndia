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

    // Fill GST No., specification & structured shipping address including searchable country dropdown
    fireEvent.change(screen.getByLabelText(/GST No\./i), {
      target: { value: "10bippa9997l1zm" },
    });
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
    const stateInput = screen.getByLabelText(/State \/ Province \/ Region/i);
    fireEvent.focus(stateInput);
    fireEvent.change(stateInput, { target: { value: "Karn" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "Karnataka" }));

    const countryInput = screen.getByLabelText(/^Country/i);
    fireEvent.focus(countryInput);
    fireEvent.change(countryInput, { target: { value: "Ind" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "India" }));

    fireEvent.change(screen.getByLabelText(/Postal Code \/ PIN Code/i), {
      target: { value: "560001" },
    });

    expect(screen.getByText(/Sample Requested/i)).toBeInTheDocument();
    expect(screen.getByText(/GST No\.: 10BIPPA9997L1ZM/i)).toBeInTheDocument();
    expect(screen.getByText(/Grade: 5\+ Suta/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Type: Handpicked/i)).toBeInTheDocument();
    expect(screen.getByText(/42 MG Road, Suite 304, Bengaluru, Karnataka 560001, India/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sample Request Received!/i)).toBeInTheDocument();
      expect(screen.getByText(/Request Accepted · Saved/i)).toBeInTheDocument();
      expect(screen.queryByRole("form", { name: /Request a Sample Form/i })).not.toBeInTheDocument();
    });

    // Clicking Done closes the global confirmation popup
    fireEvent.click(screen.getByRole("button", { name: /^Done$/i }));
    expect(screen.queryByText(/Sample Request Received!/i)).not.toBeInTheDocument();

    // Duplicate sample submission (409) stays on modal with clear duplicate response
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        ok: false,
        duplicate: true,
        code: "DUPLICATE_SAMPLE_REQUEST",
        error:
          "A sample request for this grade and product type has already been submitted with your email (Reference: EFS-20261127-PRE001).",
      }),
    } as Response);

    fireEvent.click(screen.getByRole("button", { name: /Open Sample/i }));
    fireEvent.click(screen.getByRole("button", { name: /^REQUEST A SAMPLE$/i }));

    expect(
      await screen.findByText(/A sample request for this grade and product type has already been submitted/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sample Request Received!/i)).not.toBeInTheDocument();

    const sentBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      gstNumber: string;
      desiredGrade: string;
      productType: string;
      shippingAddress: Record<string, string>;
    };
    expect(sentBody.gstNumber).toBe("10BIPPA9997L1ZM");
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
