import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const SAMPLE_GRADE_CODES = ["4", "4+", "5", "5+", "6", "6+"] as const;
export type SampleGradeCode = (typeof SAMPLE_GRADE_CODES)[number];

export const SAMPLE_PRODUCT_TYPE_ENUM = ["Regular", "Handpicked"] as const;
export const SAMPLE_REQUEST_STATUSES = [
  "pending",
  "reviewed",
  "contacted",
  "fulfilled",
  "cancelled",
] as const;
export type SampleRequestStatus = (typeof SAMPLE_REQUEST_STATUSES)[number];

const GRADE_TO_CODE_MAP: Record<string, SampleGradeCode> = {
  "4": "4",
  "4 suta": "4",
  "4+": "4+",
  "4+ suta": "4+",
  "5": "5",
  "5 suta": "5",
  "5+": "5+",
  "5+ suta": "5+",
  "6": "6",
  "6 suta": "6",
  "6+": "6+",
  "6+ suta": "6+",
};

export function normalizeSampleGradeCode(input: string): SampleGradeCode {
  const normalized = GRADE_TO_CODE_MAP[input.trim().toLowerCase()];
  if (!normalized) {
    throw new Error(`Invalid makhana grade: ${input}`);
  }
  return normalized;
}

const ShippingAddressSchema = new Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 16,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
  },
  { _id: false }
);

const SampleRequestSchema = new Schema(
  {
    referenceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    leadCode: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 28,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    desiredGrade: {
      type: String,
      enum: SAMPLE_GRADE_CODES,
      required: true,
    },
    productType: {
      type: String,
      enum: SAMPLE_PRODUCT_TYPE_ENUM,
      required: true,
    },
    quantity: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    additionalRequirements: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: SAMPLE_REQUEST_STATUSES,
      default: "pending",
      required: true,
    },
    sourceIpHash: {
      type: String,
      trim: true,
      default: "",
      maxlength: 64,
    },
  },
  {
    timestamps: true,
    collection: "samplerequests",
  }
);

SampleRequestSchema.index({ referenceId: 1 }, { unique: true });
SampleRequestSchema.index({ leadId: 1, createdAt: -1 });
SampleRequestSchema.index({ email: 1, createdAt: -1 });
SampleRequestSchema.index({ status: 1, createdAt: -1 });
SampleRequestSchema.index({ desiredGrade: 1, productType: 1, createdAt: -1 });
SampleRequestSchema.index({ "shippingAddress.country": 1, createdAt: -1 });
SampleRequestSchema.index({ createdAt: -1 });

export type SampleRequestDocument = InferSchemaType<typeof SampleRequestSchema>;

export const SampleRequestModel: Model<SampleRequestDocument> =
  (mongoose.models.SampleRequest as Model<SampleRequestDocument>) ||
  mongoose.model<SampleRequestDocument>("SampleRequest", SampleRequestSchema);
