import { NextResponse } from "next/server";
import { pingMongoDb } from "@/services/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await pingMongoDb();
  const isHealthy = !db.configured || db.connected;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      service: "eastfield-india",
      database: {
        backend: db.configured ? "mongodb" : "file",
        connected: db.configured ? db.connected : true,
        ...(db.database ? { name: db.database } : {}),
        ...(db.configured && !db.connected && db.diagnostic
          ? { diagnostic: db.diagnostic }
          : {}),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
