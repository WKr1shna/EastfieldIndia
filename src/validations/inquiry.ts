import { z } from "zod";

export const BUYER_TYPES = [
  "Importer",
  "Exporter",
  "Wholesaler",
  "Distributor",
  "Retail",
  "E-commerce/D2C",
  "Food manufacturer",
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
  "Not sure yet",
] as const;

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(120, "Name must be 120 characters or fewer."),
  company: z
    .string()
    .trim()
    .min(2, "Please enter your company or organisation name.")
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
  quantity: z
    .string()
    .trim()
    .min(2, "Please specify your required quantity (e.g., 500 kg, 2 MT, 1x20ft container).")
    .max(120, "Quantity description must be 120 characters or fewer."),
  application: z
    .string()
    .trim()
    .min(2, "Please describe the intended application (e.g., roasting, retail packing, bulk trade).")
    .max(200, "Intended application must be 200 characters or fewer."),
  destination: z
    .string()
    .trim()
    .min(2, "Please specify the delivery city, port, or destination.")
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
  // Anti-spam fields
  website: z.string().max(0, "Spam detected.").optional().default(""),
  formStartedAt: z.number().optional(),
});

export type InquiryPayload = z.infer<typeof inquirySchema>;
