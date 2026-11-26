import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/validations/inquiry";

describe("inquirySchema validation", () => {
  const validSpecPayload = {
    requestType: "specification" as const,
    name: "Ananya Sharma",
    company: "Himalayan Foods Pvt Ltd",
    email: "procurement@himalayanfoods.com",
    phone: "+91 98111 22334",
    buyerType: "Food manufacturer" as const,
    country: "India",
    grade: "6 Suta" as const,
    quantity: "1,000 kg monthly",
    application: "Flavoured roasted retail packs",
    destination: "Bengaluru, Karnataka",
    packaging: "10 kg nitrogen-flushed lined cartons",
    quality: "Moisture < 11%, broken < 2%",
    details: "Looking for sample evaluation before Q2 commitment.",
    website: "",
  };

  const validSamplePayload = {
    requestType: "sample" as const,
    name: "Rohan Verma",
    company: "Verma Snack Co",
    email: "rohan@vermasnacks.in",
    phone: "+91 98100 12345",
    country: "India",
    buyerType: "E-commerce brand" as const,
    grade: "6+ Suta" as const,
    sampleRequirement: "500 g 6+ Suta evaluation pack",
    application: "Clean-label roasted snacks",
    destination: "Mumbai, Maharashtra",
    details: "Reviewing crunch and expansion before bulk order.",
    website: "",
  };

  it("accepts a complete valid B2B specification inquiry", () => {
    const result = inquirySchema.safeParse(validSpecPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a complete valid Request a Sample submission", () => {
    const result = inquirySchema.safeParse(validSamplePayload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email and missing sampleRequirement in sample mode", () => {
    const result = inquirySchema.safeParse({
      ...validSamplePayload,
      email: "not-an-email",
      sampleRequirement: "",
      buyerType: "InvalidType",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("email");
      expect(fields).toContain("sampleRequirement");
      expect(fields).toContain("buyerType");
    }
  });

  it("rejects honeypot spam submissions when website field is populated", () => {
    const result = inquirySchema.safeParse({
      ...validSpecPayload,
      website: "https://spam.example.com",
    });
    expect(result.success).toBe(false);
  });
});
