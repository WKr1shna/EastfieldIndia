import { NextResponse } from "next/server";
import { pingMongoDb } from "@/services/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await pingMongoDb();

  return NextResponse.json(
    {
      status: db.configured && !db.connected ? "degraded" : "healthy",
      service: "eastfield-india",
      database: {
        backend: db.configured ? "mongodb" : "file",
        connected: db.configured ? db.connected : true,
        ...(db.database ? { name: db.database } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
