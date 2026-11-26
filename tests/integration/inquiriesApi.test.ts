import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { rm } from "fs/promises";
import path from "path";
import { POST } from "@/app/api/inquiries/route";
import { clearLocalRateLimitBuckets } from "@/services/rateLimit";

const TEST_STORAGE_PATH = path.join(process.cwd(), ".data", "test-inquiries.ndjson");

function createRequest(body: unknown, ip = "203.0.113.10") {
  return new NextRequest("http://localhost:3000/api/inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/inquiries", () => {
  beforeEach(() => {
    clearLocalRateLimitBuckets();
    process.env.INQUIRY_STORAGE_PATH = TEST_STORAGE_PATH;
    process.env.RATE_LIMIT_MAX_REQUESTS = "3";
  });

  afterEach(async () => {
    delete process.env.INQUIRY_STORAGE_PATH;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    await rm(TEST_STORAGE_PATH, { force: true });
  });

  const validBody = {
    name: "Marcus Weber",
    company: "Alpen Naturkost GmbH",
    email: "sourcing@alpennaturkost.de",
    phone: "+49 30 1234567",
    buyerType: "Importer",
    country: "Germany",
    grade: "6+ Suta",
    quantity: "2 MT trial lot",
    application: "Organic retail snack brand",
    destination: "Port of Hamburg",
    packaging: "Food-grade lined bulk sacks",
    quality: "Uniformity & moisture criteria per sample",
    details: "Requesting sample lot and indicative CIF terms.",
    website: "",
    formStartedAt: Date.now() - 10_000,
  };

  it("persists valid specification and returns 201 with referenceId", async () => {
    const res = await POST(createRequest(validBody));
    const json = (await res.json()) as { ok: boolean; referenceId: string };

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.referenceId).toMatch(/^EF-\d{8}-[A-Z0-9]{6}$/);
  });

  it("returns 422 with fieldErrors on invalid input", async () => {
    const res = await POST(
      createRequest({
        ...validBody,
        email: "invalid",
        company: "",
      })
    );
    const json = (await res.json()) as {
      ok: boolean;
      fieldErrors: Record<string, string>;
    };

    expect(res.status).toBe(422);
    expect(json.ok).toBe(false);
    expect(json.fieldErrors.email).toBeDefined();
    expect(json.fieldErrors.company).toBeDefined();
  });

  it("enforces rate limiting after threshold is exceeded", async () => {
    const ip = "198.51.100.77";
    for (let i = 0; i < 3; i++) {
      const okRes = await POST(createRequest(validBody, ip));
      expect(okRes.status).toBe(201);
    }
    const blockedRes = await POST(createRequest(validBody, ip));
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("Retry-After")).toBeTruthy();
  });
});
