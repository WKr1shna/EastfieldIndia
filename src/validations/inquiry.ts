import { z } from "zod";

export const BUYER_TYPES = [
  "Importer",
  "Exporter",
  "Distributor",
  "Wholesaler",
  "Food manufacturer",
  "Retailer",
  "Retail",
  "E-commerce brand",
  "E-commerce/D2C",
  "HoReCa",
  "Institutional buyer",
  "Other",
] as const;

export const FORM_BUYER_TYPES = [
  "Importer",
  "Exporter",
  "Distributor",
  "Wholesaler",
  "Food manufacturer",
  "Retailer",
  "E-commerce brand",
  "HoReCa",
  "Institutional buyer",
  "Other",
] as const;

export const PRODUCT_GRADES = [
  "4 Suta",
  "5 Suta",
  "6 Suta",
  "6+ Suta",
  "Custom requirement",
  "Not sure",
  "Not sure yet",
] as const;

export const FORM_PRODUCT_GRADES = [
  "4 Suta",
  "5 Suta",
  "6 Suta",
  "6+ Suta",
  "Custom requirement",
  "Not sure",
] as const;

export const INQUIRY_MODES = ["sample", "specification"] as const;

const commonFields = {
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(120, "Name must be 120 characters or fewer."),
  company: z
    .string()
    .trim()
    .min(2, "Please enter your company name.")
    .max(160, "Company name must be 160 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid business email address.")
    .max(180, "Email address is too long."),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid contact phone number with country/area code.")
    .max(32, "Phone number must be 32 characters or fewer.")
    .regex(/^[+\d\s().-]+$/, "Phone number contains unsupported characters."),
  buyerType: z.enum(BUYER_TYPES, {
    message: "Please select your buyer type.",
  }),
  country: z
    .string()
    .trim()
    .min(2, "Please specify your country.")
    .max(100, "Country name is too long."),
  grade: z.enum(PRODUCT_GRADES, {
    message: "Please select a product grade.",
  }),
  application: z
    .string()
    .trim()
    .min(2, "Please describe the intended application (e.g., roasting, retail packing, bulk trade).")
    .max(200, "Intended application must be 200 characters or fewer."),
  destination: z
    .string()
    .trim()
    .min(2, "Please specify the shipping destination or port.")
    .max(160, "Destination must be 160 characters or fewer."),
  packaging: z
    .string()
    .trim()
    .max(240, "Packaging requirements must be 240 characters or fewer.")
    .optional()
    .default(""),
  quality: z
    .string()
    .trim()
    .max(320, "Quality requirements must be 320 characters or fewer.")
    .optional()
    .default(""),
  details: z
    .string()
    .trim()
    .max(2000, "Additional details must be 2000 characters or fewer.")
    .optional()
    .default(""),
  website: z.string().max(0, "Spam detected.").optional().default(""),
  formStartedAt: z.number().optional(),
};

const sampleInquirySchema = z.object({
  ...commonFields,
  requestType: z.literal("sample"),
  sampleRequirement: z
    .string()
    .trim()
    .min(2, "Please describe your sample requirement (e.g., 500 g 6 Suta evaluation pack).")
    .max(240, "Sample requirement must be 240 characters or fewer."),
  quantity: z
    .string()
    .trim()
    .max(120, "Quantity description must be 120 characters or fewer.")
    .optional()
    .default(""),
});

const specificationInquirySchema = z.object({
  ...commonFields,
  requestType: z.literal("specification"),
  sampleRequirement: z
    .string()
    .trim()
    .max(240, "Sample requirement must be 240 characters or fewer.")
    .optional()
    .default(""),
  quantity: z
    .string()
    .trim()
    .min(2, "Please specify your required quantity (e.g., 500 kg, 2 MT).")
    .max(120, "Quantity description must be 120 characters or fewer."),
});

const unionSchema = z.discriminatedUnion("requestType", [
  sampleInquirySchema,
  specificationInquirySchema,
]);

export const inquirySchema = z.preprocess((val) => {
  if (val && typeof val === "object" && !("requestType" in val)) {
    return { ...(val as Record<string, unknown>), requestType: "specification" };
  }
  return val;
}, unionSchema);

export type InquiryPayload = z.infer<typeof unionSchema>;
export type InquiryMode = (typeof INQUIRY_MODES)[number];
