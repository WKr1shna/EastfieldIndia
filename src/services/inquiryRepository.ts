import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { MAKHANA_GRADES } from "@/features/products/grades";
import {
  ContactInquiryModel,
  LeadModel,
  ProductModel,
  SampleRequestModel,
  normalizeSampleGradeCode,
  type SampleGradeCode,
  type SampleRequestStatus,
} from "@/models";
import { normalizeMobileDigits, normalizeMobileDisplay } from "@/models/Lead";
import { connectToDatabase, isMongoConfigured } from "@/services/mongoose";

export interface ShippingAddressRecord {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SampleDetailsRecord {
  gstNumber: string;
  desiredGrade: string;
  productType: "Regular" | "Handpicked" | string;
  quantity?: string;
  shippingAddress: ShippingAddressRecord;
  additionalRequirements: string;
}

export interface StoredLead {
  id: string;
  visitorId: string;
  name: string;
  phone: string;
  company: string;
  email: string;
  firstVisitAt: string;
  latestVisitAt: string;
  leadSource: "entry_popup" | "sample_gate" | "general_enquiry";
  skippedInitial: boolean;
  submittedDetails: boolean;
  requestedSample: boolean;
  sampleDetails: SampleDetailsRecord | null;
  subject?: string;
  additionalMessage: string;
  submittedAt: string;
  updatedAt: string;
  sourceIpHash: string;
}

export type DuplicateCode =
  | "DUPLICATE_ENTRY_LEAD"
  | "DUPLICATE_SAMPLE_REQUEST"
  | "DUPLICATE_INQUIRY";

export interface StorageOutcome {
  persisted: boolean;
  deduplicated: boolean;
  duplicateBlocked?: boolean;
  duplicateCode?: DuplicateCode;
  duplicateReferenceId?: string;
  duplicateMessage?: string;
  lead: StoredLead;
  sampleReferenceId?: string;
  inquiryReferenceId?: string;
  channel: "mongodb" | "webhook" | "file" | "ephemeral";
}

function getStoragePath(): string {
  if (process.env.INQUIRY_STORAGE_PATH) {
    return process.env.INQUIRY_STORAGE_PATH;
  }
  return path.join(process.cwd(), ".data", "leads.ndjson");
}

function mapLeadSourceToDb(
  source: StoredLead["leadSource"],
  requestedSample: boolean
): "popup" | "sample_gate" | "sample_request" | "contact_form" {
  if (source === "entry_popup") return "popup";
  if (source === "sample_gate") return "sample_gate";
  if (requestedSample) return "sample_request";
  return "contact_form";
}

function mapDbSourceToLegacy(
  source: string
): "entry_popup" | "sample_gate" | "general_enquiry" {
  if (source === "popup") return "entry_popup";
  if (source === "sample_gate") return "sample_gate";
  return "general_enquiry";
}

function mergeLeadRecord(prev: StoredLead, incoming: StoredLead): StoredLead {
  return {
    ...prev,
    visitorId: incoming.visitorId || prev.visitorId,
    name: incoming.name || prev.name,
    phone: incoming.phone || prev.phone,
    company: incoming.company || prev.company,
    latestVisitAt: incoming.latestVisitAt || incoming.updatedAt,
    skippedInitial: prev.skippedInitial || incoming.skippedInitial,
    submittedDetails: prev.submittedDetails || incoming.submittedDetails,
    requestedSample: prev.requestedSample || incoming.requestedSample,
    sampleDetails: incoming.sampleDetails ?? prev.sampleDetails,
    additionalMessage: incoming.additionalMessage || prev.additionalMessage,
    updatedAt: incoming.updatedAt,
    sourceIpHash: incoming.sourceIpHash,
  };
}

async function readLocalLeads(): Promise<StoredLead[]> {
  try {
    const raw = await readFile(/*turbopackIgnore: true*/ getStoragePath(), "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as StoredLead);
  } catch {
    return [];
  }
}

async function writeLocalLeads(leads: StoredLead[]): Promise<void> {
  const filePath = getStoragePath();
  await mkdir(/*turbopackIgnore: true*/ path.dirname(filePath), { recursive: true });
  const content = leads.map((l) => JSON.stringify(l)).join("\n") + (leads.length ? "\n" : "");
  await writeFile(/*turbopackIgnore: true*/ filePath, content, "utf8");
}

async function forwardWebhook(lead: StoredLead): Promise<boolean> {
  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;
  if (!webhookUrl) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.INQUIRY_WEBHOOK_SECRET) {
      headers["X-EastField-Signature"] = process.env.INQUIRY_WEBHOOK_SECRET;
    }
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(lead),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function upsertLeadRecord(incoming: StoredLead): Promise<StorageOutcome> {
  const normalizedEmail = incoming.email.trim().toLowerCase();
  const displayMobile = normalizeMobileDisplay(incoming.phone);
  const mobileNormalized = normalizeMobileDigits(incoming.phone);

  // 1. Primary durable database via Mongoose models (Lead, SampleRequest, ContactInquiry)
  if (isMongoConfigured()) {
    try {
      const conn = await connectToDatabase();
      if (!conn) {
        return { persisted: false, deduplicated: false, lead: incoming, channel: "ephemeral" };
      }

      const existingLead = await LeadModel.findOne({
        $or: [
          ...(incoming.id ? [{ leadId: incoming.id }] : []),
          { email: normalizedEmail },
        ],
      });

      const isPureLeadCapture =
        !incoming.requestedSample && incoming.leadSource !== "general_enquiry";

      // Block duplicate entry/popup lead submissions cleanly when Lead already exists
      if (existingLead && isPureLeadCapture) {
        return {
          persisted: false,
          deduplicated: true,
          duplicateBlocked: true,
          duplicateCode: "DUPLICATE_ENTRY_LEAD",
          duplicateReferenceId: existingLead.leadId,
          duplicateMessage: `Your business details are already registered with EastField India (Reference: ${existingLead.leadId}). You can continue exploring or request a sample directly.`,
          lead: incoming,
          channel: "mongodb",
        };
      }

      const dedupeWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const rapidWindowStart = new Date(Date.now() - 60 * 1000);

      // Check for duplicate sample request or duplicate contact inquiry BEFORE mutating Lead
      if (incoming.requestedSample && incoming.sampleDetails) {
        const gradeCode = normalizeSampleGradeCode(incoming.sampleDetails.desiredGrade);
        const rawProductType = incoming.sampleDetails.productType;
        if (rawProductType !== "Regular" && rawProductType !== "Handpicked") {
          throw new Error(`Invalid product type: ${rawProductType}`);
        }
        const productType: "Regular" | "Handpicked" = rawProductType;

        const existingSample = await SampleRequestModel.findOne({
          email: normalizedEmail,
          desiredGrade: gradeCode,
          productType,
          $or: [
            { status: { $in: ["pending", "reviewed"] } },
            { createdAt: { $gte: dedupeWindowStart } },
          ],
        });

        if (existingSample) {
          return {
            persisted: false,
            deduplicated: true,
            duplicateBlocked: true,
            duplicateCode: "DUPLICATE_SAMPLE_REQUEST",
            duplicateReferenceId: existingSample.referenceId,
            duplicateMessage: `A sample request for this grade and product type has already been submitted with your email (Reference: ${existingSample.referenceId}). Our team is already reviewing your request.`,
            lead: incoming,
            channel: "mongodb",
          };
        }
      } else if (incoming.leadSource === "general_enquiry") {
        const normalizedMsg = (incoming.additionalMessage || "").trim();
        const existingInquiry = await ContactInquiryModel.findOne({
          email: normalizedEmail,
          $or: [
            {
              message: normalizedMsg,
              status: { $in: ["new", "reviewed"] },
            },
            { createdAt: { $gte: rapidWindowStart } },
          ],
        });

        if (existingInquiry) {
          return {
            persisted: false,
            deduplicated: true,
            duplicateBlocked: true,
            duplicateCode: "DUPLICATE_INQUIRY",
            duplicateReferenceId: existingInquiry.referenceId,
            duplicateMessage: `We have already received this enquiry from your email (Reference: ${existingInquiry.referenceId}). Our team will connect with you shortly.`,
            lead: incoming,
            channel: "mongodb",
          };
        }
      }

      let leadDoc = existingLead;
      let deduplicated = false;

      if (existingLead) {
        deduplicated = true;
        existingLead.fullName = incoming.name || existingLead.fullName;
        existingLead.mobile = displayMobile || existingLead.mobile;
        existingLead.mobileNormalized = mobileNormalized || existingLead.mobileNormalized;
        existingLead.companyName = incoming.company || existingLead.companyName;
        existingLead.visitorId = incoming.visitorId || existingLead.visitorId;
        existingLead.latestVisitAt = incoming.latestVisitAt || incoming.updatedAt;
        existingLead.skippedInitial = existingLead.skippedInitial || incoming.skippedInitial;
        existingLead.sourceIpHash = incoming.sourceIpHash || existingLead.sourceIpHash;
        if (incoming.requestedSample && existingLead.status === "new") {
          existingLead.status = "qualified";
        }
        leadDoc = await existingLead.save();
      } else {
        leadDoc = await LeadModel.create({
          leadId: incoming.id,
          fullName: incoming.name,
          mobile: displayMobile,
          mobileNormalized,
          companyName: incoming.company,
          email: normalizedEmail,
          source: mapLeadSourceToDb(incoming.leadSource, incoming.requestedSample),
          status: incoming.requestedSample ? "qualified" : "new",
          visitorId: incoming.visitorId,
          firstVisitAt: incoming.firstVisitAt,
          latestVisitAt: incoming.latestVisitAt,
          skippedInitial: incoming.skippedInitial,
          sourceIpHash: incoming.sourceIpHash,
        });
      }

      let sampleReferenceId: string | undefined;
      let inquiryReferenceId: string | undefined;

      if (incoming.requestedSample && incoming.sampleDetails) {
        const gradeCode = normalizeSampleGradeCode(incoming.sampleDetails.desiredGrade);
        const productType = incoming.sampleDetails.productType as "Regular" | "Handpicked";
        const sampleRef = `EFS-${incoming.id.replace(/^EF-/, "")}`;
        const createdSample = await SampleRequestModel.create({
          referenceId: sampleRef,
          leadId: leadDoc._id,
          leadCode: leadDoc.leadId,
          fullName: leadDoc.fullName,
          mobile: leadDoc.mobile,
          companyName: leadDoc.companyName,
          email: normalizedEmail,
          gstNumber: incoming.sampleDetails.gstNumber.trim().toUpperCase(),
          desiredGrade: gradeCode,
          productType,
          quantity: incoming.sampleDetails.quantity || "",
          additionalRequirements: incoming.sampleDetails.additionalRequirements || "",
          shippingAddress: incoming.sampleDetails.shippingAddress,
          status: "pending",
          sourceIpHash: incoming.sourceIpHash,
        });
        sampleReferenceId = createdSample.referenceId;
      } else if (incoming.leadSource === "general_enquiry") {
        const inquiryRef = `EFI-${incoming.id.replace(/^EF-/, "")}`;
        const createdInquiry = await ContactInquiryModel.create({
          referenceId: inquiryRef,
          leadId: leadDoc._id,
          leadCode: leadDoc.leadId,
          name: leadDoc.fullName,
          email: normalizedEmail,
          mobile: leadDoc.mobile,
          companyName: leadDoc.companyName,
          subject: incoming.subject || "General Business Enquiry",
          message: incoming.additionalMessage || "",
          source: "contact_form",
          status: "new",
          sourceIpHash: incoming.sourceIpHash,
        });
        inquiryReferenceId = createdInquiry.referenceId;
      }

      const savedLead: StoredLead = {
        ...incoming,
        id: leadDoc.leadId,
        name: leadDoc.fullName,
        phone: leadDoc.mobile,
        company: leadDoc.companyName,
        email: leadDoc.email,
        requestedSample: Boolean(incoming.requestedSample || sampleReferenceId),
        submittedAt:
          leadDoc.createdAt instanceof Date
            ? leadDoc.createdAt.toISOString()
            : incoming.submittedAt,
        updatedAt:
          leadDoc.updatedAt instanceof Date
            ? leadDoc.updatedAt.toISOString()
            : incoming.updatedAt,
      };

      await forwardWebhook(savedLead);

      return {
        persisted: true,
        deduplicated,
        lead: savedLead,
        sampleReferenceId,
        inquiryReferenceId,
        channel: "mongodb",
      };
    } catch (err) {
      const errorName = err instanceof Error ? err.name : "UnknownError";
      console.error("[EastField Repository] MongoDB persistence failed:", errorName);
      // Strict integrity: when MONGODB_URI is configured and fails, report failure rather than faking success
      return { persisted: false, deduplicated: false, lead: incoming, channel: "ephemeral" };
    }
  }

  // 2. Webhook-only persistence when MongoDB is not configured
  if (await forwardWebhook(incoming)) {
    return { persisted: true, deduplicated: false, lead: incoming, channel: "webhook" };
  }

  // 3. Local NDJSON file storage fallback (for local development / file-mode tests without MongoDB)
  try {
    const existing = await readLocalLeads();
    const matchIndex = existing.findIndex(
      (item) =>
        (incoming.id && item.id === incoming.id) ||
        item.email.toLowerCase() === normalizedEmail
    );

    let savedLead = incoming;
    let deduplicated = false;

    if (matchIndex !== -1) {
      const prev = existing[matchIndex];
      const isPureLeadCapture =
        !incoming.requestedSample && incoming.leadSource !== "general_enquiry";

      if (isPureLeadCapture) {
        return {
          persisted: false,
          deduplicated: true,
          duplicateBlocked: true,
          duplicateCode: "DUPLICATE_ENTRY_LEAD",
          duplicateReferenceId: prev.id,
          duplicateMessage: `Your business details are already registered with EastField India (Reference: ${prev.id}). You can continue exploring or request a sample directly.`,
          lead: incoming,
          channel: "file",
        };
      }

      if (
        incoming.requestedSample &&
        incoming.sampleDetails &&
        prev.requestedSample &&
        prev.sampleDetails &&
        prev.sampleDetails.desiredGrade === incoming.sampleDetails.desiredGrade &&
        prev.sampleDetails.productType === incoming.sampleDetails.productType
      ) {
        return {
          persisted: false,
          deduplicated: true,
          duplicateBlocked: true,
          duplicateCode: "DUPLICATE_SAMPLE_REQUEST",
          duplicateReferenceId: prev.id,
          duplicateMessage: `A sample request for this grade and product type has already been submitted with your email (Reference: ${prev.id}). Our team is already reviewing your request.`,
          lead: incoming,
          channel: "file",
        };
      }

      if (
        incoming.leadSource === "general_enquiry" &&
        prev.leadSource === "general_enquiry" &&
        !prev.requestedSample &&
        (prev.additionalMessage || "").trim().toLowerCase() ===
          (incoming.additionalMessage || "").trim().toLowerCase()
      ) {
        return {
          persisted: false,
          deduplicated: true,
          duplicateBlocked: true,
          duplicateCode: "DUPLICATE_INQUIRY",
          duplicateReferenceId: prev.id,
          duplicateMessage: `We have already received this enquiry from your email (Reference: ${prev.id}). Our team will connect with you shortly.`,
          lead: incoming,
          channel: "file",
        };
      }

      deduplicated = true;
      savedLead = mergeLeadRecord(prev, incoming);
      existing[matchIndex] = savedLead;
    } else {
      existing.push(savedLead);
    }

    await writeLocalLeads(existing);
    return { persisted: true, deduplicated, lead: savedLead, channel: "file" };
  } catch {
    return { persisted: false, deduplicated: false, lead: incoming, channel: "ephemeral" };
  }
}

export interface LeadQueryFilters {
  dateFrom?: string;
  dateTo?: string;
  requestedSample?: "true" | "false";
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function queryPaginatedLeads(
  filters: LeadQueryFilters = {}
): Promise<PaginatedResult<StoredLead>> {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 25)));

  if (isMongoConfigured()) {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.requestedSample === "true") query.status = "qualified";
    if (filters.dateFrom || filters.dateTo) {
      const range: Record<string, Date> = {};
      if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) range.$lte = new Date(filters.dateTo);
      query.createdAt = range;
    }

    const total = await LeadModel.countDocuments(query);
    const docs = await LeadModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const emails = docs.map((d) => d.email);
    const sampleDocs =
      emails.length > 0
        ? await SampleRequestModel.find({ email: { $in: emails } })
            .sort({ createdAt: -1 })
            .lean()
        : [];

    const latestSampleByEmail = new Map<string, (typeof sampleDocs)[number]>();
    for (const s of sampleDocs) {
      if (!latestSampleByEmail.has(s.email)) {
        latestSampleByEmail.set(s.email, s);
      }
    }

    let items: StoredLead[] = docs.map((doc) => {
      const sample = latestSampleByEmail.get(doc.email);
      return {
        id: doc.leadId,
        visitorId: doc.visitorId || "",
        name: doc.fullName,
        phone: doc.mobile,
        company: doc.companyName,
        email: doc.email,
        firstVisitAt: doc.firstVisitAt || "",
        latestVisitAt: doc.latestVisitAt || "",
        leadSource: mapDbSourceToLegacy(doc.source),
        skippedInitial: Boolean(doc.skippedInitial),
        submittedDetails: true,
        requestedSample: Boolean(sample),
        sampleDetails: sample
          ? {
              gstNumber: sample.gstNumber || "",
              desiredGrade: sample.desiredGrade,
              productType: sample.productType,
              quantity: sample.quantity || "",
              shippingAddress: {
                addressLine1: sample.shippingAddress.addressLine1,
                addressLine2: sample.shippingAddress.addressLine2 || "",
                city: sample.shippingAddress.city,
                state: sample.shippingAddress.state,
                postalCode: sample.shippingAddress.postalCode,
                country: sample.shippingAddress.country,
              },
              additionalRequirements: sample.additionalRequirements || "",
            }
          : null,
        additionalMessage: "",
        submittedAt:
          doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date().toISOString(),
        updatedAt:
          doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : new Date().toISOString(),
        sourceIpHash: "",
      };
    });

    if (filters.requestedSample === "false") {
      items = items.filter((item) => !item.requestedSample);
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  const leads = await readLocalLeads();
  const filtered = leads
    .filter((lead) => {
      if (filters.requestedSample === "true" && !lead.requestedSample) return false;
      if (filters.requestedSample === "false" && lead.requestedSample) return false;
      if (filters.dateFrom && lead.submittedAt < filters.dateFrom) return false;
      if (filters.dateTo && lead.submittedAt > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

export async function queryLeadRecords(filters: LeadQueryFilters = {}): Promise<StoredLead[]> {
  const result = await queryPaginatedLeads({ ...filters, page: 1, limit: filters.limit ?? 100 });
  return result.items;
}

export interface SampleRequestQueryFilters {
  status?: SampleRequestStatus;
  desiredGrade?: SampleGradeCode;
  productType?: "Regular" | "Handpicked";
  country?: string;
  page?: number;
  limit?: number;
}

export async function queryPaginatedSampleRequests(filters: SampleRequestQueryFilters = {}) {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 25)));

  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.desiredGrade) query.desiredGrade = filters.desiredGrade;
  if (filters.productType) query.productType = filters.productType;
  if (filters.country) query["shippingAddress.country"] = filters.country;

  const [total, items] = await Promise.all([
    SampleRequestModel.countDocuments(query),
    SampleRequestModel.find(query)
      .select("-sourceIpHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function updateSampleRequestStatus(
  referenceId: string,
  status: SampleRequestStatus
) {
  await connectToDatabase();
  return SampleRequestModel.findOneAndUpdate(
    { referenceId },
    { $set: { status } },
    { new: true, runValidators: true }
  )
    .select("-sourceIpHash")
    .lean();
}

export async function queryPaginatedContactInquiries(filters: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 25)));

  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;

  const [total, items] = await Promise.all([
    ContactInquiryModel.countDocuments(query),
    ContactInquiryModel.find(query)
      .select("-sourceIpHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Idempotently syncs the website's verified grade lineup into the `products` collection
 * without inventing specs or stock numbers.
 */
export async function syncProductCatalog() {
  await connectToDatabase();

  const gradeMap: Record<string, "4" | "4+" | "5" | "5+" | "6" | "6+" | "custom"> = {
    "4-suta": "4",
    "5-suta": "5",
    "6-suta": "6",
    "6-plus-suta": "6+",
    custom: "custom",
  };

  const operations = MAKHANA_GRADES.map((grade, index) => ({
    updateOne: {
      filter: { slug: grade.id },
      update: {
        $set: {
          slug: grade.id,
          name: grade.name,
          grade: gradeMap[grade.id] ?? "custom",
          productTypes: ["Regular", "Handpicked"],
          shortLabel: grade.shortLabel,
          description: grade.useCase,
          specifications: {
            sizingContext: grade.sizingContext,
            packagingContext: grade.packagingContext,
            originRegion: "Purnea & Katihar, Bihar",
            productNature: "Guilt-Free · Gluten-Free",
          },
          image: grade.image,
          imageAlt: grade.imageAlt,
          isActive: true,
          displayOrder: index + 1,
        },
      },
      upsert: true,
    },
  }));

  await ProductModel.bulkWrite(operations);
  return ProductModel.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
}

function escapeCsvCell(value: string | boolean): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function serializeLeadsToCsv(leads: StoredLead[]): string {
  const headers = [
    "ID",
    "Full Name",
    "Mobile Number",
    "Company Name",
    "Email",
    "Lead Source",
    "Skipped Initial",
    "Submitted Details",
    "Requested Sample",
    "GST No.",
    "Desired Grade",
    "Product Type",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State / Province",
    "Postal / PIN Code",
    "Country",
    "Additional Message",
    "First Visit",
    "Latest Visit",
    "Submitted At",
  ];

  const rows = leads.map((lead) => [
    lead.id,
    lead.name,
    lead.phone,
    lead.company,
    lead.email,
    lead.leadSource,
    lead.skippedInitial,
    lead.submittedDetails,
    lead.requestedSample,
    lead.sampleDetails?.gstNumber ?? "",
    lead.sampleDetails?.desiredGrade ?? "",
    lead.sampleDetails?.productType ?? "",
    lead.sampleDetails?.shippingAddress?.addressLine1 ?? "",
    lead.sampleDetails?.shippingAddress?.addressLine2 ?? "",
    lead.sampleDetails?.shippingAddress?.city ?? "",
    lead.sampleDetails?.shippingAddress?.state ?? "",
    lead.sampleDetails?.shippingAddress?.postalCode ?? "",
    lead.sampleDetails?.shippingAddress?.country ?? "",
    lead.sampleDetails?.additionalRequirements || lead.additionalMessage,
    lead.firstVisitAt,
    lead.latestVisitAt,
    lead.submittedAt,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}
