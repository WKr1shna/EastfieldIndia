import type { StoredLead } from "@/services/inquiryRepository";

export interface EmailOutcome {
  sent: boolean;
  provider: "resend" | "none";
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendInquiryNotification(lead: StoredLead): Promise<EmailOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_TO_EMAIL;
  const fromEmail = process.env.INQUIRY_FROM_EMAIL || "inquiries@eastfieldindia.com";

  if (!apiKey || !toEmail) {
    return { sent: false, provider: "none" };
  }

  const isSample = lead.enquiryType === "Request a Sample";

  const rows: Array<[string, string]> = [
    ["Reference ID", lead.id],
    ["Enquiry Type", lead.enquiryType],
    ["Company Name", lead.company],
    ["Contact Name", lead.name],
    ["Mobile Number", lead.phone],
    ["Email Address", lead.email],
    ...(isSample
      ? ([
          ["Requested Grade", lead.grade || "Not sure"],
          ["Sample Requirement", lead.sampleRequirement || "Not specified"],
          ["Shipping Destination", lead.destination || "Not specified"],
        ] as Array<[string, string]>)
      : []),
    ["Additional Message", lead.additionalMessage || "None"],
    ["Submitted At", lead.submittedAt],
  ];

  const htmlRows = rows
    .map(
      ([label, val]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e4decb;font-weight:600;color:#193A31;width:210px;">${escapeHtml(
          label
        )}</td><td style="padding:8px 12px;border-bottom:1px solid #e4decb;color:#243832;">${escapeHtml(
          val
        )}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#F5F1E5;padding:24px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #ded6c1;border-radius:10px;overflow:hidden;">
        <div style="background:#0B3027;color:#F5F1E5;padding:20px 24px;">
          <div style="font-size:12px;letter-spacing:0.14em;color:#C6A45C;text-transform:uppercase;">EastField India · ${escapeHtml(
            lead.enquiryType
          )}</div>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;">${escapeHtml(
            lead.company
          )} — ${escapeHtml(lead.name)}</h1>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${htmlRows}</table>
      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: lead.email,
        subject: `[EastField ${isSample ? "Sample Request" : "Business Enquiry"}] ${lead.company}`,
        html,
      }),
    });

    return { sent: response.ok, provider: "resend" };
  } catch {
    return { sent: false, provider: "resend" };
  }
}
