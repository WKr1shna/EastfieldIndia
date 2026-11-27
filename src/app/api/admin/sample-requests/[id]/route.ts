import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SAMPLE_REQUEST_STATUSES } from "@/models/SampleRequest";
import { requireAdminAuth } from "@/services/adminAuth";
import { updateSampleRequestStatus } from "@/services/inquiryRepository";

export const dynamic = "force-dynamic";

const statusUpdateSchema = z.object({
  status: z.enum(SAMPLE_REQUEST_STATUSES),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request, ["admin", "manager"]);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } }
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

  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid sample request status." },
      { status: 422, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { id } = await context.params;
  try {
    const updated = await updateSampleRequestStatus(id, parsed.data.status);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Sample request not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { ok: true, sampleRequest: updated },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to update sample request right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
