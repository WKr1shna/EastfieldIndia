import { NextRequest, NextResponse } from "next/server";
import { ProductModel } from "@/models/Product";
import { requireAdminAuth } from "@/services/adminAuth";
import { syncProductCatalog } from "@/services/inquiryRepository";
import { connectToDatabase } from "@/services/mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request, ["admin", "manager", "viewer"]);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await connectToDatabase();
    const products = await ProductModel.find({}).sort({ displayOrder: 1 }).lean();
    return NextResponse.json(
      { ok: true, count: products.length, products },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to query product catalog." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminAuth(request, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const products = await syncProductCatalog();
    return NextResponse.json(
      { ok: true, count: products.length, products },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to sync product catalog." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
