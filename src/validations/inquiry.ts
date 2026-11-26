import { z } from "zod";

export const PRODUCT_GRADES = [
  "4 Suta",
  "5 Suta",
  "6 Suta",
  "6+ Suta",
  "Custom requirement",
  "Not sure",
] as const;

export const ENQUIRY_TYPES = ["enquiry", "sample"] as const;
export type EnquiryMode = (typeof ENQUIRY_TYPES)[number];

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
  company: z
    .string()
    .trim()
    .min(2, "Company name is required (at least 2 characters).")
    .max(160, "Company name must be 160 characters or fewer."),
  name: z
    .string()
    .trim()
    .min(2, "Full name is required (at least 2 characters).")
    .max(120, "Full name must be 120 characters or fewer."),
  phone: phoneValidation,
  email: z
    .string()
    .trim()
    .email("Please enter a valid business email address.")
    .max(180, "Email address is too long."),
  website: z.string().max(0, "Spam detected.").optional().default(""),
  formStartedAt: z.number().optional(),
};

export const generalEnquirySchema = z.object({
  ...mandatoryLeadFields,
  requestType: z.literal("enquiry"),
  grade: z.enum(PRODUCT_GRADES).optional().default("Not sure"),
  sampleRequirement: z.string().trim().max(240).optional().default(""),
  destination: z.string().trim().max(160).optional().default(""),
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
  grade: z.enum(PRODUCT_GRADES).optional().default("Not sure"),
  sampleRequirement: z
    .string()
    .trim()
    .max(240, "Sample requirement must be 240 characters or fewer.")
    .optional()
    .default(""),
  destination: z
    .string()
    .trim()
    .max(160, "Shipping destination must be 160 characters or fewer.")
    .optional()
    .default(""),
  details: z
    .string()
    .trim()
    .max(2000, "Additional requirements must be 2000 characters or fewer.")
    .optional()
    .default(""),
});

const leadUnionSchema = z.discriminatedUnion("requestType", [
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
export type ProductGradeOption = (typeof PRODUCT_GRADES)[number];
