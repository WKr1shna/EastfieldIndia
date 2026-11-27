import { afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

describe("/api/health & MongoDB diagnostics", () => {
  const prevUri = process.env.MONGODB_URI;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    if (prevUri !== undefined) process.env.MONGODB_URI = prevUri;
    else delete process.env.MONGODB_URI;
  });

  it("classifies MongoDB errors safely without leaking credentials or raw strings", async () => {
    const { classifyMongoError, assertMongoConfigured } = await import("@/services/mongoose");

    delete process.env.MONGODB_URI;
    expect(() => assertMongoConfigured()).toThrow(/MONGODB_URI/);

    const placeholder = classifyMongoError(
      new Error("auth failed"),
      "mongodb+srv://user:<db_password>@cluster0.example.mongodb.net/eastfield_india"
    );
    expect(placeholder.reason).toBe("placeholder_credentials");

    const authErr = classifyMongoError(
      Object.assign(new Error("bad auth : authentication failed"), {
        name: "MongoServerError",
        code: 8000,
      })
    );
    expect(authErr.reason).toBe("authentication_failed");
    expect(JSON.stringify(authErr)).not.toContain("bad auth");

    const networkErr = classifyMongoError(
      Object.assign(new Error("tlsv1 alert internal error"), {
        name: "MongoServerSelectionError",
      })
    );
    expect(networkErr.reason).toBe("network_or_ip_blocked");
  });

  it("returns 503 degraded with safe diagnostic when MongoDB ping fails and 200 healthy when connected", async () => {
    vi.doMock("@/services/mongodb", () => ({
      pingMongoDb: vi
        .fn()
        .mockResolvedValueOnce({
          configured: true,
          connected: false,
          database: "eastfield_india",
          readyState: 0,
          diagnostic: {
            reason: "network_or_ip_blocked",
            errorName: "MongoServerSelectionError",
            hint: "Could not reach MongoDB Atlas servers.",
          },
        })
        .mockResolvedValueOnce({
          configured: true,
          connected: true,
          database: "eastfield_india",
          readyState: 1,
        }),
    }));

    const { GET } = await import("@/app/api/health/route");

    const degradedRes = (await GET()) as NextResponse;
    expect(degradedRes.status).toBe(503);
    const degradedJson = (await degradedRes.json()) as {
      status: string;
      database: { backend: string; connected: boolean; diagnostic?: { reason: string } };
    };
    expect(degradedJson.status).toBe("degraded");
    expect(degradedJson.database.connected).toBe(false);
    expect(degradedJson.database.diagnostic?.reason).toBe("network_or_ip_blocked");

    const healthyRes = (await GET()) as NextResponse;
    expect(healthyRes.status).toBe(200);
    const healthyJson = (await healthyRes.json()) as {
      status: string;
      database: { backend: string; connected: boolean; name: string };
    };
    expect(healthyJson.status).toBe("healthy");
    expect(healthyJson.database.connected).toBe(true);
    expect(healthyJson.database.name).toBe("eastfield_india");
  });
});
