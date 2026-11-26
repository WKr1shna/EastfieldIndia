import { appendFile, mkdir } from "fs/promises";
import path from "path";
import type { InquiryPayload } from "@/validations/inquiry";

export interface StoredInquiry extends Omit<InquiryPayload, "website" | "formStartedAt"> {
  id: string;
  submittedAt: string;
  sourceIpHash: string;
}

export interface StorageOutcome {
  persisted: boolean;
  channel: "file" | "webhook" | "ephemeral";
}

function getStoragePath(): string {
  if (process.env.INQUIRY_STORAGE_PATH) {
    return process.env.INQUIRY_STORAGE_PATH;
  }
  return path.join(process.cwd(), ".data", "inquiries.ndjson");
}

export async function saveInquiryRecord(record: StoredInquiry): Promise<StorageOutcome> {
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
