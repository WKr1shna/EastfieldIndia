import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/services/adminAuth";
import { queryPaginatedContactInquiries } from "@/services/inquiryRepository";

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
  try {
    const result = await queryPaginatedContactInquiries({
      status: searchParams.get("status") || undefined,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 25),
    });
    return NextResponse.json(
      { ok: true, ...result },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load contact inquiries right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
