import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const LEAD_SOURCES_DB = ["popup", "sample_gate", "sample_request", "contact_form"] as const;
export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted"] as const;

export function normalizeMobileDisplay(phone: string): string {
  return phone.trim().replace(/\s+/g, " ");
}

export function normalizeMobileDigits(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

const LeadSchema = new Schema(
  {
    leadId: {
      type: String,
      required: true,
      trim: true,
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
      set: normalizeMobileDisplay,
    },
    mobileNormalized: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
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
    source: {
      type: String,
      enum: LEAD_SOURCES_DB,
      default: "popup",
      required: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "new",
      required: true,
    },
    visitorId: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    firstVisitAt: {
      type: String,
      trim: true,
      default: "",
      maxlength: 64,
    },
    latestVisitAt: {
      type: String,
      trim: true,
      default: "",
      maxlength: 64,
    },
    skippedInitial: {
      type: Boolean,
      default: false,
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
    collection: "leads",
  }
);

LeadSchema.index({ email: 1 }, { unique: true });
LeadSchema.index({ leadId: 1 }, { unique: true });
LeadSchema.index({ mobileNormalized: 1 });
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ createdAt: -1 });

export type LeadDocument = InferSchemaType<typeof LeadSchema>;

export const LeadModel: Model<LeadDocument> =
  (mongoose.models.Lead as Model<LeadDocument>) || mongoose.model<LeadDocument>("Lead", LeadSchema);
