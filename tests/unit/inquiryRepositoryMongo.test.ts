import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AdminUserModel,
  ContactInquiryModel,
  LeadModel,
  ProductModel,
  SampleRequestModel,
  hashAdminPassword,
  normalizeSampleGradeCode,
  verifyAdminPassword,
} from "@/models";

const mockLeads: Array<Record<string, unknown>> = [];
const mockSamples: Array<Record<string, unknown>> = [];
const mockInquiries: Array<Record<string, unknown>> = [];

vi.mock("@/services/mongoose", () => ({
  isMongoConfigured: () => Boolean(process.env.MONGODB_URI),
  connectToDatabase: async () => ({ connection: { readyState: 1 } }),
}));

vi.mock("@/models", async () => {
  const actual = await vi.importActual<typeof import("@/models")>("@/models");
  return {
    ...actual,
    LeadModel: {
      schema: actual.LeadModel.schema,
      findOne: vi.fn(async (query: { $or?: Array<{ leadId?: string; email?: string }> }) => {
        const clauses = query.$or ?? [];
        const found = mockLeads.find((doc) =>
          clauses.some(
            (c) => (c.leadId && doc.leadId === c.leadId) || (c.email && doc.email === c.email)
          )
        );
        if (!found) return null;
        return {
          ...found,
          save: async function save(this: Record<string, unknown>) {
            const idx = mockLeads.findIndex((d) => d._id === this._id);
            this.updatedAt = new Date();
            if (idx !== -1) mockLeads[idx] = { ...this };
            return mockLeads[idx];
          },
        };
      }),
      create: vi.fn(async (doc: Record<string, unknown>) => {
        const now = new Date();
        const created = {
          ...doc,
          _id: `lead_${mockLeads.length + 1}`,
          createdAt: now,
          updatedAt: now,
        };
        mockLeads.push(created);
        return created;
      }),
      countDocuments: vi.fn(async () => mockLeads.length),
      find: vi.fn(() => ({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: async () => [...mockLeads],
            }),
          }),
        }),
      })),
    },
    SampleRequestModel: {
      schema: actual.SampleRequestModel.schema,
      findOne: vi.fn(async (query: Record<string, unknown>) => {
        return (
          mockSamples.find(
            (s) =>
              s.email === query.email &&
              s.desiredGrade === query.desiredGrade &&
              s.productType === query.productType
          ) ?? null
        );
      }),
      create: vi.fn(async (doc: Record<string, unknown>) => {
        const now = new Date();
        const created = {
          ...doc,
          _id: `sample_${mockSamples.length + 1}`,
          createdAt: now,
          updatedAt: now,
        };
        mockSamples.push(created);
        return created;
      }),
      find: vi.fn(() => ({
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => [...mockSamples],
              }),
            }),
          }),
        }),
        sort: () => ({
          lean: async () => [...mockSamples],
        }),
      })),
      countDocuments: vi.fn(async () => mockSamples.length),
      findOneAndUpdate: vi.fn(
        async (filter: { referenceId: string }, update: { $set: { status: string } }) => {
          const hit = mockSamples.find((s) => s.referenceId === filter.referenceId);
          if (!hit) return null;
          hit.status = update.$set.status;
          return { select: () => ({ lean: async () => hit }) };
        }
      ),
    },
    ContactInquiryModel: {
      schema: actual.ContactInquiryModel.schema,
      findOne: vi.fn(async () => null),
      create: vi.fn(async (doc: Record<string, unknown>) => {
        const now = new Date();
        const created = {
          ...doc,
          _id: `inq_${mockInquiries.length + 1}`,
          createdAt: now,
          updatedAt: now,
        };
        mockInquiries.push(created);
        return created;
      }),
      countDocuments: vi.fn(async () => mockInquiries.length),
      find: vi.fn(() => ({
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => [...mockInquiries],
              }),
            }),
          }),
        }),
      })),
    },
  };
});

describe("Mongoose schemas, indexes, password hashing, and repository persistence", () => {
  const prevUri = process.env.MONGODB_URI;

  beforeEach(() => {
    mockLeads.length = 0;
    mockSamples.length = 0;
    mockInquiries.length = 0;
    vi.clearAllMocks();
    process.env.MONGODB_URI =
      "mongodb+srv://user:pass@cluster0.example.mongodb.net/eastfield_india";
  });

  afterEach(() => {
    if (prevUri !== undefined) {
      process.env.MONGODB_URI = prevUri;
    } else {
      delete process.env.MONGODB_URI;
    }
  });

  it("defines schemas and indexes across Lead, SampleRequest, ContactInquiry, Product, and AdminUser", () => {
    expect(LeadModel.schema.indexes().length).toBeGreaterThanOrEqual(5);
    expect(SampleRequestModel.schema.indexes().length).toBeGreaterThanOrEqual(6);
    expect(ContactInquiryModel.schema.indexes().length).toBeGreaterThanOrEqual(4);
    expect(ProductModel.schema.indexes().length).toBeGreaterThanOrEqual(3);
    expect(AdminUserModel.schema.indexes().length).toBeGreaterThanOrEqual(2);

    expect(normalizeSampleGradeCode("4 Suta")).toBe("4");
    expect(normalizeSampleGradeCode("5+ Suta")).toBe("5+");
    expect(normalizeSampleGradeCode("6+")).toBe("6+");
    expect(() => normalizeSampleGradeCode("7 Suta")).toThrow();
  });

  it("hashes and verifies AdminUser passwords securely via bcrypt", async () => {
    const hash = await hashAdminPassword("EastField#Secure2026");
    expect(hash).not.toContain("EastField#Secure2026");
    expect(await verifyAdminPassword("EastField#Secure2026", hash)).toBe(true);
    expect(await verifyAdminPassword("WrongPassword", hash)).toBe(false);
  });

  it("deduplicates Lead by email, creates linked SampleRequest and ContactInquiry, and queries paginated leads", async () => {
    const { upsertLeadRecord, queryPaginatedLeads } = await import("@/services/inquiryRepository");

    const baseLead = {
      id: "EF-20261127-MONGO1",
      visitorId: "v_abc",
      name: "Rohan Verma",
      phone: "+91 98765 43210",
      company: "Deccan Foods",
      email: "Rohan@DeccanFoods.com",
      firstVisitAt: "2026-11-27T04:00:00.000Z",
      latestVisitAt: "2026-11-27T04:00:00.000Z",
      leadSource: "entry_popup" as const,
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
    expect(mockLeads).toHaveLength(1);

    const second = await upsertLeadRecord({
      ...baseLead,
      id: "EF-20261127-MONGO2",
      email: "rohan@deccanfoods.com",
      requestedSample: true,
      sampleDetails: {
        desiredGrade: "6 Suta",
        productType: "Handpicked",
        quantity: "500 kg",
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
    expect(second.lead.id).toBe("EF-20261127-MONGO1");
    expect(second.sampleReferenceId).toBe("EFS-20261127-MONGO2");
    expect(mockLeads).toHaveLength(1);
    expect(mockSamples).toHaveLength(1);
    expect(mockSamples[0].leadCode).toBe("EF-20261127-MONGO1");
    expect(mockSamples[0].desiredGrade).toBe("6");
    expect(mockSamples[0].productType).toBe("Handpicked");

    const enquiry = await upsertLeadRecord({
      ...baseLead,
      id: "EF-20261127-INQ1",
      email: "buyer@otherfirm.com",
      leadSource: "general_enquiry",
      additionalMessage: "Interested in 5+ Suta wholesale supply.",
    });
    expect(enquiry.persisted).toBe(true);
    expect(enquiry.inquiryReferenceId).toBe("EFI-20261127-INQ1");
    expect(mockInquiries).toHaveLength(1);

    const paged = await queryPaginatedLeads({ page: 1, limit: 10 });
    expect(paged.items.length).toBe(2);
    expect(paged.total).toBe(2);
  });
});
