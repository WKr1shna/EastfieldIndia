import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface SampleDetailsRecord {
  grade: string;
  sampleRequirement: string;
  destination: string;
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
  channel: "webhook" | "file" | "ephemeral";
}

function getStoragePath(): string {
  if (process.env.INQUIRY_STORAGE_PATH) {
    return process.env.INQUIRY_STORAGE_PATH;
  }
  return path.join(process.cwd(), ".data", "leads.ndjson");
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

/**
 * Upserts a structured business lead by leadId or normalized email so repeat actions
 * (e.g. initial welcome form followed later by Request a Sample) enrich the existing
 * lead record instead of creating duplicates.
 */
export async function upsertLeadRecord(incoming: StoredLead): Promise<StorageOutcome> {
  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;
  if (webhookUrl) {
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
        body: JSON.stringify(incoming),
      });
      if (res.ok) {
        return { persisted: true, deduplicated: false, lead: incoming, channel: "webhook" };
      }
    } catch {
      // Fall through to local persistence
    }
  }

  try {
    const existing = await readLocalLeads();
    const normalizedEmail = incoming.email.toLowerCase();
    const matchIndex = existing.findIndex(
      (item) =>
        (incoming.id && item.id === incoming.id) ||
        item.email.toLowerCase() === normalizedEmail
    );

    let savedLead = incoming;
    let deduplicated = false;

    if (matchIndex !== -1) {
      deduplicated = true;
      const prev = existing[matchIndex];
      savedLead = {
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
    "Sample Grade",
    "Sample Requirement",
    "Destination",
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
    lead.sampleDetails?.grade ?? "",
    lead.sampleDetails?.sampleRequirement ?? "",
    lead.sampleDetails?.destination ?? "",
    lead.sampleDetails?.additionalRequirements || lead.additionalMessage,
    lead.firstVisitAt,
    lead.latestVisitAt,
    lead.submittedAt,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}
