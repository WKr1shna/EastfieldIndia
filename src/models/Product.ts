import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const PRODUCT_GRADE_CODES = ["4", "4+", "5", "5+", "6", "6+", "custom"] as const;

const ProductSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 64,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    grade: {
      type: String,
      enum: PRODUCT_GRADE_CODES,
      required: true,
    },
    productTypes: {
      type: [String],
      enum: ["Regular", "Handpicked"],
      default: ["Regular", "Handpicked"],
    },
    shortLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    specifications: {
      sizingContext: { type: String, trim: true, default: "", maxlength: 400 },
      packagingContext: { type: String, trim: true, default: "", maxlength: 400 },
      originRegion: { type: String, trim: true, default: "Purnea & Katihar, Bihar", maxlength: 160 },
      productNature: { type: String, trim: true, default: "Guilt-Free · Gluten-Free", maxlength: 120 },
    },
    image: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    imageAlt: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ isActive: 1, displayOrder: 1 });
ProductSchema.index({ grade: 1 });

export type ProductDocument = InferSchemaType<typeof ProductSchema>;

export const ProductModel: Model<ProductDocument> =
  (mongoose.models.Product as Model<ProductDocument>) ||
  mongoose.model<ProductDocument>("Product", ProductSchema);
