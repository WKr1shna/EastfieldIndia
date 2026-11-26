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

  const label = lead.requestedSample
    ? "Request a Sample"
    : lead.leadSource === "entry_popup"
    ? "Website Entry Lead"
    : "General Business Enquiry";

  const rows: Array<[string, string]> = [
    ["Reference ID", lead.id],
    ["Lead Category", label],
    ["Full Name", lead.name],
    ["Mobile Number", lead.phone],
    ["Company Name", lead.company],
    ["Email Address", lead.email],
    ["Lead Source", lead.leadSource],
    ...(lead.requestedSample && lead.sampleDetails
      ? ([
          ["Desired Makhana Grade", lead.sampleDetails.desiredGrade],
          ["Product Type", lead.sampleDetails.productType],
          ["Address Line 1", lead.sampleDetails.shippingAddress.addressLine1],
          [
            "Address Line 2",
            lead.sampleDetails.shippingAddress.addressLine2 || "Not specified",
          ],
          ["City", lead.sampleDetails.shippingAddress.city],
          ["State / Province / Region", lead.sampleDetails.shippingAddress.state],
          ["Postal Code / PIN Code", lead.sampleDetails.shippingAddress.postalCode],
          ["Country", lead.sampleDetails.shippingAddress.country],
          [
            "Additional Requirements",
            lead.sampleDetails.additionalRequirements || "None",
          ],
        ] as Array<[string, string]>)
      : []),
    ["Additional Message", lead.additionalMessage || "None"],
    ["First Visit", lead.firstVisitAt],
    ["Submitted At", lead.submittedAt],
  ];

  const htmlRows = rows
    .map(
      ([col, val]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e4decb;font-weight:600;color:#193A31;width:210px;">${escapeHtml(
          col
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
            label
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
        subject: `[EastField ${label}] ${lead.company} (${lead.name})`,
        html,
      }),
    });

    return { sent: response.ok, provider: "resend" };
  } catch {
    return { sent: false, provider: "resend" };
  }
}
