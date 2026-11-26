import { describe, expect, it } from "vitest";
import { SAMPLE_GRADES, SAMPLE_PRODUCT_TYPES, inquirySchema } from "@/validations/inquiry";

describe("inquirySchema lead & sample validation", () => {
  const validEnquiryPayload = {
    requestType: "enquiry" as const,
    company: "Himalayan Foods Pvt Ltd",
    name: "Ananya Sharma",
    phone: "+91 98111 22334",
    email: "procurement@himalayanfoods.com",
    details: "Looking to connect regarding wholesale supply.",
    website: "",
  };

  const validSamplePayload = {
    requestType: "sample" as const,
    company: "Verma Snack Co",
    name: "Rohan Verma",
    phone: "+44 20 7946 0958",
    email: "rohan@vermasnacks.co.uk",
    desiredGrade: "5+ Suta" as const,
    productType: "Handpicked" as const,
    details: "Reviewing crunch and expansion before bulk order.",
    website: "",
  };

  it("accepts minimal 4-field General Business Enquiry", () => {
    const result = inquirySchema.safeParse(validEnquiryPayload);
    expect(result.success).toBe(true);
  });

  it("accepts all 6 grades paired independently with Regular or Handpicked", () => {
    expect(SAMPLE_GRADES).toEqual([
      "4 Suta",
      "4+ Suta",
      "5 Suta",
      "5+ Suta",
      "6 Suta",
      "6+ Suta",
    ]);
    expect(SAMPLE_PRODUCT_TYPES).toEqual(["Regular", "Handpicked"]);

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

  it("requires Full Name, Mobile, Company, Email, Desired Grade, and Product Type for samples", () => {
    const result = inquirySchema.safeParse({
      requestType: "sample",
      company: "",
      name: "",
      phone: "123",
      email: "bad-email",
      desiredGrade: "",
      productType: "",
      website: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("company");
      expect(fields).toContain("name");
      expect(fields).toContain("phone");
      expect(fields).toContain("email");
      expect(fields).toContain("desiredGrade");
      expect(fields).toContain("productType");
    }
  });

  it("rejects honeypot spam submissions when website field is populated", () => {
    const result = inquirySchema.safeParse({
      ...validEnquiryPayload,
      website: "https://spam.example.com",
    });
    expect(result.success).toBe(false);
  });
});
