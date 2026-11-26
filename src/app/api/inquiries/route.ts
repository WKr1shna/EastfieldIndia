import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/validations/inquiry";
import { checkRateLimit } from "@/services/rateLimit";
import { saveInquiryRecord, type StoredInquiry } from "@/services/inquiryRepository";
import { sendInquiryNotification } from "@/services/emailService";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(hashIp(ip));

  const rateHeaders = {
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
  };

  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      {
        ok: false,
        error: "Too many inquiry submissions from this connection. Please wait a few minutes before trying again.",
      },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders }
    );
  }

  const parsed = inquirySchema.safeParse(rawBody);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Please review the highlighted fields and submit again.",
        fieldErrors,
      },
      { status: 422, headers: rateHeaders }
    );
  }

  const data = parsed.data;

  // Reject automated bot submissions filled impossibly fast (< 1.2s)
  if (typeof data.formStartedAt === "number" && data.formStartedAt > 0) {
    const elapsed = Date.now() - data.formStartedAt;
    if (elapsed >= 0 && elapsed < 1200) {
      return NextResponse.json(
        { ok: false, error: "Submission rejected. Please take a moment to review your brief." },
        { status: 400, headers: rateHeaders }
      );
    }
  }

  const record: StoredInquiry = {
    id: `EF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 6).toUpperCase()}`,
    name: sanitizeText(data.name),
    company: sanitizeText(data.company),
    email: sanitizeText(data.email).toLowerCase(),
    phone: sanitizeText(data.phone),
    buyerType: data.buyerType,
    country: sanitizeText(data.country),
    grade: data.grade,
    quantity: sanitizeText(data.quantity),
    application: sanitizeText(data.application),
    destination: sanitizeText(data.destination),
    packaging: sanitizeText(data.packaging || ""),
    quality: sanitizeText(data.quality || ""),
    details: sanitizeText(data.details || ""),
    submittedAt: new Date().toISOString(),
    sourceIpHash: hashIp(ip),
  };

  const [storage, emailResult] = await Promise.all([
    saveInquiryRecord(record),
    sendInquiryNotification(record),
  ]);

  return NextResponse.json(
    {
      ok: true,
      referenceId: record.id,
      message:
        "Thank you. Your sourcing specification has been logged. Our team will review grade availability, sample criteria, and next steps.",
      delivery: {
        persisted: storage.persisted,
        emailDispatched: emailResult.sent,
      },
    },
    { status: 201, headers: rateHeaders }
  );
}
