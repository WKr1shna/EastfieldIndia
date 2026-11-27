import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const CONTACT_INQUIRY_STATUSES = ["new", "reviewed", "contacted", "closed"] as const;
export type ContactInquiryStatus = (typeof CONTACT_INQUIRY_STATUSES)[number];

const ContactInquirySchema = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
      maxlength: 28,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 160,
    },
    subject: {
      type: String,
      trim: true,
      default: "General Business Enquiry",
      maxlength: 200,
    },
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },
    source: {
      type: String,
      trim: true,
      default: "contact_form",
      maxlength: 60,
    },
    status: {
      type: String,
      enum: CONTACT_INQUIRY_STATUSES,
      default: "new",
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
    collection: "contactinquiries",
  }
);

ContactInquirySchema.index({ referenceId: 1 }, { unique: true });
ContactInquirySchema.index({ leadId: 1, createdAt: -1 });
ContactInquirySchema.index({ email: 1, createdAt: -1 });
ContactInquirySchema.index({ status: 1, createdAt: -1 });
ContactInquirySchema.index({ createdAt: -1 });

export type ContactInquiryDocument = InferSchemaType<typeof ContactInquirySchema>;

export const ContactInquiryModel: Model<ContactInquiryDocument> =
  (mongoose.models.ContactInquiry as Model<ContactInquiryDocument>) ||
  mongoose.model<ContactInquiryDocument>("ContactInquiry", ContactInquirySchema);
