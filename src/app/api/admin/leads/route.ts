import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { queryLeadRecords, serializeLeadsToCsv } from "@/services/inquiryRepository";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey || configuredKey.length < 16) {
    return false;
  }

  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return false;

  const providedBuf = Buffer.from(match[1], "utf8");
  const expectedBuf = Buffer.from(configuredKey, "utf8");
  if (providedBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(providedBuf, expectedBuf);
}

export async function GET(request: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Admin endpoint is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const sampleParam = searchParams.get("requestedSample");
  const requestedSample =
    sampleParam === "true" || sampleParam === "false" ? sampleParam : undefined;
  const format = searchParams.get("format") === "csv" ? "csv" : "json";

  const leads = await queryLeadRecords({ dateFrom, dateTo, requestedSample });

  if (format === "csv") {
    const csv = serializeLeadsToCsv(leads);
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
      count: leads.length,
      leads,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
