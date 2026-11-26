import { appendFile, mkdir } from "fs/promises";
import path from "path";

export interface StoredLead {
  id: string;
  company: string;
  name: string;
  phone: string;
  email: string;
  enquiryType: "General Business Enquiry" | "Request a Sample";
  grade: string;
  sampleRequirement: string;
  destination: string;
  additionalMessage: string;
  submittedAt: string;
  sourceIpHash: string;
}

export interface StorageOutcome {
  persisted: boolean;
  channel: "webhook" | "file" | "ephemeral";
}

function getStoragePath(): string {
  if (process.env.INQUIRY_STORAGE_PATH) {
    return process.env.INQUIRY_STORAGE_PATH;
  }
  return path.join(process.cwd(), ".data", "leads.ndjson");
}

/**
 * Persists a structured business lead non-blockingly.
 * Uses INQUIRY_WEBHOOK_URL (e.g., managed DB / Supabase / CRM endpoint) when configured,
 * otherwise falls back to append-only NDJSON storage in local/container runtimes.
 */
export async function saveInquiryRecord(record: StoredLead): Promise<StorageOutcome> {
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
        body: JSON.stringify(record),
      });
      if (res.ok) {
        return { persisted: true, channel: "webhook" };
      }
    } catch {
      // Fall through to local non-blocking file persistence
    }
  }

  try {
    const filePath = getStoragePath();
    await mkdir(path.dirname(filePath), { recursive: true });
    await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
    return { persisted: true, channel: "file" };
  } catch {
    return { persisted: false, channel: "ephemeral" };
  }
}
