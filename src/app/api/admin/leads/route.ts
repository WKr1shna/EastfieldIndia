import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/services/adminAuth";
import { queryPaginatedLeads, serializeLeadsToCsv } from "@/services/inquiryRepository";

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
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const status = searchParams.get("status") || undefined;
  const sampleParam = searchParams.get("requestedSample");
  const requestedSample =
    sampleParam === "true" || sampleParam === "false" ? sampleParam : undefined;
  const format = searchParams.get("format") === "csv" ? "csv" : "json";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || (format === "csv" ? 100 : 25));

  try {
    const result = await queryPaginatedLeads({
      dateFrom,
      dateTo,
      requestedSample,
      status,
      page,
      limit,
    });

    if (format === "csv") {
      const csv = serializeLeadsToCsv(result.items);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="eastfield-leads-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        count: result.items.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        leads: result.items,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to query leads right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
