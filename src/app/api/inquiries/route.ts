import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/validations/inquiry";
import { checkRateLimit } from "@/services/rateLimit";
import { saveInquiryRecord, type StoredLead } from "@/services/inquiryRepository";
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
        error: "Too many submissions from this connection. Please wait a few minutes before trying again.",
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
        error: "Please review the highlighted required fields and submit again.",
        fieldErrors,
      },
      { status: 422, headers: rateHeaders }
    );
  }

  const data = parsed.data;

  if (typeof data.formStartedAt === "number" && data.formStartedAt > 0) {
    const elapsed = Date.now() - data.formStartedAt;
    if (elapsed >= 0 && elapsed < 1200) {
      return NextResponse.json(
        { ok: false, error: "Submission rejected. Please take a moment to review your details." },
        { status: 400, headers: rateHeaders }
      );
    }
  }

  const isSample = data.requestType === "sample";

  const record: StoredLead = {
    id: `EF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 6).toUpperCase()}`,
    company: sanitizeText(data.company),
    name: sanitizeText(data.name),
    phone: sanitizeText(data.phone),
    email: sanitizeText(data.email).toLowerCase(),
    enquiryType: isSample ? "Request a Sample" : "General Business Enquiry",
    grade: data.grade || "Not sure",
    sampleRequirement: sanitizeText(data.sampleRequirement || ""),
    destination: sanitizeText(data.destination || ""),
    additionalMessage: sanitizeText(data.details || ""),
    submittedAt: new Date().toISOString(),
    sourceIpHash: hashIp(ip),
  };

  const [storage, emailResult] = await Promise.all([
    saveInquiryRecord(record),
    sendInquiryNotification(record),
  ]);

  const confirmationMessage = isSample
    ? "Thank you. Your sample request has been received. We will review sample availability and coordinate the next steps."
    : "Thank you. Your business enquiry has been received. Our team will connect with you shortly.";

  return NextResponse.json(
    {
      ok: true,
      referenceId: record.id,
      message: confirmationMessage,
      lead: {
        enquiryType: record.enquiryType,
        company: record.company,
        grade: record.grade,
        submittedAt: record.submittedAt,
      },
      delivery: {
        persisted: storage.persisted,
        emailDispatched: emailResult.sent,
      },
    },
    { status: 201, headers: rateHeaders }
  );
}
