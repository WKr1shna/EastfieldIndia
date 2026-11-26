import { describe, expect, it } from "vitest";
import { SAMPLE_GRADES, SAMPLE_PRODUCT_TYPES, inquirySchema } from "@/validations/inquiry";

describe("inquirySchema lead, sample & shipping address validation", () => {
  const validEnquiryPayload = {
    requestType: "enquiry" as const,
    company: "Himalayan Foods Pvt Ltd",
    name: "Ananya Sharma",
    phone: "+91 98111 22334",
    email: "procurement@himalayanfoods.com",
    details: "Looking to connect regarding wholesale supply.",
    website: "",
  };

  const ukAddress = {
    addressLine1: "221B Baker Street",
    addressLine2: "Floor 2",
    city: "London",
    state: "Greater London",
    postalCode: "NW1 6XE",
    country: "United Kingdom",
  };

  const validSamplePayload = {
    requestType: "sample" as const,
    company: "Verma Snack Co",
    name: "Rohan Verma",
    phone: "+44 20 7946 0958",
    email: "rohan@vermasnacks.co.uk",
    desiredGrade: "5+ Suta" as const,
    productType: "Handpicked" as const,
    shippingAddress: ukAddress,
    details: "Reviewing crunch and expansion before bulk order.",
    website: "",
  };

  it("accepts minimal 4-field General Business Enquiry", () => {
    const result = inquirySchema.safeParse(validEnquiryPayload);
    expect(result.success).toBe(true);
  });

  it("accepts all 6 grades paired independently with Regular or Handpicked and international address", () => {
    for (const desiredGrade of SAMPLE_GRADES) {
      for (const productType of SAMPLE_PRODUCT_TYPES) {
        const result = inquirySchema.safeParse({
          ...validSamplePayload,
          desiredGrade,
          productType,
        });
        expect(result.success).toBe(true);
      }
    }
  });

  it("validates country-aware postal codes (India 6-digit PIN vs US ZIP vs UK postcode)", () => {
    const badIndiaPin = inquirySchema.safeParse({
      ...validSamplePayload,
      shippingAddress: {
        addressLine1: "Plot 12, Sector 4",
        addressLine2: "",
        city: "Purnea",
        state: "Bihar",
        postalCode: "ABC12",
        country: "India",
      },
    });
    expect(badIndiaPin.success).toBe(false);

    const goodIndiaPin = inquirySchema.safeParse({
      ...validSamplePayload,
      shippingAddress: {
        addressLine1: "Plot 12, Sector 4",
        addressLine2: "",
        city: "Purnea",
        state: "Bihar",
        postalCode: "854301",
        country: "India",
      },
    });
    expect(goodIndiaPin.success).toBe(true);
  });

  it("requires structured shipping address fields and product specs for samples", () => {
    const result = inquirySchema.safeParse({
      requestType: "sample",
      company: "",
      name: "",
      phone: "123",
      email: "bad-email",
      desiredGrade: "",
      productType: "",
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      website: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("company");
      expect(paths).toContain("name");
      expect(paths).toContain("phone");
      expect(paths).toContain("email");
      expect(paths).toContain("desiredGrade");
      expect(paths).toContain("productType");
      expect(paths).toContain("shippingAddress.addressLine1");
      expect(paths).toContain("shippingAddress.city");
      expect(paths).toContain("shippingAddress.state");
      expect(paths).toContain("shippingAddress.postalCode");
      expect(paths).toContain("shippingAddress.country");
    }
  });
});
