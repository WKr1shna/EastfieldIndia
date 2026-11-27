import bcrypt from "bcryptjs";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ADMIN_ROLES = ["admin", "manager", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

const BCRYPT_ROUNDS = 12;

const AdminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: "admin",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "adminusers",
  }
);

AdminUserSchema.index({ email: 1 }, { unique: true });
AdminUserSchema.index({ role: 1, isActive: 1 });

export type AdminUserDocument = InferSchemaType<typeof AdminUserSchema>;

export async function hashAdminPassword(plainPassword: string): Promise<string> {
  if (plainPassword.length < 10) {
    throw new Error("Admin password must be at least 10 characters.");
  }
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

export async function verifyAdminPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

export const AdminUserModel: Model<AdminUserDocument> =
  (mongoose.models.AdminUser as Model<AdminUserDocument>) ||
  mongoose.model<AdminUserDocument>("AdminUser", AdminUserSchema);
