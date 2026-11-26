import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/validations/inquiry";

describe("inquirySchema validation", () => {
  const validPayload = {
    name: "Ananya Sharma",
    company: "Himalayan Foods Pvt Ltd",
    email: "procurement@himalayanfoods.com",
    phone: "+91 98111 22334",
    buyerType: "Food manufacturer",
    country: "India",
    grade: "6 Suta",
    quantity: "1,000 kg monthly",
    application: "Flavoured roasted retail packs",
    destination: "Bengaluru, Karnataka",
    packaging: "10 kg nitrogen-flushed lined cartons",
    quality: "Moisture < 11%, broken < 2%",
    details: "Looking for sample evaluation before Q2 commitment.",
    website: "",
  };

  it("accepts a complete valid B2B inquiry", () => {
    const result = inquirySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email and missing required fields", () => {
    const result = inquirySchema.safeParse({
      ...validPayload,
      email: "not-an-email",
      quantity: "",
      buyerType: "InvalidType",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("email");
      expect(fields).toContain("quantity");
      expect(fields).toContain("buyerType");
    }
  });

  it("rejects honeypot spam submissions when website field is populated", () => {
    const result = inquirySchema.safeParse({
      ...validPayload,
      website: "https://spam.example.com",
    });
    expect(result.success).toBe(false);
  });
});
