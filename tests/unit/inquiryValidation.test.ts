import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/validations/inquiry";

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
    grade: "6+ Suta" as const,
    sampleRequirement: "500 g 6+ Suta evaluation pack",
    destination: "London, UK",
    details: "Reviewing crunch and expansion before bulk order.",
    website: "",
  };

  it("accepts minimal 4-field General Business Enquiry", () => {
    const result = inquirySchema.safeParse(validEnquiryPayload);
    expect(result.success).toBe(true);
  });

  it("accepts Request a Sample with international phone number", () => {
    const result = inquirySchema.safeParse(validSamplePayload);
    expect(result.success).toBe(true);
  });

  it("requires Company Name, Full Name, Mobile Number, and Email for sample requests", () => {
    const result = inquirySchema.safeParse({
      requestType: "sample",
      company: "",
      name: "",
      phone: "123",
      email: "bad-email",
      grade: "6 Suta",
      website: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("company");
      expect(fields).toContain("name");
      expect(fields).toContain("phone");
      expect(fields).toContain("email");
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
