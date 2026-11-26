import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/validations/inquiry";
import { checkRateLimit } from "@/services/rateLimit";
import { upsertLeadRecord, type StoredLead } from "@/services/inquiryRepository";
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
      // Support nested shippingAddress.<field> paths cleanly
      const key = issue.path.length > 0 ? issue.path.join(".") : "form";
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

  const nowIso = new Date().toISOString();
  const isSample = data.requestType === "sample";
  const isEntryLead = data.requestType === "entry_lead";

  const candidateId =
    data.leadId && data.leadId.startsWith("EF-")
      ? data.leadId
      : `EF-${nowIso.slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 6).toUpperCase()}`;

  const incomingLead: StoredLead = {
    id: candidateId,
    visitorId: sanitizeText(data.visitorId || ""),
    name: sanitizeText(data.name),
    phone: sanitizeText(data.phone),
    company: sanitizeText(data.company),
    email: sanitizeText(data.email).toLowerCase(),
    firstVisitAt: sanitizeText(data.firstVisitAt || nowIso),
    latestVisitAt: sanitizeText(data.latestVisitAt || nowIso),
    leadSource: data.leadSource || (isEntryLead ? "entry_popup" : "general_enquiry"),
    skippedInitial: Boolean(data.skippedInitial),
    submittedDetails: true,
    requestedSample: isSample,
    sampleDetails: isSample
      ? {
          desiredGrade: data.desiredGrade,
          productType: data.productType,
          shippingAddress: {
            addressLine1: sanitizeText(data.shippingAddress.addressLine1),
            addressLine2: sanitizeText(data.shippingAddress.addressLine2 || ""),
            city: sanitizeText(data.shippingAddress.city),
            state: sanitizeText(data.shippingAddress.state),
            postalCode: sanitizeText(data.shippingAddress.postalCode),
            country: sanitizeText(data.shippingAddress.country),
          },
          additionalRequirements: sanitizeText(data.details || ""),
        }
      : null,
    additionalMessage: !isSample ? sanitizeText(data.details || "") : "",
    submittedAt: nowIso,
    updatedAt: nowIso,
    sourceIpHash: hashIp(ip),
  };

  const storage = await upsertLeadRecord(incomingLead);
  const emailResult = await sendInquiryNotification(storage.lead);

  const confirmationMessage = isSample
    ? "Thank you for your interest in EastField India. Our team will review your request and get in touch with you."
    : isEntryLead
    ? "Thank you. Your business contact details have been saved."
    : "Thank you. Your business enquiry has been received. Our team will connect with you shortly.";

  return NextResponse.json(
    {
      ok: true,
      referenceId: storage.lead.id,
      deduplicated: storage.deduplicated,
      message: confirmationMessage,
      lead: {
        id: storage.lead.id,
        company: storage.lead.company,
        name: storage.lead.name,
        phone: storage.lead.phone,
        email: storage.lead.email,
        requestedSample: storage.lead.requestedSample,
        submittedAt: storage.lead.submittedAt,
      },
      delivery: {
        persisted: storage.persisted,
        emailDispatched: emailResult.sent,
      },
    },
    { status: 201, headers: rateHeaders }
  );
}
