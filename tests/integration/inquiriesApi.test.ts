import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { readFile, rm } from "fs/promises";
import path from "path";
import { POST } from "@/app/api/inquiries/route";
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

  const validSampleBody = {
    requestType: "sample",
    company: "Alpen Naturkost GmbH",
    name: "Marcus Weber",
    phone: "+49 30 1234567",
    email: "sourcing@alpennaturkost.de",
    grade: "6+ Suta",
    sampleRequirement: "500 g 6+ Suta sample pack",
    destination: "Hamburg, Germany",
    details: "Requesting sample evaluation.",
    website: "",
    formStartedAt: Date.now() - 10_000,
  };

  it("persists structured lead with all required fields and returns 201", async () => {
    const res = await POST(createRequest(validSampleBody));
    const json = (await res.json()) as { ok: boolean; referenceId: string };

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.referenceId).toMatch(/^EF-\d{8}-[A-Z0-9]{6}$/);

    const stored = JSON.parse((await readFile(TEST_STORAGE_PATH, "utf8")).trim()) as Record<
      string,
      unknown
    >;
    expect(stored.company).toBe("Alpen Naturkost GmbH");
    expect(stored.name).toBe("Marcus Weber");
    expect(stored.phone).toBe("+49 30 1234567");
    expect(stored.email).toBe("sourcing@alpennaturkost.de");
    expect(stored.enquiryType).toBe("Request a Sample");
    expect(stored.grade).toBe("6+ Suta");
    expect(stored.sampleRequirement).toBe("500 g 6+ Suta sample pack");
    expect(stored.destination).toBe("Hamburg, Germany");
    expect(stored.additionalMessage).toBe("Requesting sample evaluation.");
    expect(stored.submittedAt).toBeTruthy();
  });

  it("persists minimal 4-field General Business Enquiry", async () => {
    const res = await POST(
      createRequest({
        requestType: "enquiry",
        company: "Bharati Snacks",
        name: "Suresh Jha",
        phone: "+91 98111 22334",
        email: "suresh@bharatisnacks.in",
        website: "",
        formStartedAt: Date.now() - 5000,
      })
    );
    expect(res.status).toBe(201);
    const stored = JSON.parse((await readFile(TEST_STORAGE_PATH, "utf8")).trim()) as Record<
      string,
      unknown
    >;
    expect(stored.enquiryType).toBe("General Business Enquiry");
  });

  it("returns 422 with fieldErrors on invalid input", async () => {
    const res = await POST(
      createRequest({
        requestType: "sample",
        company: "",
        name: "M",
        phone: "123",
        email: "invalid",
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
    expect(json.fieldErrors.phone).toBeDefined();
  });

  it("enforces rate limiting after threshold is exceeded", async () => {
    const ip = "198.51.100.77";
    for (let i = 0; i < 3; i++) {
      const okRes = await POST(createRequest(validSampleBody, ip));
      expect(okRes.status).toBe(201);
    }
    const blockedRes = await POST(createRequest(validSampleBody, ip));
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("Retry-After")).toBeTruthy();
  });
});
