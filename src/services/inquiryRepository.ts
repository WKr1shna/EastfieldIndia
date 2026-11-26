import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getMongoLeadsCollection, isMongoConfigured } from "@/services/mongodb";

export interface ShippingAddressRecord {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SampleDetailsRecord {
  desiredGrade: string;
  productType: string;
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
  additionalMessage: string;
  submittedAt: string;
  updatedAt: string;
  sourceIpHash: string;
}

export interface StorageOutcome {
  persisted: boolean;
  deduplicated: boolean;
  lead: StoredLead;
  channel: "mongodb" | "webhook" | "file" | "ephemeral";
}

function getStoragePath(): string {
  if (process.env.INQUIRY_STORAGE_PATH) {
    return process.env.INQUIRY_STORAGE_PATH;
  }
  return path.join(process.cwd(), ".data", "leads.ndjson");
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

function stripMongoId(doc: StoredLead & { _id?: unknown }): StoredLead {
  const { _id, ...rest } = doc;
  void _id;
  return rest;
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
  const normalizedEmail = incoming.email.toLowerCase();

  // 1. Primary durable database: MongoDB Atlas (when MONGODB_URI is configured)
  if (isMongoConfigured()) {
    try {
      const collection = await getMongoLeadsCollection();
      if (collection) {
        const existing = await collection.findOne({
          $or: [...(incoming.id ? [{ id: incoming.id }] : []), { email: normalizedEmail }],
        });

        let savedLead = { ...incoming, email: normalizedEmail };
        let deduplicated = false;

        if (existing) {
          deduplicated = true;
          savedLead = mergeLeadRecord(stripMongoId(existing), savedLead);
          await collection.updateOne({ id: existing.id }, { $set: savedLead });
        } else {
          await collection.insertOne({ ...savedLead });
        }

        // Non-blocking optional CRM/Slack webhook forward if also configured
        await forwardWebhook(savedLead);

        return { persisted: true, deduplicated, lead: savedLead, channel: "mongodb" };
      }
    } catch {
      // Fall through to secondary storage channels if MongoDB is temporarily unreachable
    }
  }

  // 2. Webhook-only fallback when configured without MongoDB
  if (await forwardWebhook(incoming)) {
    return { persisted: true, deduplicated: false, lead: incoming, channel: "webhook" };
  }

  // 3. Local NDJSON file storage fallback
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
      deduplicated = true;
      savedLead = mergeLeadRecord(existing[matchIndex], incoming);
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
}

export async function queryLeadRecords(filters: LeadQueryFilters = {}): Promise<StoredLead[]> {
  if (isMongoConfigured()) {
    try {
      const collection = await getMongoLeadsCollection();
      if (collection) {
        const query: Record<string, unknown> = {};
        if (filters.requestedSample === "true") query.requestedSample = true;
        if (filters.requestedSample === "false") query.requestedSample = false;
        if (filters.dateFrom || filters.dateTo) {
          const submittedAtRange: Record<string, string> = {};
          if (filters.dateFrom) submittedAtRange.$gte = filters.dateFrom;
          if (filters.dateTo) submittedAtRange.$lte = filters.dateTo;
          query.submittedAt = submittedAtRange;
        }

        const docs = await collection.find(query).sort({ submittedAt: -1 }).toArray();
        return docs.map(stripMongoId);
      }
    } catch {
      // Fall through to local file query
    }
  }

  const leads = await readLocalLeads();

  return leads
    .filter((lead) => {
      if (filters.requestedSample === "true" && !lead.requestedSample) return false;
      if (filters.requestedSample === "false" && lead.requestedSample) return false;
      if (filters.dateFrom && lead.submittedAt < filters.dateFrom) return false;
      if (filters.dateTo && lead.submittedAt > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
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
