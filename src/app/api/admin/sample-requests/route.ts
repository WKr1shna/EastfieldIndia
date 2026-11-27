import { NextRequest, NextResponse } from "next/server";
import {
  SAMPLE_GRADE_CODES,
  SAMPLE_PRODUCT_TYPE_ENUM,
  SAMPLE_REQUEST_STATUSES,
  type SampleGradeCode,
  type SampleRequestStatus,
} from "@/models/SampleRequest";
import { requireAdminAuth } from "@/services/adminAuth";
import { queryPaginatedSampleRequests } from "@/services/inquiryRepository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request, ["admin", "manager", "viewer"]);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawStatus = searchParams.get("status");
  const rawGrade = searchParams.get("desiredGrade");
  const rawProductType = searchParams.get("productType");
  const country = searchParams.get("country") || undefined;

  const status = (SAMPLE_REQUEST_STATUSES as readonly string[]).includes(rawStatus || "")
    ? (rawStatus as SampleRequestStatus)
    : undefined;
  const desiredGrade = (SAMPLE_GRADE_CODES as readonly string[]).includes(rawGrade || "")
    ? (rawGrade as SampleGradeCode)
    : undefined;
  const productType = (SAMPLE_PRODUCT_TYPE_ENUM as readonly string[]).includes(rawProductType || "")
    ? (rawProductType as "Regular" | "Handpicked")
    : undefined;

  try {
    const result = await queryPaginatedSampleRequests({
      status,
      desiredGrade,
      productType,
      country,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 25),
    });

    return NextResponse.json(
      {
        ok: true,
        ...result,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load sample requests right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
