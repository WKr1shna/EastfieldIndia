import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoredLead } from "@/services/inquiryRepository";

const store: Array<StoredLead & { _id: string }> = [];

const mockCollection = {
  findOne: vi.fn(async (query: { $or?: Array<{ id?: string; email?: string }> }) => {
    const clauses = query.$or ?? [];
    const hit = store.find((doc) =>
      clauses.some(
        (c) => (c.id && doc.id === c.id) || (c.email && doc.email === c.email)
      )
    );
    return hit ? { ...hit } : null;
  }),
  insertOne: vi.fn(async (doc: StoredLead) => {
    store.push({ ...doc, _id: `mock_${store.length + 1}` });
    return { acknowledged: true };
  }),
  updateOne: vi.fn(async (filter: { id: string }, update: { $set: StoredLead }) => {
    const idx = store.findIndex((doc) => doc.id === filter.id);
    if (idx !== -1) {
      store[idx] = { ...update.$set, _id: store[idx]._id };
    }
    return { acknowledged: true, matchedCount: idx !== -1 ? 1 : 0 };
  }),
  find: vi.fn((query: { requestedSample?: boolean; submittedAt?: { $gte?: string; $lte?: string } }) => {
    const filtered = store.filter((doc) => {
      if (typeof query.requestedSample === "boolean" && doc.requestedSample !== query.requestedSample) {
        return false;
      }
      if (query.submittedAt?.$gte && doc.submittedAt < query.submittedAt.$gte) return false;
      if (query.submittedAt?.$lte && doc.submittedAt > query.submittedAt.$lte) return false;
      return true;
    });
    return {
      sort: vi.fn((sortSpec: { submittedAt: number }) => ({
        toArray: vi.fn(async () =>
          [...filtered].sort((a, b) =>
            sortSpec.submittedAt === -1
              ? b.submittedAt.localeCompare(a.submittedAt)
              : a.submittedAt.localeCompare(b.submittedAt)
          )
        ),
      })),
    };
  }),
};

vi.mock("@/services/mongodb", () => ({
  isMongoConfigured: () => Boolean(process.env.MONGODB_URI),
  getMongoLeadsCollection: async () => mockCollection,
}));

describe("inquiryRepository with MongoDB", () => {
  const prevUri = process.env.MONGODB_URI;

  beforeEach(() => {
    store.length = 0;
    vi.clearAllMocks();
    process.env.MONGODB_URI = "mongodb+srv://user:pass@cluster0.example.mongodb.net/eastfield";
  });

  afterEach(() => {
    if (prevUri !== undefined) {
      process.env.MONGODB_URI = prevUri;
    } else {
      delete process.env.MONGODB_URI;
    }
  });

  it("persists, deduplicates by email/id, and queries leads in MongoDB without returning _id", async () => {
    const { upsertLeadRecord, queryLeadRecords } = await import("@/services/inquiryRepository");

    const baseLead: StoredLead = {
      id: "EF-20261127-MONGO1",
      visitorId: "v_abc",
      name: "Rohan Verma",
      phone: "+91 98765 43210",
      company: "Deccan Foods",
      email: "Rohan@DeccanFoods.com",
      firstVisitAt: "2026-11-27T04:00:00.000Z",
      latestVisitAt: "2026-11-27T04:00:00.000Z",
      leadSource: "entry_popup",
      skippedInitial: false,
      submittedDetails: true,
      requestedSample: false,
      sampleDetails: null,
      additionalMessage: "",
      submittedAt: "2026-11-27T04:00:00.000Z",
      updatedAt: "2026-11-27T04:00:00.000Z",
      sourceIpHash: "abc123",
    };

    const first = await upsertLeadRecord(baseLead);
    expect(first.persisted).toBe(true);
    expect(first.deduplicated).toBe(false);
    expect(first.channel).toBe("mongodb");
    expect(store).toHaveLength(1);

    const second = await upsertLeadRecord({
      ...baseLead,
      id: "EF-20261127-MONGO2",
      email: "rohan@deccanfoods.com",
      requestedSample: true,
      sampleDetails: {
        desiredGrade: "6 Suta",
        productType: "Handpicked",
        shippingAddress: {
          addressLine1: "42 MG Road",
          addressLine2: "",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
          country: "India",
        },
        additionalRequirements: "Sample carton",
      },
      updatedAt: "2026-11-27T04:05:00.000Z",
    });

    expect(second.persisted).toBe(true);
    expect(second.deduplicated).toBe(true);
    expect(second.channel).toBe("mongodb");
    expect(second.lead.id).toBe("EF-20261127-MONGO1");
    expect(store).toHaveLength(1);

    const sampleLeads = await queryLeadRecords({ requestedSample: "true" });
    expect(sampleLeads).toHaveLength(1);
    expect(sampleLeads[0].sampleDetails?.desiredGrade).toBe("6 Suta");
    expect("_id" in sampleLeads[0]).toBe(false);
  });
});
