import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as repo from "@/services/inquiryRepository";
import { createAdminSessionToken } from "@/services/adminAuth";
import { clearLocalRateLimitBuckets } from "@/services/rateLimit";

describe("API database failure safety, admin auth, pagination & status updates", () => {
  const prevAdminKey = process.env.ADMIN_API_KEY;
  const prevMongoUri = process.env.MONGODB_URI;

  beforeEach(() => {
    clearLocalRateLimitBuckets();
    process.env.ADMIN_API_KEY = "test-admin-secret-key-min-16-chars";
    delete process.env.MONGODB_URI;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevAdminKey !== undefined) process.env.ADMIN_API_KEY = prevAdminKey;
    else delete process.env.ADMIN_API_KEY;
    if (prevMongoUri !== undefined) process.env.MONGODB_URI = prevMongoUri;
    else delete process.env.MONGODB_URI;
  });

  it("returns 503 and does not fake success if database persistence fails", async () => {
    vi.spyOn(repo, "upsertLeadRecord").mockResolvedValue({
      persisted: false,
      deduplicated: false,
      lead: {
        id: "EF-FAIL-1",
        visitorId: "",
        name: "Test Buyer",
        phone: "+91 98111 22334",
        company: "FailSafe Foods",
        email: "buyer@failsafe.com",
        firstVisitAt: "",
        latestVisitAt: "",
        leadSource: "entry_popup",
        skippedInitial: false,
        submittedDetails: true,
        requestedSample: false,
        sampleDetails: null,
        additionalMessage: "",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceIpHash: "",
      },
      channel: "ephemeral",
    });

    const { POST } = await import("@/app/api/inquiries/route");
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.1" },
      body: JSON.stringify({
        requestType: "entry_lead",
        name: "Test Buyer",
        phone: "+91 98111 22334",
        company: "FailSafe Foods",
        email: "buyer@failsafe.com",
        website: "",
        formStartedAt: Date.now() - 5000,
      }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { ok: boolean; error: string };
    expect(res.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.error).not.toMatch(/mongodb|srv|password|stack/i);
  });

  it("enforces role authorization and supports sample request list & status updates", async () => {
    vi.spyOn(repo, "queryPaginatedSampleRequests").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 1,
    });
    vi.spyOn(repo, "updateSampleRequestStatus").mockResolvedValue({
      referenceId: "EFS-20261127-123456",
      status: "reviewed",
    } as never);

    const { GET } = await import("@/app/api/admin/sample-requests/route");
    const { PATCH } = await import("@/app/api/admin/sample-requests/[id]/route");

    const unauth = await GET(new NextRequest("http://localhost:3000/api/admin/sample-requests"));
    expect(unauth.status).toBe(401);

    const viewerToken = createAdminSessionToken({
      id: "u1",
      email: "viewer@eastfieldindia.com",
      name: "Viewer",
      role: "viewer",
    });

    const viewerRead = await GET(
      new NextRequest("http://localhost:3000/api/admin/sample-requests?page=1&limit=25", {
        headers: { cookie: `eastfield_admin_session=${viewerToken}` },
      })
    );
    expect(viewerRead.status).toBe(200);

    const viewerWrite = await PATCH(
      new NextRequest("http://localhost:3000/api/admin/sample-requests/EFS-20261127-123456", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: `eastfield_admin_session=${viewerToken}`,
        },
        body: JSON.stringify({ status: "reviewed" }),
      }),
      { params: Promise.resolve({ id: "EFS-20261127-123456" }) }
    );
    expect(viewerWrite.status).toBe(403);

    const adminPatch = await PATCH(
      new NextRequest("http://localhost:3000/api/admin/sample-requests/EFS-20261127-123456", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-admin-secret-key-min-16-chars",
        },
        body: JSON.stringify({ status: "reviewed" }),
      }),
      { params: Promise.resolve({ id: "EFS-20261127-123456" }) }
    );
    expect(adminPatch.status).toBe(200);
    const patchJson = (await adminPatch.json()) as {
      ok: boolean;
      sampleRequest: { status: string };
    };
    expect(patchJson.ok).toBe(true);
    expect(patchJson.sampleRequest.status).toBe("reviewed");
  });
});
