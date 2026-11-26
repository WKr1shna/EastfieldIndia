-- PostgreSQL / Supabase schema for EastField India Lead & Sample Management
-- Supports deduplication across initial entry lead capture and subsequent sample requests.

CREATE TABLE IF NOT EXISTS business_leads (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_visit_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latest_visit_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_source TEXT NOT NULL CHECK (lead_source IN ('entry_popup', 'sample_gate', 'general_enquiry')),
  skipped_initial BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_details BOOLEAN NOT NULL DEFAULT TRUE,
  requested_sample BOOLEAN NOT NULL DEFAULT FALSE,
  desired_grade TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL DEFAULT '',
  shipping_address_line_1 TEXT NOT NULL DEFAULT '',
  shipping_address_line_2 TEXT NOT NULL DEFAULT '',
  shipping_city TEXT NOT NULL DEFAULT '',
  shipping_state TEXT NOT NULL DEFAULT '',
  shipping_postal_code TEXT NOT NULL DEFAULT '',
  shipping_country TEXT NOT NULL DEFAULT '',
  sample_notes TEXT NOT NULL DEFAULT '',
  additional_message TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_business_leads_submitted_at ON business_leads (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_leads_requested_sample ON business_leads (requested_sample);
CREATE INDEX IF NOT EXISTS idx_business_leads_visitor_id ON business_leads (visitor_id);
CREATE INDEX IF NOT EXISTS idx_business_leads_company_name ON business_leads (company_name);
