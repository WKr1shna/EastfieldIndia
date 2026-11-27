import { z } from "zod";
import { COUNTRIES, validatePostalCodeForCountry } from "@/utils/countries";

export const SAMPLE_GRADES = [
  "4 Suta",
  "4+ Suta",
  "5 Suta",
  "5+ Suta",
  "6 Suta",
  "6+ Suta",
] as const;

export const SAMPLE_GRADE_VALUES = [
  ...SAMPLE_GRADES,
  "4",
  "4+",
  "5",
  "5+",
  "6",
  "6+",
] as const;

export const SAMPLE_PRODUCT_TYPES = ["Regular", "Handpicked"] as const;

export const ENQUIRY_TYPES = ["entry_lead", "enquiry", "sample"] as const;
export type EnquiryMode = (typeof ENQUIRY_TYPES)[number];

export const LEAD_SOURCES = ["entry_popup", "sample_gate", "general_enquiry"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type SampleGradeOption = (typeof SAMPLE_GRADES)[number];
export type SampleProductTypeOption = (typeof SAMPLE_PRODUCT_TYPES)[number];

const phoneValidation = z
  .string()
  .trim()
  .min(7, "Please enter a valid mobile number (include country code if international).")
  .max(28, "Mobile number must be 28 characters or fewer.")
  .regex(/^[+\d\s().-]+$/, "Mobile number may only contain digits, +, spaces, hyphens, or parentheses.")
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    },
    { message: "Mobile number must contain between 7 and 15 digits." }
  );

const mandatoryLeadFields = {
  name: z
    .string()
    .trim()
    .min(2, "Full name is required (at least 2 characters).")
    .max(120, "Full name must be 120 characters or fewer."),
  phone: phoneValidation,
  company: z
    .string()
    .trim()
    .min(2, "Company name is required (at least 2 characters).")
    .max(160, "Company name must be 160 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid business email address.")
    .max(180, "Email address is too long."),
  visitorId: z.string().trim().max(80).optional().default(""),
  leadId: z.string().trim().max(80).optional().default(""),
  firstVisitAt: z.string().trim().max(64).optional().default(""),
  latestVisitAt: z.string().trim().max(64).optional().default(""),
  leadSource: z.enum(LEAD_SOURCES).optional().default("general_enquiry"),
  skippedInitial: z.boolean().optional().default(false),
  website: z.string().max(0, "Spam detected.").optional().default(""),
  formStartedAt: z.number().optional(),
};

export const shippingAddressSchema = z
  .object({
    addressLine1: z
      .string()
      .trim()
      .min(3, "Address Line 1 is required (building, street, or primary address).")
      .max(200, "Address Line 1 must be 200 characters or fewer."),
    addressLine2: z
      .string()
      .trim()
      .max(200, "Address Line 2 must be 200 characters or fewer.")
      .optional()
      .default(""),
    city: z
      .string()
      .trim()
      .min(2, "City is required.")
      .max(100, "City must be 100 characters or fewer."),
    state: z
      .string()
      .trim()
      .min(2, "State / Province / Region is required.")
      .max(100, "State / Province / Region must be 100 characters or fewer."),
    postalCode: z
      .string()
      .trim()
      .min(2, "Postal Code / PIN Code is required.")
      .max(16, "Postal Code / PIN Code must be 16 characters or fewer."),
    country: z
      .string()
      .trim()
      .min(2, "Please select a country.")
      .refine((val) => (COUNTRIES as readonly string[]).includes(val), {
        message: "Please select a valid country from the list.",
      }),
  })
  .superRefine((addr, ctx) => {
    const check = validatePostalCodeForCountry(addr.postalCode, addr.country);
    if (!check.valid) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: check.message || "Please enter a valid postal / PIN code.",
      });
    }
  });

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const entryLeadSchema = z.object({
  ...mandatoryLeadFields,
  requestType: z.literal("entry_lead"),
  details: z.string().trim().max(1500).optional().default(""),
});

export const generalEnquirySchema = z.object({
  ...mandatoryLeadFields,
  requestType: z.literal("enquiry"),
  subject: z
    .string()
    .trim()
    .max(200, "Subject must be 200 characters or fewer.")
    .optional()
    .default("General Business Enquiry"),
  details: z
    .string()
    .trim()
    .max(1500, "Message must be 1500 characters or fewer.")
    .optional()
    .default(""),
});

export const sampleRequestSchema = z.object({
  ...mandatoryLeadFields,
  requestType: z.literal("sample"),
  desiredGrade: z.enum(SAMPLE_GRADE_VALUES, {
    message: "Please select your desired makhana grade.",
  }),
  productType: z.enum(SAMPLE_PRODUCT_TYPES, {
    message: "Please select a product type (Regular or Handpicked).",
  }),
  quantity: z
    .string()
    .trim()
    .max(120, "Quantity must be 120 characters or fewer.")
    .optional()
    .default(""),
  shippingAddress: shippingAddressSchema,
  details: z
    .string()
    .trim()
    .max(2000, "Additional requirements must be 2000 characters or fewer.")
    .optional()
    .default(""),
});

const leadUnionSchema = z.discriminatedUnion("requestType", [
  entryLeadSchema,
  generalEnquirySchema,
  sampleRequestSchema,
]);

export const inquirySchema = z.preprocess((val) => {
  if (val && typeof val === "object" && !("requestType" in val)) {
    return { ...(val as Record<string, unknown>), requestType: "enquiry" };
  }
  return val;
}, leadUnionSchema);

export type InquiryPayload = z.infer<typeof leadUnionSchema>;
