import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AdminUserModel, verifyAdminPassword } from "@/models/AdminUser";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminAuthConfigured,
} from "@/services/adminAuth";
import { connectToDatabase } from "@/services/mongoose";
import { checkRateLimit } from "@/services/rateLimit";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin authentication is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const rate = await checkRateLimit(`admin_login:${createHash("sha256").update(ip).digest("hex").slice(0, 16)}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please wait and try again." },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Valid email and password are required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { ok: false, error: "Database connection unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    const user = await AdminUserModel.findOne({
      email: parsed.data.email.toLowerCase(),
      isActive: true,
    }).select("+passwordHash");

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const valid = await verifyAdminPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createAdminSessionToken({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process login right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
