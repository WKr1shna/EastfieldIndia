import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { readFile, rm } from "fs/promises";
import path from "path";
import { POST } from "@/app/api/inquiries/route";
import { GET as adminGet } from "@/app/api/admin/leads/route";
import { clearLocalRateLimitBuckets } from "@/services/rateLimit";

const TEST_STORAGE_PATH = path.join(process.cwd(), ".data", "test-leads.ndjson");

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

describe("POST /api/inquiries & GET /api/admin/leads", () => {
  const originalMongoUri = process.env.MONGODB_URI;

  beforeEach(() => {
    clearLocalRateLimitBuckets();
    delete process.env.MONGODB_URI;
    process.env.INQUIRY_STORAGE_PATH = TEST_STORAGE_PATH;
    process.env.RATE_LIMIT_MAX_REQUESTS = "5";
    process.env.ADMIN_API_KEY = "test-admin-secret-key-min-16-chars";
  });

  afterEach(async () => {
    if (originalMongoUri !== undefined) {
      process.env.MONGODB_URI = originalMongoUri;
    } else {
      delete process.env.MONGODB_URI;
    }
    delete process.env.INQUIRY_STORAGE_PATH;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    delete process.env.ADMIN_API_KEY;
    await rm(TEST_STORAGE_PATH, { force: true });
  });

  it("deduplicates initial entry lead and subsequent sample request into one enriched lead record", async () => {
    const entryRes = await POST(
      createRequest({
        requestType: "entry_lead",
        name: "Marcus Weber",
        phone: "+49 30 1234567",
        company: "Alpen Naturkost GmbH",
        email: "sourcing@alpennaturkost.de",
        visitorId: "v_123",
        leadSource: "entry_popup",
        website: "",
        formStartedAt: Date.now() - 5000,
      })
    );
    const entryJson = (await entryRes.json()) as { ok: boolean; referenceId: string };
    expect(entryRes.status).toBe(201);

    const sampleRes = await POST(
      createRequest({
        requestType: "sample",
        leadId: entryJson.referenceId,
        name: "Marcus Weber",
        phone: "+49 30 1234567",
        company: "Alpen Naturkost GmbH",
        email: "sourcing@alpennaturkost.de",
        desiredGrade: "5+ Suta",
        productType: "Handpicked",
        shippingAddress: {
          addressLine1: "Speicherstadt 14",
          addressLine2: "Kontor 3",
          city: "Hamburg",
          state: "Hamburg",
          postalCode: "20457",
          country: "Germany",
        },
        details: "Requesting sample evaluation.",
        website: "",
        formStartedAt: Date.now() - 5000,
      })
    );
    const sampleJson = (await sampleRes.json()) as {
      ok: boolean;
      referenceId: string;
      deduplicated: boolean;
    };
    expect(sampleRes.status).toBe(201);
    expect(sampleJson.referenceId).toBe(entryJson.referenceId);
    expect(sampleJson.deduplicated).toBe(true);

    const lines = (await readFile(TEST_STORAGE_PATH, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(1);
    const stored = JSON.parse(lines[0]) as Record<string, unknown>;
    expect(stored.requestedSample).toBe(true);
    expect(stored.submittedDetails).toBe(true);
    const details = stored.sampleDetails as {
      desiredGrade: string;
      productType: string;
      shippingAddress: Record<string, string>;
    };
    expect(details.desiredGrade).toBe("5+ Suta");
    expect(details.productType).toBe("Handpicked");
    expect(details.shippingAddress).toEqual({
      addressLine1: "Speicherstadt 14",
      addressLine2: "Kontor 3",
      city: "Hamburg",
      state: "Hamburg",
      postalCode: "20457",
      country: "Germany",
    });
  });

  it("protects admin leads endpoint with Bearer auth and supports CSV export + filtering", async () => {
    await POST(
      createRequest({
        requestType: "entry_lead",
        name: "Ananya Sharma",
        phone: "+91 98111 22334",
        company: "Himalayan Foods",
        email: "ananya@himalayanfoods.com",
        website: "",
        formStartedAt: Date.now() - 5000,
      })
    );

    const unauthRes = await adminGet(new NextRequest("http://localhost:3000/api/admin/leads"));
    expect(unauthRes.status).toBe(401);

    const csvRes = await adminGet(
      new NextRequest("http://localhost:3000/api/admin/leads?format=csv&requestedSample=false", {
        headers: {
          Authorization: "Bearer test-admin-secret-key-min-16-chars",
        },
      })
    );
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers.get("Content-Type")).toContain("text/csv");
    const csvText = await csvRes.text();
    expect(csvText).toContain("Himalayan Foods");
    expect(csvText).toContain("Ananya Sharma");
  });
});
