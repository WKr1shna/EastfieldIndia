-- PostgreSQL / Supabase schema for EastField India B2B Lead & Sample Capture
-- Connection pooling (e.g., PgBouncer / Neon / Supabase pooler) is recommended for 200+ concurrent visitors.

CREATE TABLE IF NOT EXISTS business_leads (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('General Business Enquiry', 'Request a Sample')),
  requested_grade TEXT NOT NULL DEFAULT 'Not sure',
  sample_requirement TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  additional_message TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_business_leads_submitted_at ON business_leads (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_leads_enquiry_type ON business_leads (enquiry_type);
CREATE INDEX IF NOT EXISTS idx_business_leads_email ON business_leads (email);
